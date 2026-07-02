import { fetchPatcher } from "./fetch";

type RequestInitCompat = RequestInit & {
  /**
   * 超时毫秒
   */
  timeout?: number;
};

function fetch(
  url: string | URL,
  options: RequestInitCompat
): Promise<Response> {
  if (url instanceof URL) url = url.toString();
  return fetchPatcher(url, options);
}

export default fetch;
export type { RequestInitCompat };
