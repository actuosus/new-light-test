FROM oven/bun:latest

WORKDIR /app

# Install dependencies (cacheable)
COPY package.json bun.lockb* ./
RUN bun install --production

# Copy application source
COPY . .

ENV PORT=3000
EXPOSE 3000

# Expect a "start" script in package.json (fallback: run index.ts)
CMD ["sh", "-lc", "if [ -f package.json ] && grep -q '\"start\"' package.json 2>/dev/null; then bun run start; elif [ -f src/server.ts ]; then bun src/server.ts; else bun index.ts; fi"]