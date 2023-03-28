import { convertIncomingMessageToRequest } from "./incoming-to-request.js";
import { convertResponseToOutgoingMessage } from "./response-to-outgoing.js";

/**
 * Converts a listener that responsds to fetch API `Request`s to Node.js http-style API.
 * The returned function can be used with `http.createServer` and `http.Server().on("request")`.
 *
 * @example
 * import { createServer } from 'node:http';
 * import { convertServer } from 'universal-http';
 *
 * createServer(convertServer(async request => {
 *   return Response.json({ text: "Hello world!" });
 * }));
 *
 * @param {(request: Request) => Response | PromiseLike<Response>} listener
 * @returns {import('node:http').RequestListener} Node.js request handler that can be passed to `createServer` from `node:http`.
 */
export function convertServer(listener) {
  return function convertedRequestListener(req, res) {
    const request = convertIncomingMessageToRequest(req);
    Promise.resolve()
      .then(() => listener(request))
      .then((response) => convertResponseToOutgoingMessage(response, res));
  };
}
