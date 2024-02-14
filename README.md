## Loading data

- The given dump file did not contain the create table query
- So I have created a new seed file with create table query as well
- Then we used docker-entrypoint-initdb.d/seed.sql to seed our database

## Tech stack

- Node.js 18
- bun as a package manager
- postgres database
- fastify server
- zod for runtime validation

## Folder Structure

- config: environment, server, routes and database configuration
- lib: framework layer code
- modules: contains routes, validation and controller for each of the function unit
- services: external services like cache, s3, sms, and etc goes here
- types: enums and globally used types
- utils: helper functions

## To run the application

```
bun install
bun run build:dev
```

## To load test specific APIs

- 100 loyalty requests with 10 concurrency

```bash
autocannon -a 100 -c 10 http://localhost:3000/transactions/loyalty-score/d5959d72-cd15-4ff7-9305-ad9b0fa4250b
```

- top users requests for month - 10, and year - 2023

```bash
autocannon -a 1000 -c 100 http://localhost:3000/transactions/top-users?month=10&year=2023
```

- highest transaction hours for year - 2023

```bash
autocannon -a 1000 -c 100 http://localhost:3000/transactions/highest-trans-hour?year=2023
```
