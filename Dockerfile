FROM oven/bun:latest

WORKDIR /app

# Install dependencies (cacheable)
COPY package.json bun.lockb* drizzle.config.ts ./

# Copy application source
COPY . .

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

RUN bun install

ENV PORT=3000
EXPOSE 3000

# Expect a "start" script in package.json (fallback: run index.ts)
CMD ["sh", "-lc", "if [ -f package.json ] && grep -q '\"start\"' package.json 2>/dev/null; then bun run migrate && bun run start; elif [ -f src/server.ts ]; then bun src/server.ts; else bun index.ts; fi"]