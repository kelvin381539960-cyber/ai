export type SaveFileAction = 'send' | 'cancel';
export type SaveFileTarget = 'album' | 'document' | 'cache';
export interface SaveFileChunkParams {
  taskId: string;
  action?: SaveFileAction;
  chunkIndex?: number;
  totalChunks?: number;
  data?: string;
  mimeType?: string;
  fileName?: string;
  saveTarget?: SaveFileTarget;
}
export enum SaveFileErrorCode {
  InvalidParams = 'INVALID_PARAMS',
  InvalidChunkIndex = 'INVALID_CHUNK_INDEX',
  ChunkDataEmpty = 'CHUNK_DATA_EMPTY',
  TaskNotFound = 'TASK_NOT_FOUND',
  SaveFailed = 'SAVE_FAILED',
  Unknown = 'UNKNOWN',
}
export type SaveFileChunkResult =
  | { status: 'receiving'; receivedCount: number }
  | { status: 'saved'; fileName: string; fileUri?: string }
  | { status: 'failed'; errorCode: SaveFileErrorCode; message: string };
export type SaveFileChunkCallback = (result: SaveFileChunkResult) => void;

export function createSaveFileMethods() {
  async function saveFileChunk(params: SaveFileChunkParams, callback: SaveFileChunkCallback) {
    if (params.action === 'cancel') return;
    callback({
      status: 'saved',
      fileName: params.fileName ?? `preview-${params.taskId}.bin`,
      fileUri: 'about:blank',
    });
  }
  return { saveFileChunk, clearAllChunks: () => undefined };
}
