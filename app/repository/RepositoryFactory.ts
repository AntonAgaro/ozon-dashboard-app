import type { $Fetch, NitroFetchOptions } from 'nitropack';

export abstract class RepositoryFactory {
  private readonly fetch: $Fetch;

  constructor(fetch: $Fetch) {
    this.fetch = fetch;
  }

  protected async call<T>(url: string, options: NitroFetchOptions<any> = {}): Promise<T> {
    const res = await this.fetch<T>(url, options).catch((e) => {
      console.log(`API ERROR: ${e}`);
    });
    return res as T;
  }
}
