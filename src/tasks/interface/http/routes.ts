import type { PrismaClient } from "@prisma/client";
import { type Context, Elysia, t } from "elysia";
import { TaskModel } from "./dto";
import { createTaskPlugin } from "./taskPlugin";
import { logger } from "../../../shared/infrastructure/logging/logger";

const INSTANCE_NAME = "task-routes";
const TASKS_PREFIX = "/tasks";

export const createTaskRoutes = (db: PrismaClient) => {
  const createErrorBody = (message: string) => ({
    status: "error",
    message,
  });
  const createNotFoundBody = (set: Context["set"]) => {
    set.status = 404;
    return createErrorBody("Task not found");
  };
  const createInternalServerErrorBody = (set: Context["set"]) => {
    set.status = 500;
    return createErrorBody("Internal Server Error");
  };

  return (
    new Elysia({
      name: INSTANCE_NAME,
      prefix: TASKS_PREFIX,
    })
      .decorate("logger", logger)
      .use(createTaskPlugin(db))
      .model(
        "Task",
        t.Object(TaskModel.TaskSchema, {
          title: "Task",
          description: "Task model",
        })
      )
      // List
      .get(
        "",
        async ({ taskUseCases, query, set, logger }) => {
          try {
            const tasks = await taskUseCases.list.execute(query);
            return TaskModel.toTaskListDto(tasks);
          } catch (error) {
            logger.error("Error listing tasks:", error);
            return createInternalServerErrorBody(set);
          }
        },
        {
          query: TaskModel.getAllParams,
          response: {
            200: t.Array(t.Object(TaskModel.TaskSchema), {
              description: "List of task objects",
            }),
            500: TaskModel.internalServerErrorResponse,
          },
          detail: {
            tags: ["Tasks"],
            summary: "List all tasks",
            description:
              "Retrieve a list of all tasks. Optionally, filter tasks by their status using the `status` query parameter.",
          },
        }
      )

      // Get by id
      .get(
        "/:id",
        async ({ taskUseCases, params, set, logger }) => {
          try {
            const task = await taskUseCases.get.execute(params.id);
            if (!task) {
              return createNotFoundBody(set);
            }
            return TaskModel.toTaskDto(task);
          } catch (error) {
            logger.error("Error getting task:", error);
            return createInternalServerErrorBody(set);
          }
        },
        {
          params: TaskModel.getParams,
          response: {
            200: t.Object(TaskModel.TaskSchema, {
              description: "Retrieved task object",
            }),
            404: TaskModel.notFoundResponse,
            500: TaskModel.internalServerErrorResponse,
          },
          detail: {
            tags: ["Tasks"],
            summary: "Get a task by its ID",
            description:
              "Retrieve a single task using its unique identifier provided in the URL path parameter.",
          },
        }
      )

      // Create
      .post(
        "",
        async ({ body, taskUseCases, set, logger }) => {
          const id = crypto.randomUUID();
          const dueDate = body.dueDate ? new Date(body.dueDate) : null;

          try {
            const task = await taskUseCases.create.execute({
              id,
              title: body.title,
              description: body.description,
              dueDate,
            });

            set.status = 201;
            return TaskModel.toTaskDto(task);
          } catch (error) {
            logger.error("Error creating task:", error);
            return createInternalServerErrorBody(set);
          }
        },
        {
          body: TaskModel.createBody,
          response: {
            201: t.Object(TaskModel.TaskSchema, {
              description: "Created task object",
            }),
            500: TaskModel.internalServerErrorResponse,
          },
          detail: {
            tags: ["Tasks"],
            summary: "Create a new task",
            description:
              "Create a new task by providing the title, optional description, and optional due date in the request body.",
          },
        }
      )

      // Update
      .put(
        "/:id",
        async ({ body, params, taskUseCases, set, logger }) => {
          try {
            const dueDate =
              body.dueDate === undefined
                ? undefined
                : body.dueDate
                ? new Date(body.dueDate)
                : null;

            const task = await taskUseCases.update.execute({
              id: params.id,
              title: body.title,
              description: body.description,
              status: body.status,
              dueDate,
            });

            if (!task) {
              return createNotFoundBody(set);
            }

            return TaskModel.toTaskDto(task);
          } catch (error) {
            logger.error("Error updating task:", error);
            return createInternalServerErrorBody(set);
          }
        },
        {
          params: TaskModel.updateParams,
          body: TaskModel.updateBody,
          response: {
            200: t.Object(TaskModel.TaskSchema, {
              description: "Updated task object",
            }),
            404: TaskModel.notFoundResponse,
            500: TaskModel.internalServerErrorResponse,
          },
          detail: {
            tags: ["Tasks"],
            summary: "Update an existing task",
            description:
              "Update an existing task by providing its ID in the URL path parameter and the updated fields in the request body.",
          },
        }
      )

      // Delete
      .delete(
        "/:id",
        async ({ params, taskUseCases, set, logger }) => {
          try {
            const task = await taskUseCases.delete.execute(params.id);
            if (!task) {
              return createNotFoundBody(set);
            }
            set.status = 204;
          } catch (error) {
            logger.error("Error deleting task:", error);
            return createInternalServerErrorBody(set);
          }
        },
        {
          params: TaskModel.deleteParams,
          response: {
            204: t.Any({ default: "", description: "No content" }),
            404: TaskModel.notFoundResponse,
            500: TaskModel.internalServerErrorResponse,
          },
          detail: {
            tags: ["Tasks"],
            summary: "Delete a task by its ID",
            description:
              "Delete a task by providing its ID in the URL path parameter.",
          },
        }
      )
  );
};
