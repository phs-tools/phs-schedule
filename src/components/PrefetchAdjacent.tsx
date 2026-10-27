"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PrefetchAdjacent({
  prev,
  next,
}: {
  prev?: string;
  next?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (prev) router.prefetch(prev);
    if (next) router.prefetch(next);
  }, [prev, next, router]);

  return null;
}
