import { Elysia } from "elysia";
import { logger } from "../../infrastructure/logging/pino";

const startTimes = new WeakMap<Request, number>();

export const loggerPlugin = new Elysia({ name: "logger-plugin" })
  .decorate("logger", logger)

  .onRequest(({ request, logger }) => {
    startTimes.set(request, Date.now());

    logger.info(
      {
        method: request.method,
        url: request.url,
      },
      "request:start"
    );
  })

  .onAfterHandle(({ request, set, body, logger }) => {
    const start = startTimes.get(request) ?? Date.now();
    const duration = Date.now() - start;
    const status = set.status ?? 200;

    logger.info(
      {
        method: request.method,
        url: request.url,
        status,
        duration,
      },
      "request:end"
    );

    if (logger.isLevelEnabled("debug") && body && typeof body === "object") {
      logger.debug({ body }, "response:body");
    }
  })

  .onError(({ request, set, error, logger }) => {
    const status = set.status ?? 500;

    const err = error as Error;

    logger.error(
      {
        method: request.method,
        url: request.url,
        status,
        message: err?.message,
        stack: err?.stack,
      },
      "request:error"
    );
  });
