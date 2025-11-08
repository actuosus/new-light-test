import { logger } from "../../../shared/infrastructure/logging/logger";
import { Task } from "../../domain/Task";
import { TaskDueCheckScheduler } from "../../domain/TaskDueCheckScheduler";
import { taskDueCheckQueue } from "./taskDueCheckQueue";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const QUEUE_NAME = "send-task-due-date";

export class BullTaskDueCheckScheduler implements TaskDueCheckScheduler {
  constructor() {
    taskDueCheckQueue.process(QUEUE_NAME, async (job) => {
      logger.info(`notification:send:task-due-date-queue`, job.data);

      return Promise.resolve();
    });
  }

  async scheduleCheck(task: Task): Promise<void> {
    if (!task.dueDate) {
      await this.cancel(task.id);
      return;
    }

    const now = Date.now();
    const due = task.dueDate.getTime();

    if (due <= now) {
      await this.cancel(task.id);
      return;
    }

    const target = due - ONE_DAY_MS;
    let delay = target - now;

    if (delay < 0 || delay < ONE_DAY_MS) {
      delay = 0;
    }

    await this.cancel(task.id);

    await taskDueCheckQueue.add(QUEUE_NAME, task, {
      jobId: task.id,
      delay,
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });
  }

  async cancel(taskId: string): Promise<void> {
    await taskDueCheckQueue.removeJobs(taskId).catch(() => {});
  }
}
