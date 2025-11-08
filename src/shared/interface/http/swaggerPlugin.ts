import swagger from "@elysiajs/swagger";

export const swaggerPlugin = swagger({
  exclude: ["/swagger"],
  autoDarkMode: true,
  documentation: {
    info: {
      title: "New Light Task Service",
      description:
        "New Light Test Task Service built with Elysia Framework, demonstrating task management with logging and queue processing.",
      version: "0.1.0",
      license: {
        name: "MIT",
        url: "https://opensource.org/license/mit/",
      },
      contact: {
        name: "Arthur Chafonov",
        url: "https://www.linkedin.com/in/actuosus/",
      },
    },
    externalDocs: {
      url: "https://github.com/actuosus/new-light-test",
      description: "GitHub repository",
    },
    tags: [
      {
        name: "Tasks",
        description:
          "Task service endpoints that goes with create, read, update, and delete operations.",
      },
    ],
  },
});
