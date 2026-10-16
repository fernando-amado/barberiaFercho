"use client";

import { useEffect, useState } from "react";

const TEXT = "Hola EDteam";
const INTERVAL_MS = 100;

export default function HolaTypewriter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(TEXT.length);
      return;
    }
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev + 1 >= TEXT.length) clearInterval(timer);
        return prev + 1;
      });
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <h1 aria-label={TEXT} className="relative text-4xl font-semibold">
      <span className="invisible" aria-hidden="true">
        {TEXT}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {TEXT.slice(0, count)}
      </span>
    </h1>
  );
}
