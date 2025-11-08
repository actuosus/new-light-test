import { createQueue } from "../../../shared/infrastructure/queue";

export interface TaskDueCheckJobData {
  taskId: string;
}

export const taskDueCheckQueue = createQueue("task-due-check");
