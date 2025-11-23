import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a mock client during build if env vars are missing
    // This prevents build errors, but the app won't work without proper env vars
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

