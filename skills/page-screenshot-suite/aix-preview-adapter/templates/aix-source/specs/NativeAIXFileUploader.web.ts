const NativeAIXFileUploader = {
  upload: async () => JSON.stringify({
    statusCode: 200,
    body: JSON.stringify({ code: 'SUCCESS', data: { fileId: 'preview-file' } }),
  }),
  cancel: () => undefined,
  addListener: () => undefined,
  removeListeners: () => undefined,
};

export default NativeAIXFileUploader;
