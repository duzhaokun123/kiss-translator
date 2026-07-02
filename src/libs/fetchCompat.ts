import { fetchPatcher } from "./fetch";

type RequestInitCompat = RequestInit & {
  /**
   * 超时毫秒
   */
  timeout?: number;
};

function fetch(url: string, options: RequestInitCompat): Promise<Response> {
  return fetchPatcher(url, options);
}

export default fetch;
export type { RequestInitCompat };
