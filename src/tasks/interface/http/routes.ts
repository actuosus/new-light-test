import type { PrismaClient } from "@prisma/client";
import { Elysia, t } from "elysia";
import { TaskModel } from "./dto";
import { createTaskPlugin } from "./taskPlugin";

const INSTANCE_NAME = "task-routes";
const TASKS_PREFIX = "/tasks";

export const createTaskRoutes = (db: PrismaClient) => {
  return (
    new Elysia({
      name: INSTANCE_NAME,
      prefix: TASKS_PREFIX,
    })
      .use(createTaskPlugin(db))
      .model("Task", t.Object(TaskModel.TaskSchema))
      // List
      .get(
        "",
        async ({ taskUseCases, query, set }) => {
          try {
            const tasks = await taskUseCases.list.execute(query);
            return TaskModel.toTaskListDto(tasks);
          } catch (error) {
            set.status = 500;
            return {
              status: "error",
              message: "Internal Server Error",
            };
          }
        },
        {
          query: TaskModel.getAllParams,
          response: {
            200: t.Array(t.Object(TaskModel.TaskSchema), {
              description: "List of task objects",
            }),
            500: t.Object(
              {
                status: t.String({ examples: ["error"] }),
                message: t.String({ examples: ["Internal Server Error"] }),
              },
              {
                description: "Internal Server Error",
              }
            ),
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
        async ({ taskUseCases, params, set }) => {
          try {
            const task = await taskUseCases.get.execute(params.id);
            if (!task) {
              set.status = 404;
              return {
                status: "error",
                message: "Task not found",
              };
            }
            return TaskModel.toTaskDto(task);
          } catch {
            set.status = 500;
            return {
              status: "error",
              message: "Internal Server Error",
            };
          }
        },
        {
          params: TaskModel.getParams,
          response: {
            200: t.Object(TaskModel.TaskSchema, {
              description: "Retrieved task object",
            }),
            404: t.Object(
              {
                status: t.String({ examples: ["error"] }),
                message: t.String({ examples: ["Task not found"] }),
              },
              {
                description: "Task not found error",
              }
            ),
            500: t.Object(
              {
                status: t.String({ examples: ["error"] }),
                message: t.String({ examples: ["Internal Server Error"] }),
              },
              {
                description: "Internal Server Error",
              }
            ),
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
        async ({ body, taskUseCases, set }) => {
          const id = crypto.randomUUID();
          const dueDate = body.dueDate ? new Date(body.dueDate) : null;

          const task = await taskUseCases.create.execute({
            id,
            title: body.title,
            description: body.description,
            dueDate,
          });

          set.status = 201;
          return TaskModel.toTaskDto(task);
        },
        {
          body: TaskModel.createBody,
          response: {
            201: t.Object(TaskModel.TaskSchema, {
              description: "Created task object",
            }),
            500: t.Object(
              {
                status: t.String({ examples: ["error"] }),
                message: t.String({ examples: ["Internal Server Error"] }),
              },
              {
                description: "Internal Server Error",
              }
            ),
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
        async ({ body, params, taskUseCases, set }) => {
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
              set.status = 404;
              return {
                status: "error",
                message: "Task not found",
              };
            }

            return TaskModel.toTaskDto(task);
          } catch {
            set.status = 500;
            return {
              status: "error",
              message: "Internal Server Error",
            };
          }
        },
        {
          params: TaskModel.updateParams,
          body: TaskModel.updateBody,
          response: {
            200: t.Object(TaskModel.TaskSchema, {
              description: "Updated task object",
            }),
            404: t.Object(
              {
                status: t.String({ examples: ["error"] }),
                message: t.String({ examples: ["Task not found"] }),
              },
              {
                description: "Task not found error",
              }
            ),
            500: t.Object(
              {
                status: t.String({ examples: ["error"] }),
                message: t.String({ examples: ["Internal Server Error"] }),
              },
              {
                description: "Internal Server Error",
              }
            ),
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
        async ({ params, taskUseCases, set }) => {
          await taskUseCases.delete.execute(params.id);
          set.status = 204;
        },
        {
          params: TaskModel.deleteParams,
          response: {
            204: t.Any({ default: "", description: "No content" }),
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
