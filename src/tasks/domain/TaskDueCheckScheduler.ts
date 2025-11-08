import type { Task } from "./Task";

export interface TaskDueCheckScheduler {
  scheduleCheck(task: Task): Promise<void>;
  cancel(taskId: string): Promise<void>;
}
