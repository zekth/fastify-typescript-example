# Fastify TypeScript container example

This project assumes you already have your development environment installed with:

- [nvm](https://github.com/nvm-sh/nvm)
- [docker](https://www.docker.com/)

**Note**: For Windows users it **should** work, but using an interpreter like git bash or using WSL is advised.

So first of all to setup the env properly you should run:
```bash
nvm use # for git bash users run "nvm use $(cat .nvmrc)"
npm i
```

## Development

TypeScript builds can be a bit complicated when you want to go deep and wire other tools to it, like runtime watcher, test runner, debugger and so on. There is no perfect solution; so here is an example of a working project which is (similarely) used in production.

### start

```
npm start
```
This command will build the TypeScript project, copy the assets of the projects (located in ./src/assets), and run the application. So let's explain each step properly:

```json
{
  "start": "npm run build && npm run serve",
  "build": "tsc --incremental --sourceMap && npm run copy:assets",
  "copy:assets": "mkdir -p dist/assets && cp -R src/assets/ dist/assets/",
  "serve": "node -r source-map-support/register -r dotenv/config dist/app.js",
}
```
First we call **build**: which is calling the `tsc` cli to transpile the code. `--sourcemap` flag allows us to create the source map to have an easiness to debug our transpiled code. `--incremental` will be covered in a further explanation below. **copy:assets** is a simple copy of files.

**serve**: starts the node process but also registers 2 tools which are the sourcemap support we activated via `tsc` and dotenv configuration. dotenv allows developer to inject environment variable using files and not cli, which is a great productivity tool. See [documentation](https://github.com/motdotla/dotenv)

### dev:inspect

This script is similar to `npm start` but also adds the flag `--inspect` to the node process. This makes node process listenning to client debugger. See [documentation](https://nodejs.org/en/docs/guides/debugging-getting-started/). For example VsCode have the `autoAttach` feature which makes the IDE debugger automaticaly attach to the process for further debugging. See [documentation](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_auto-attach)

### watch:*

Watch commands run the scripts explained before through [nodemon](https://github.com/remy/nodemon), so when a change occurs on the source code the process is automatically restarted to take the changes in consideration. That's when `--incremental` flag from `tsc` is used; it will make possible to transpile only the code which has changed and not the entire project.

### Why is build and build:ci different?

`build` uses `--incremental --sourceMap` flags which creates `tsbuild.info`, `*.map` files which we don't want in production. Why not having 2 `tsconfig` files? We can, but by experience having just one `tsconfig` and adding flag is easier to maintain.

## Docker

### Dockerfile

### Build

```
docker build -t test_fastify --build-arg NODE_VERSION=$(cat .nvmrc) --build-arg GIT_COMMIT=2 .
```

### Usage

```
  docker run --init my-new-image
```
