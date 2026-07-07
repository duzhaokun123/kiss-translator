import { fnPolyfill } from "./fetch";
import { fetchTextResponseHandle } from "./request";
import { MSG_FETCH_TEXT_RESPONSE } from "../config";

type RequestInitCompat = RequestInit & {
  /**
   * 超时毫秒
   */
  timeout?: number;
};

async function fetch(
  url: string | URL,
  options: RequestInitCompat
): Promise<Response> {
  if (url instanceof URL) url = url.toString();
  const resp: {
    body: ArrayBuffer,
    headers: [string, string][],
    status: number,
    statusText: string,
  } = await fnPolyfill({
    fn: fetchTextResponseHandle,
    msg: MSG_FETCH_TEXT_RESPONSE,
    // @ts-ignore
    input: url,
    init: options,
  });
  return new Response(resp.body, {
    headers: resp.headers,
    status: resp.status,
    statusText: resp.statusText,
  });
}

export default fetch;
export type { RequestInitCompat };
