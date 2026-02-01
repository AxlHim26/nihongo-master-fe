import * as React from "react";

type HotkeyHandler = (event: KeyboardEvent) => void;

export const useHotkeys = (key: string, handler: HotkeyHandler) => {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMatch =
        (key === "mod+k" && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") ||
        event.key.toLowerCase() === key.toLowerCase();

      if (isMatch) {
        handler(event);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler, key]);
};
