import { useEffect } from 'react';
import type { RefObject } from "react";

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void
): void => {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};