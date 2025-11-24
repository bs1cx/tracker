"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingDown, TrendingUp, Filter, X, Calendar } from "lucide-react"
import { getTransactions, getExpenseCategories, getIncomeSources } from "@/app/actions-finance"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface Transaction {
  id: string
  amount: number | string
  category?: string
  source?: string
  description?: string
  log_date: string
  created_at: string
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<{ expenses: Transaction[]; income: Transaction[] }>({
    expenses: [],
    income: [],
  })
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: "all" as "expense" | "income" | "all",
    category: "",
    source: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  })

  // Load initial data
  useEffect(() => {
    loadData()
    loadCategories()
  }, [])

  // Listen for updates
  useEffect(() => {
    const handleFinanceUpdate = () => {
      loadData()
      loadCategories()
    }

    window.addEventListener('financeDataUpdated', handleFinanceUpdate)
    
    // Also refresh periodically
    const interval = setInterval(() => {
      loadData()
    }, 5000) // Refresh every 5 seconds

    return () => {
      window.removeEventListener('financeDataUpdated', handleFinanceUpdate)
      clearInterval(interval)
    }
  }, [filters]) // Add filters as dependency

  const loadData = async () => {
    setLoading(true)
    try {
      const filterParams: any = {}
      if (filters.type !== "all") filterParams.type = filters.type
      if (filters.category) filterParams.category = filters.category
      if (filters.source) filterParams.source = filters.source
      if (filters.startDate) filterParams.startDate = filters.startDate
      if (filters.endDate) filterParams.endDate = filters.endDate
      if (filters.minAmount && filters.minAmount !== "") {
        const min = parseFloat(filters.minAmount)
        if (!isNaN(min)) filterParams.minAmount = min
      }
      if (filters.maxAmount && filters.maxAmount !== "") {
        const max = parseFloat(filters.maxAmount)
        if (!isNaN(max)) filterParams.maxAmount = max
      }

      const data = await getTransactions(filterParams)
      if (data) {
        setTransactions(data)
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
      setTransactions({ expenses: [], income: [] })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    const [cats, srcs] = await Promise.all([
      getExpenseCategories(),
      getIncomeSources(),
    ])
    setCategories(cats)
    setSources(srcs)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    loadData()
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      category: "",
      source: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    })
    setTimeout(() => loadData(), 100)
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy", { locale: tr })
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: tr })
    } catch {
      return dateStr
    }
  }

  // Combine and sort transactions
  const allTransactions = [
    ...transactions.expenses.map(t => ({ ...t, type: "expense" as const })),
    ...transactions.income.map(t => ({ ...t, type: "income" as const })),
  ].sort((a, b) => {
    const dateA = new Date(a.log_date).getTime()
    const dateB = new Date(b.log_date).getTime()
    return dateB - dateA
  })

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Calendar className="h-5 w-5 text-[#60a5fa]" />
            Harcamalar ve Gelirler
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrele
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label className="text-slate-300">Tür</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="expense">Harcamalar</SelectItem>
                    <SelectItem value="income">Gelirler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filters.type !== "income" && (
                <div className="grid gap-2">
                  <Label className="text-slate-300">Kategori</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm kategoriler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tüm kategoriler</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filters.type !== "expense" && (
                <div className="grid gap-2">
                  <Label className="text-slate-300">Kaynak</Label>
                  <Select
                    value={filters.source}
                    onValueChange={(value) => handleFilterChange("source", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm kaynaklar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tüm kaynaklar</SelectItem>
                      {sources.map((src) => (
                        <SelectItem key={src} value={src}>
                          {src}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label className="text-slate-300">Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-300">Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-300">Min Tutar (₺)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-300">Max Tutar (₺)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters} size="sm">
                Filtrele
              </Button>
              <Button onClick={clearFilters} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Temizle
              </Button>
            </div>
          </div>
        )}

        {/* Transactions List */}
        {loading ? (
          <div className="text-center py-8 text-slate-400">Yükleniyor...</div>
        ) : allTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Henüz işlem kaydı yok
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
                Tümü ({allTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="expenses" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
                Harcamalar ({transactions.expenses.length})
              </TabsTrigger>
              <TabsTrigger value="income" className="data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white">
                Gelirler ({transactions.income.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {allTransactions.map((transaction) => (
                  <div
                    key={`${transaction.type}-${transaction.id}`}
                    className={`p-4 border rounded-lg ${
                      transaction.type === "expense"
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-green-500/30 bg-green-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {transaction.type === "expense" ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-semibold text-slate-200">
                            {transaction.type === "expense"
                              ? transaction.category || "Harcama"
                              : transaction.source || "Gelir"}
                          </span>
                          <span className={`text-lg font-bold ${
                            transaction.type === "expense" ? "text-red-500" : "text-green-500"
                          }`}>
                            {transaction.type === "expense" ? "-" : "+"}₺{Number(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-slate-400 mt-1 italic">
                            "{transaction.description}"
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          <span>{formatDate(transaction.log_date)}</span>
                          <span>•</span>
                          <span>{formatDateTime(transaction.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="mt-4">
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {transactions.expenses.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 border border-red-500/30 rounded-lg bg-red-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="font-semibold text-slate-200">
                            {transaction.category || "Harcama"}
                          </span>
                          <span className="text-lg font-bold text-red-500">
                            -₺{Number(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-slate-400 mt-1 italic">
                            "{transaction.description}"
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          <span>{formatDate(transaction.log_date)}</span>
                          <span>•</span>
                          <span>{formatDateTime(transaction.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="income" className="mt-4">
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {transactions.income.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 border border-green-500/30 rounded-lg bg-green-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-slate-200">
                            {transaction.source || "Gelir"}
                          </span>
                          <span className="text-lg font-bold text-green-500">
                            +₺{Number(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-slate-400 mt-1 italic">
                            "{transaction.description}"
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          <span>{formatDate(transaction.log_date)}</span>
                          <span>•</span>
                          <span>{formatDateTime(transaction.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

