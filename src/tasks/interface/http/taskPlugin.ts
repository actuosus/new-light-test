import type { PrismaClient } from "@prisma/client";
import { Elysia } from "elysia";
import { CreateTask } from "../../application/use-cases/CreateTask";
import { DeleteTask } from "../../application/use-cases/DeleteTask";
import { GetTask } from "../../application/use-cases/GetTask";
import { ListTasks } from "../../application/use-cases/ListTasks";
import { UpdateTask } from "../../application/use-cases/UpdateTask";
import { BullTaskDueCheckScheduler } from "../../infrastructure/queue/BullTaskDueCheckScheduler";
import { PrismaTaskRepository } from "../../infrastructure/repositories/PrismaTaskRepository";

const createTaskUseCases = (db: PrismaClient) => {
  const repo = new PrismaTaskRepository(db);
  const dueCheckScheduler = new BullTaskDueCheckScheduler();

  return {
    create: new CreateTask(repo, dueCheckScheduler),
    get: new GetTask(repo),
    list: new ListTasks(repo),
    update: new UpdateTask(repo, dueCheckScheduler),
    delete: new DeleteTask(repo),
  };
};

export const createTaskPlugin = (db: PrismaClient) => {
  const taskUseCases = createTaskUseCases(db);

  return new Elysia({
    name: "task-plugin",
    seed: "tasks",
  }).decorate("taskUseCases", taskUseCases);
};

export type TaskUseCases = ReturnType<typeof createTaskUseCases>;
