import { createJSONStorage } from "zustand/middleware";

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  key: () => null,
  length: 0,
  clear: () => {},
};

const storage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return noopStorage;
  }
  return window.localStorage;
});

export default storage;
