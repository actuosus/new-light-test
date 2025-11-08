import Bull from "bull";
import { env } from "prisma/config";

export const createQueue = (name: string) => new Bull(name, env("REDIS_URL"));
