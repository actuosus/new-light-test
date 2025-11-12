import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { db } from "./shared/infrastructure/db/drizzle";
import { logger } from "./shared/infrastructure/logging/pino";
import { loggerPlugin } from "./shared/interface/http/loggerPlugin";
import { swaggerPlugin } from "./shared/interface/http/swaggerPlugin";
import { createTaskRoutes } from "./tasks/interface/http/routes";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = new Elysia();

app.use(staticPlugin({ assets: ".vercel/output/static", prefix: "/" }));
app.get("/", () => "Hello! It's New Light Task Test Service!");
app.use(loggerPlugin);
app.use(swaggerPlugin);
app.use(createTaskRoutes(db));

const isVercel =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.NOW_REGION) ||
  Boolean(process.env.VERCEL_REGION) ||
  Boolean(process.env.VERCEL);

if (!isVercel) {
  app.listen(PORT);
  logger.info(
    {
      port: app.server?.port,
      hostname: app.server?.hostname,
    },
    "🦊 Elysia service started"
  );
}

export const fetch = app.fetch;
