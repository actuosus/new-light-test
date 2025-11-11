import { t } from "elysia";
import { Task } from "../../domain/Task";

export namespace TaskModel {
  export const notFoundResponse = t.Object(
    {
      status: t.String({ examples: ["error"] }),
      message: t.String({ examples: ["Task not found"] }),
    },
    {
      description: "Task not found error",
    }
  );
  export const internalServerErrorResponse = t.Object(
    {
      status: t.String({ examples: ["error"] }),
      message: t.String({ examples: ["Internal Server Error"] }),
    },
    {
      description: "Internal Server Error",
    }
  );

  export const TaskSchema = {
    id: t.String({
      format: "uuid",
      title: "Task ID",
      description: "Unique identifier of the task",
      examples: [crypto.randomUUID()],
    }),
    title: t.String({
      title: "Task Title",
      description: "Title of the task",
      examples: ["Schedule an appointment with the psychiatrist"],
    }),
    description: t.Nullable(
      t.String({
        title: "Task Description",
        description: "Description of the task",
        examples: ["Remember to bring previous medical records."],
      })
    ),
    status: t.Union(
      [
        t.Literal("pending", { description: "Pending tasks" }),
        t.Literal("in_progress", { description: "In progress tasks" }),
        t.Literal("completed", { description: "Completed tasks" }),
      ],
      {
        title: "Task Status",
        description: "Current status of the task",
      }
    ),
    dueDate: t.Nullable(
      t.String({
        format: "date-time",
        title: "Due Date",
        description: "Due date of the task",
        examples: [new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()],
      })
    ),
  };

  export const createBody = t.Object({
    title: t.String({
      title: "Task Title",
      description: "Title of the task",
      examples: ["Schedule an appointment with the psychiatrist"],
      minLength: 1,
    }),
    description: t.Optional(
      t.String({
        title: "Task Description",
        description: "Description of the task",
        examples: ["Remember to bring previous medical records."],
      })
    ),
    dueDate: t.Optional(
      t.Date({
        title: "Due Date",
        description: "Due date of the task",
        examples: [new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()],
      })
    ),
  });

  export type createBody = typeof createBody.static;

  export const getAllParams = t.Object({
    status: t.Optional(
      t.Union(
        [
          t.Literal("pending", { description: "Pending tasks" }),
          t.Literal("in_progress", { description: "In progress tasks" }),
          t.Literal("completed", { description: "Completed tasks" }),
        ],
        { description: "Filter by task status" }
      )
    ),
  });

  export type getAllParams = typeof getAllParams.static;

  export const getParams = t.Object({
    id: t.String({
      format: "uuid",
      title: "Task ID",
      description: "Unique identifier of the task",
      examples: [crypto.randomUUID()],
    }),
  });

  export type getParams = typeof getParams.static;

  export const updateParams = t.Object({
    id: t.String({
      format: "uuid",
      title: "Task ID",
      description: "Unique identifier of the task to update",
      examples: [crypto.randomUUID()],
    }),
  });

  export type updateParams = typeof updateParams.static;

  export const updateBody = t.Object({
    title: t.String({
      title: "Task Title",
      description: "Title of the task to update",
      examples: ["Reschedule an appointment with the psychologist"],
      minLength: 1,
    }),
    description: t.Optional(
      t.String({
        title: "Task Description",
        description: "Description of the task to update",
        examples: ["Remember to bring previous medical records."],
      })
    ),
    status: t.Optional(
      t.Union(
        [
          t.Literal("pending", { description: "Pending tasks" }),
          t.Literal("in_progress", { description: "In progress tasks" }),
          t.Literal("completed", { description: "Completed tasks" }),
        ],
        { title: "Task Status", description: "Status of the task to update" }
      )
    ),
    dueDate: t.Optional(
      t.Date({
        title: "Due Date",
        description: "Due date of the task to update",
        examples: [new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()],
      })
    ),
  });

  export type updateBody = typeof updateBody.static;

  export const deleteParams = t.Object({
    id: t.String({
      format: "uuid",
      title: "Task ID",
      description: "Unique identifier of the task to delete",
      examples: [crypto.randomUUID()],
    }),
  });

  export type deleteParams = typeof deleteParams.static;

  export const toTaskDto = (task: Task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  });

  export const toTaskListDto = (tasks: Task[]) => tasks.map(toTaskDto);
}
