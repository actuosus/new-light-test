# [New Light Test Task](https://new-light-test-task.vercel.app/)

Service using [Elysia](https://elysiajs.com/) framework and [Prisma ORM](https://www.prisma.io/) to manage tasks, with some queue processing using [Bull](https://www.npmjs.com/package/bull).

Swagger UI documentation is available at deployed at https://new-light-test-task.vercel.app/swagger.

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

Open http://localhost:3000/swagger to see the Swagger UI documentation.

## Deployment
To deploy this template to production, run:
```bash
bun run build
```

Then run:
```bash
bun run start
```
This will start the server in production mode.

## Testing

To run tests, use:
```bash
bun test
```
