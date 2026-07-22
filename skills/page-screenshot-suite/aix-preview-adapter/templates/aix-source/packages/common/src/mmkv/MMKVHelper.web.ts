type StoredValue = string | number | boolean;

class PreviewMMKV {
  private values = new Map<string, StoredValue>();

  set(key: string, value: StoredValue): void {
    this.values.set(key, value);
  }

  getString(key: string): string | undefined {
    const value = this.values.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  getNumber(key: string): number | undefined {
    const value = this.values.get(key);
    return typeof value === 'number' ? value : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.values.get(key);
    return typeof value === 'boolean' ? value : undefined;
  }

  contains(key: string): boolean {
    return this.values.has(key);
  }

  delete(key: string): void {
    this.values.delete(key);
  }

  clearAll(): void {
    this.values.clear();
  }

  getAllKeys(): string[] {
    return [...this.values.keys()];
  }
}

class MMKVHelper {
  private static instance: MMKVHelper | null = null;
  private stores = new Map<string, PreviewMMKV>();

  static getInstance(): MMKVHelper {
    MMKVHelper.instance ??= new MMKVHelper();
    return MMKVHelper.instance;
  }

  getMMKV(name = 'aix_default'): PreviewMMKV {
    if (!this.stores.has(name)) {
      this.stores.set(name, new PreviewMMKV());
    }
    return this.stores.get(name)!;
  }

  getDefaultMMKV(): PreviewMMKV {
    return this.getMMKV('default');
  }

  clearMMKV(name: string): void {
    this.getMMKV(name).clearAll();
  }

  deleteMMKV(name: string): void {
    this.stores.delete(name);
  }

  getAllInstanceNames(): string[] {
    return [...this.stores.keys()];
  }
}

export default MMKVHelper;
