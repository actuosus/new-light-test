import type { Task, TaskId, TaskStatus } from "./Task";

export interface TaskRepository {
  findById(id: TaskId): Promise<Task | null>;
  findAll({ status }: { status?: TaskStatus }): Promise<Task[]>;
  create(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  delete(id: TaskId): Promise<Task | void>;
}
