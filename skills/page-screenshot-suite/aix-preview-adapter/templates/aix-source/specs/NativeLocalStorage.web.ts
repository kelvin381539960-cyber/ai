const values = new Map<string, string | boolean>();
const NativeLocalStorage = {
  setItem: (value: string, key: string) => values.set(key, value),
  setBool: (value: boolean, key: string) => values.set(key, value),
  getItem: (key: string) => typeof values.get(key) === 'string' ? values.get(key) as string : null,
  getBool: (key: string) => typeof values.get(key) === 'boolean' ? values.get(key) as boolean : null,
  getItemWithCallback: (key: string, callback: (error: string | null, result: string | null) => void) => callback(null, typeof values.get(key) === 'string' ? values.get(key) as string : null),
  getItemWithPromise: async (key: string) => typeof values.get(key) === 'string' ? values.get(key) as string : null,
  removeItem: (key: string) => values.delete(key),
  clear: () => values.clear(),
};
export default NativeLocalStorage;
