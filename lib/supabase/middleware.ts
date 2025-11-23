import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Temporarily disable Supabase session refresh in middleware due to Edge Runtime compatibility
  // Session management will be handled in server components instead
  // This is a workaround for the Edge Runtime issue with @supabase/supabase-js
  // TODO: Re-enable when @supabase/ssr has better Edge Runtime support
  
  return NextResponse.next({
    request,
  })
}

