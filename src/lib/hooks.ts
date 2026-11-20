import { useEffect, useState } from "react";

export function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem("ae:" + key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem("ae:" + key, JSON.stringify(v)); } catch { /* private mode */ }
  }, [key, v]);
  return [v, setV] as const;
}
