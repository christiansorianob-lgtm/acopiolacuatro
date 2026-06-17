"use client";

import { useEffect } from "react";

export function ClientPrint() {
  useEffect(() => {
    // Wait a brief moment to ensure fonts/layout are rendered
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
