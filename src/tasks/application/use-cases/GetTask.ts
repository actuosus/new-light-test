import type { TaskId } from "../../domain/Task";
import type { TaskRepository } from "../../domain/TaskRepository";

export class GetTask {
  constructor(private readonly repo: TaskRepository) {}

  async execute(id: TaskId) {
    const task = await this.repo.findById(id);

    return task;
  }
}
