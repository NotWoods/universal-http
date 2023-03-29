import { createServer } from "node:http";
import { promisify } from "node:util";
import { URLPattern } from "urlpattern-polyfill";
import { convertServer } from "../src/convert-server.js";
import test from "ava";

/**
 * Wraps `createServer` with promisified methods.
 * @param {import('node:http').RequestListener} listener
 * @returns {{
 *   server: import('node:http').Server,
 *   listen: (port?: number, hostname?: string) => Promise<void>,
 *   close: () => Promise<void>,
 * }}
 */
function createPromisifiedServer(listener) {
  const server = createServer(listener);
  return {
    server,
    listen: promisify(server.listen.bind(server)),
    close: promisify(server.close.bind(server)),
  };
}

/** @type {ReturnType<typeof createPromisifiedServer> | undefined} */
let server;

test.afterEach(async () => {
  if (server?.server.listening) {
    await server.close();
  }
});

test("convertServer handles request/response", async (t) => {
  const json = new URLPattern({ pathname: "/json" });
  const text = new URLPattern({ pathname: "/text" });
  server = createPromisifiedServer(
    convertServer((request) => {
      if (json.test(request.url)) {
        return Response.json({ data: "Hello world!" });
      } else if (text.test(request.url)) {
        return new Response("Hello world");
      } else {
        return new Response("Not found", {
          status: 404,
        });
      }
    })
  );
  await server.listen(3456);

  const responseJson = await fetch("http://localhost:3456/json");
  t.is(responseJson.status, 200);
  t.is(responseJson.headers.get("content-type"), "application/json");
  t.deepEqual(await responseJson.json(), { data: "Hello world!" });

  const responseText = await fetch("http://localhost:3456/text");
  t.is(responseText.status, 200);
  t.is(responseText.headers.get("content-type"), "text/plain;charset=UTF-8");
  t.is(await responseText.text(), "Hello world");

  const responseNotFound = await fetch("http://localhost:3456/404");
  t.is(responseNotFound.status, 404);
});
