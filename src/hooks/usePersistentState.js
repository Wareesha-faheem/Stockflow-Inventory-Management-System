import { useEffect, useState } from "react";

// Drop-in replacement for useState that persists to localStorage.
// Falls back silently to plain in-memory state if storage is unavailable.
function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage full / disabled - app keeps working in-memory
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;