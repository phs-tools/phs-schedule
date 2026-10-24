import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/*
 * Applies the theme class to <html> before the first paint so the page never
 * renders with the wrong theme. Mirrors the logic in theme-provider.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("phs-schedule-theme");
    var theme = stored === "dark" ? "dark" : "light";
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  } catch (e) {}
})();
`.trim();

export const metadata: Metadata = {
  title: "PHS Schedule",
  description: "An interactive schedule for students at Piedmont High School.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={barlow.className}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          {children}
          <ThemeToggle />
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
