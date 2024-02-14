# Loading data
- The given dump file did not contain the create table query
- So I have created a new seed file with create table query as well
- Then we used docker-entrypoint-initdb.d/seed.sql to seed our database

# Tech stack
- Node.js 18
- bun as a package manager
- postgres database
- fastify server
- zod for runtime validation

### To run the application

```
bun install
bun run build:dev
```
