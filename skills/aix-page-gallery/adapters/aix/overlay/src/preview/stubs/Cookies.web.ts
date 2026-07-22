type Cookie = Record<string, unknown>;
const store = new Map<string, Record<string, Cookie>>();
const CookieManager = {
  get: async (url: string) => store.get(url) ?? {},
  set: async (url: string, cookie: Cookie) => {
    const current = store.get(url) ?? {};
    const name = String(cookie.name ?? 'preview');
    current[name] = cookie;
    store.set(url, current);
    return true;
  },
  clearAll: async () => { store.clear(); return true; },
  removeSessionCookies: async () => true,
  flush: async () => undefined,
  getAll: async () => Object.fromEntries(store),
};
export default CookieManager;
