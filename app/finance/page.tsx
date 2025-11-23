import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { tr } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseForm } from "@/components/finance/expense-form"
import { TrendingDown, TrendingUp, Wallet, BarChart3 } from "lucide-react"

export default async function FinancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{tr.finance.title}</h1>
          <p className="text-muted-foreground mt-1">
            Harcamalarınızı takip edin, bütçe oluşturun ve finansal hedeflerinize ulaşın
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Total Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                {tr.finance.expenses}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₺0</p>
              <p className="text-sm text-muted-foreground">Bu Ay</p>
            </CardContent>
          </Card>

          {/* Total Income */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                {tr.finance.income}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₺0</p>
              <p className="text-sm text-muted-foreground">Bu Ay</p>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-500" />
                {tr.finance.budget}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₺0</p>
              <p className="text-sm text-muted-foreground">Aylık Limit</p>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Bakiye
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₺0</p>
              <p className="text-sm text-muted-foreground">Net</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Harcama Ekle</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gelir Ekle</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Yeni Gelir</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

