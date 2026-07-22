import { setGlobalRequestClient } from '@aix/common';
import type { RequestClient, RequestConfig } from '@aix/common';
import { createPreviewResponse } from '@/preview/PreviewFixtures';

export const API_URL = 'preview://aix-api';
export const H5_URL = 'about:blank';

function respond(url: string, config?: RequestConfig): Promise<string> {
  config?.onProgress?.(100);
  return Promise.resolve(createPreviewResponse(url));
}

const previewClient: RequestClient = {
  get: (url, _body, config) => respond(url, config),
  post: (url, _body, config) => respond(url, config),
  put: (url, _body, config) => respond(url, config),
  delete: (url, config) => respond(url, config),
};

setGlobalRequestClient(previewClient);

export default previewClient;
