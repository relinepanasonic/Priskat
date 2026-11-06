import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // communitycenter.ruangiman.com is the community back office: "/" opens the admin
  // dashboard and anything outside the admin/auth routes is sent back to "/".
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const isCommunityCenterHost = host.startsWith("communitycenter.");
  let pathname = request.nextUrl.pathname;
  let rewriteToAdmin = false;
  if (isCommunityCenterHost) {
    const allowed = ["/admin", "/camp", "/login", "/forgot-password", "/reset-password", "/auth", "/api", "/privacy"];
    if (pathname === "/") {
      rewriteToAdmin = true;
      pathname = "/admin";
    } else if (!allowed.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/profile");

  // Refresh session — IMPORTANT: do not remove.
  // Protected routes verify the user with the auth server; everywhere else we only
  // refresh the session cookie (no network call unless the token has expired),
  // because pages and layouts verify the user themselves. This keeps every
  // navigation and prefetch from paying for an extra auth round trip.
  let user = null;
  if (isProtected) {
    ({ data: { user } } = await supabase.auth.getUser());
  } else {
    await supabase.auth.getSession();
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isGlobalAdmin = profile && ["founder", "superadmin", "admin", "moderator"].includes(String(profile.role).toLowerCase());
    
    let isCommunityAdmin = false;
    if (!isGlobalAdmin) {
      const { data: commAdmin } = await supabase
        .from("community_admins")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (commAdmin) isCommunityAdmin = true;
    }

    if (!isGlobalAdmin && !isCommunityAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect /profile route
  if (pathname.startsWith("/profile")) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  if (rewriteToAdmin) {
    const rewritten = NextResponse.rewrite(new URL("/admin", request.url), { request });
    supabaseResponse.cookies.getAll().forEach((c) => rewritten.cookies.set(c));
    return rewritten;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|mp3|m4a|woff2?|txt|xml)$).*)",
  ],
};
