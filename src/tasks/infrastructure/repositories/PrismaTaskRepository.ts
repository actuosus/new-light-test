import {
  PrismaClient,
  Task as PrismaTask,
} from "../../../generated/prisma/client";
import { logger } from "../../../shared/infrastructure/logging/pino";
import { Task, type TaskId, type TaskStatus } from "../../domain/Task";
import type { TaskRepository } from "../../domain/TaskRepository";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export class PrismaTaskRepository implements TaskRepository {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  private toDomain(record: PrismaTask): Task {
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
    const record = await this.db.task.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll({ status }: { status?: TaskStatus } = {}): Promise<Task[]> {
    const records = await this.db.task.findMany({
      where: status ? { status } : undefined,
    });
    return records.map(this.toDomain);
  }

  async save(task: Task): Promise<void> {
    await this.db.task.upsert({
      where: { id: task.id },
      update: task,
      create: task,
    });
  }

  async create(task: Task): Promise<void> {
    this.save(task);
  }

  async update(task: Task): Promise<void> {
    this.save(task);
  }

  async delete(id: TaskId): Promise<Task | void> {
    if (!isUuid(id)) {
      logger.warn({ id }, "Attempted delete with invalid UUID");
      throw new Error("Invalid task id format");
    }

    try {
      const task = await this.db.task.delete({ where: { id } });
      return this.toDomain(task);
    } catch (e: any) {
      if (e.code === "P2025") {
        logger.debug({ id }, "Delete on non-existent task");
        return;
      }
      logger.error({ id, error: e }, "Error deleting task");
      throw e;
    }
  }
}
