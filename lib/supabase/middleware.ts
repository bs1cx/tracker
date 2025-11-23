import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    // Check if environment variables are set
    // Access environment variables directly (works in both Edge and Node runtime)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // If env vars are missing, just continue without Supabase
      // This allows the app to build even if env vars aren't set yet
      return supabaseResponse
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            supabaseResponse.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      }
    )

    await supabase.auth.getUser()
  } catch (error) {
    // If there's an error (e.g., Edge Runtime compatibility issues),
    // just continue without updating the session
    // The app will still work, but session refresh won't happen in middleware
    console.error("Middleware session update error:", error)
  }

  return supabaseResponse
}

