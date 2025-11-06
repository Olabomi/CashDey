import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Validate required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file."
    );
    // For development, return a helpful error page
    if (process.env.NODE_ENV === "development") {
      return new NextResponse(
        "Missing Supabase configuration. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
        { status: 500 }
      );
    }
    // In production, just continue without Supabase (may break auth)
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        request.cookies.set(name, value);
        supabaseResponse = NextResponse.next({
          request,
        });
        supabaseResponse.cookies.set(name, value, options);
      },
      remove(name: string, options: any) {
        request.cookies.delete(name);
        supabaseResponse = NextResponse.next({
          request,
        });
        supabaseResponse.cookies.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Protect onboarding routes
  if (request.nextUrl.pathname.startsWith("/onboarding") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (
    request.nextUrl.pathname.startsWith("/auth") &&
    user &&
    !request.nextUrl.pathname.startsWith("/auth/callback")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

