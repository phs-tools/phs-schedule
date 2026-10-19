import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  console.log(request.nextUrl.pathname);
  const { device } = userAgent(request);

  if (device.type === "mobile") {
    return NextResponse.redirect(new URL("/day", request.url));
  } else {
    return NextResponse.redirect(new URL("/week", request.url));
  }
}

export const config = {
  matcher: "/",
};
