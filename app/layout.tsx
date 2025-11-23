import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/components/providers/supabase-provider"
import { MainNav } from "@/components/navigation/main-nav"
import { tr } from "@/lib/i18n"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: tr.dashboard.title,
  description: tr.dashboard.subtitle,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} bg-[hsl(var(--background))]`}>
        <SupabaseProvider>
          <MainNav />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}

