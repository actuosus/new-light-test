import { eq } from "drizzle-orm";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { logger } from "../../../shared/infrastructure/logging/logger";
import {
  Task,
  TaskProps,
  type TaskId,
  type TaskStatus,
} from "../../domain/Task";
import type { TaskRepository } from "../../domain/TaskRepository";
import { tasks } from "../db/drizzle/schema";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export class DrizzleTaskRepository implements TaskRepository {
  private db: NodePgDatabase;

  constructor(db: NodePgDatabase) {
    this.db = db;
  }

  private toDomain(record: TaskProps): Task {
    return Task.restore({
      id: record.id,
      title: record.title,
      description: record.description ?? undefined,
      status: record.status as TaskStatus,
      dueDate: record.dueDate ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findById(id: TaskId): Promise<Task | null> {
    const record = (
      await this.db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1)
        .execute()
    )[0];
    return record ? this.toDomain(record) : null;
  }

  async findAll({ status }: { status?: TaskStatus } = {}): Promise<Task[]> {
    const records = await this.db
      .select()
      .from(tasks)
      .where(status ? eq(tasks.status, status) : undefined);
    return records.map(this.toDomain);
  }

  async create(task: Task): Promise<void> {
    await this.db.insert(tasks).values(task);
  }

  async update(task: Task): Promise<void> {
    await this.db.update(tasks).set(task).where(eq(tasks.id, task.id));
  }

  async delete(id: TaskId): Promise<Task | void> {
    if (!isUuid(id)) {
      logger.warn("Attempted delete with invalid UUID", { id });
      throw new Error("Invalid task id format");
    }

    try {
      const deletedTasks = await this.db
        .delete(tasks)
        .where(eq(tasks.id, id))
        .returning();

      const task = deletedTasks[0];

      if (!task) {
        logger.debug("Delete on non-existent task", { id });
        return;
      }

      return this.toDomain(task);
    } catch (e: any) {
      if (e.code === "P2025") {
        logger.debug("Delete on non-existent task", { id });
        return;
      }
      logger.error("Error deleting task", { id, error: e });
      throw e;
    }
  }
}
