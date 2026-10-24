"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DayLinkProps {
  date: string;
  label: string;
  children?: React.ReactNode;
}

export function DayLink({ date, label, children }: DayLinkProps) {
  const router = useRouter();
  const href = `/day/${date}`;

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      onTouchStart={() => router.prefetch(href)}
    >
      <button className="flex min-w-[160px] cursor-pointer items-center justify-center gap-1 rounded-md border-none bg-transparent px-2 py-1 text-center text-base text-neutral-600 transition-colors select-none hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 print:hidden">
        {label} {children}
      </button>
    </Link>
  );
}
