import { TaskDueCheckScheduler } from "../../domain/TaskDueCheckScheduler";
import { Task } from "../../domain/Task";
import type { TaskRepository } from "../../domain/TaskRepository";

export class CreateTask {
  constructor(
    private readonly repo: TaskRepository,
    private readonly dueCheckScheduler: TaskDueCheckScheduler
  ) {}

  async execute(input: {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date | null;
  }) {
    const task = Task.create(input);

    await this.repo.create(task);
    this.dueCheckScheduler.scheduleCheck(task);

    return task;
  }
}
