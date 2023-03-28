import { Readable } from "node:stream";

/**
 * Convert a Node.js `IncomingMessage` into a fetch API `Request`.
 * @param {import('node:http').IncomingMessage} message
 */
export function convertIncomingMessageToRequest(message) {
  return new Request(convertUrl(message), {
    body:
      message.method === "GET" || message.method === "HEAD"
        ? null
        : Readable.toWeb(message),
    headers: convertIncomingHeaders(message.headersDistinct),
    method: message.method,
  });
}

/**
 * @param {import('node:http').IncomingMessage} message
 */
export function convertUrl(message) {
  return new URL(message.url, `http://${message.headers.host}`);
}

/**
 * @param {Record<keyof import('node:http').IncomingHttpHeaders, string[]>} incoming
 * @returns {Headers}
 */
function convertIncomingHeaders(incoming) {
  const headers = new Headers();
  Object.entries(incoming).forEach(([name, values]) => {
    values.forEach((part) => headers.append(name, part));
  });
  return headers;
}
