import { pipeline } from "node:stream/promises";

/**
 * Write data from a fetch API `Response` to a Node.js `ServerResponse`.
 * @param {Response} response
 * @param {import('node:http').ServerResponse} outgoing
 */
export async function convertResponseToOutgoingMessage(response, outgoing) {
  response.headers.forEach((value, name) => {
    outgoing.appendHeader(name, value);
  });
  outgoing.writeHead(response.status, response.statusText);
  if (response.body) {
    await pipeline(response.body, outgoing);
  } else {
    await new Promise(
      /** @param {(_: void) => void} resolve */
      (resolve) => outgoing.end(resolve)
    );
  }
}
