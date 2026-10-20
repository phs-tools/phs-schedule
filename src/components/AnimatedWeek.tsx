"use client";

import { ViewTransition } from "react";

/**
 * Wraps the week grid so moving between weeks animates in the direction of
 * travel. The prev/next links in WeekNav tag their navigation with the
 * `week-prev` / `week-next` transition types; those types select one of the
 * classes below, which globals.css turns into a directional slide.
 *
 * `name` matters: /week/[date] is a dynamic route, so the outgoing and
 * incoming weeks are different fibers. React only pairs them up as the two
 * halves of one shared element when they share an explicit `name` — without
 * one it auto-names each fiber separately, never finds a pair, and skips the
 * animation entirely.
 *
 * Note the `share` map: it must name the same per-direction classes as
 * enter/exit. A static `share="week-prev week-next"` string applies both
 * classes at once, and since the `.week-prev` rules come later in
 * globals.css they win — so "next" would play the "prev" animation.
 */
export function AnimatedWeek({
  weekKey,
  children,
}: {
  weekKey: string;
  children: React.ReactNode;
}) {
  return (
    <ViewTransition
      key={weekKey}
      name="week-grid"
      /*
       * `share` is what lets React treat the outgoing and incoming weeks as
       * one pair rather than two unrelated elements. It goes through the same
       * type-aware resolver as enter/exit, so it can be a map: a plain string
       * would put both direction classes on both halves and the later CSS
       * rule would win, making "next" play the "prev" animation.
       */
      share={{
        "week-prev": "week-prev",
        "week-next": "week-next",
        default: "none",
      }}
      enter={{
        "week-prev": "week-prev",
        "week-next": "week-next",
        default: "none",
      }}
      exit={{
        "week-prev": "week-prev",
        "week-next": "week-next",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
