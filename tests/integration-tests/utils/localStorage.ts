const localStorageMock = (() => {
  let store: Record<string, any> = {};

  return {
    getItem: (key: string) =>
      store[key] || null,
    setItem: (key: string, value: any) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) =>
      store.delete(key),
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});
