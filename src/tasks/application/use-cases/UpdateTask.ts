import { TaskDueCheckScheduler } from "../../domain/TaskDueCheckScheduler";
import type { TaskId, TaskStatus } from "../../domain/Task";
import type { TaskRepository } from "../../domain/TaskRepository";

export class UpdateTask {
  constructor(
    private readonly repo: TaskRepository,
    private readonly dueCheckScheduler: TaskDueCheckScheduler
  ) {}

  async execute(input: {
    id: TaskId;
    title?: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: Date | null;
  }) {
    const task = await this.repo.findById(input.id);
    if (!task) return null;

    task.update({
      title: input.title,
      description: input.description,
      status: input.status,
      dueDate: input.dueDate,
    });

    await this.repo.update(task);
    this.dueCheckScheduler.scheduleCheck(task);

    return task;
  }
}
