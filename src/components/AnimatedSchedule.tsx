"use client";

import { ViewTransition } from "react";

/**
 * The views that animate; each one is the prefix of the CSS classes it uses
 * (`day` → `.day-prev` / `.day-next` in globals.css). A union rather than a
 * plain string, so a typo is a compile error instead of an animation that
 * silently never runs.
 */
export type AnimatedScheduleName = "day" | "week";

/**
 * The transition types that drive the slide, for use with `Link`'s
 * `transitionTypes` prop. Derived from {@link AnimatedScheduleName} so the
 * navs and the wrapper can never disagree about the spelling.
 */
export function scheduleTransitionTypes(
  name: AnimatedScheduleName,
  direction: "prev" | "next",
): string[] {
  return [`${name}-${direction}`];
}

/**
 * Wraps the schedule content on the day and week views so that stepping to
 * the previous/next one animates in the direction of travel.
 *
 * The prev/next links tag their navigation with the `-prev` / `-next`
 * transition types (see DayNav and WeekNav); those types select one of the
 * classes below, which globals.css turns into a directional slide.
 *
 * `name` matters: these are dynamic routes (`/day/[date]`, `/week/[date]`), so
 * the outgoing and incoming views are different fibers. React only pairs them
 * up as the two halves of one element when they share an explicit `name` —
 * without one it auto-names each fiber separately, never finds a pair, and
 * skips the animation entirely.
 *
 * The `share` map has to name the direction classes too, rather than being a
 * single string. A static `share="x-prev x-next"` puts both classes on both
 * halves, and whichever rule comes later in globals.css wins — so "next"
 * would play the "prev" animation. Like enter/exit, `share` is resolved per
 * transition type, so it takes the same map.
 */
export function AnimatedSchedule({
  viewKey,
  name,
  children,
}: {
  /** Changing this remounts the content, so React sees an exit/enter pair. */
  viewKey: string;
  /** View transition name; must stay stable across navigations in a view. */
  name: AnimatedScheduleName;
  children: React.ReactNode;
}) {
  const directions = {
    [`${name}-prev`]: `${name}-prev`,
    [`${name}-next`]: `${name}-next`,
    default: "none",
  } as const;

  return (
    <ViewTransition
      key={viewKey}
      name={name}
      share={directions}
      enter={directions}
      exit={directions}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
