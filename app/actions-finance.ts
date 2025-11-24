"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentISODate, getStartOfMonth, getEndOfMonth, getStartOfWeek, getEndOfWeek } from "@/lib/date-utils"
import { format } from "date-fns"

// Validation schemas
const expenseSchema = z.object({
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  category: z.string().min(1, "Kategori gereklidir"),
  description: z.string().optional(),
})

const incomeSchema = z.object({
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  source: z.string().optional(),
  description: z.string().optional(),
})

// Add Expense
export async function addExpense(data: {
  amount: number | string
  category: string
  description?: string
}) {
  try {
    console.log("[SERVER ACTION] addExpense - START")
    
    const validated = expenseSchema.parse({
      amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
      category: data.category,
      description: data.description,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addExpense - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        amount: validated.amount,
        category: validated.category,
        description: validated.description || null,
        log_date: getCurrentISODate().split('T')[0],
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] addExpense - DB error:", error)
      
      if (error.code === "42P01") {
        return {
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-extended.sql' dosyasını çalıştırın."
        }
      }
      
      return {
        success: false,
        data: null,
        error: `Harcama eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] addExpense - SUCCESS:", insertedData)
    revalidatePath("/finance")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addExpense - EXCEPTION:", error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return {
        success: false,
        data: null,
        error: `Geçersiz veri: ${errorMessages}`
      }
    }
    
    return {
      success: false,
      data: null,
      error: error?.message || "Harcama eklenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Add Income
export async function addIncome(data: {
  amount: number | string
  source?: string
  description?: string
}) {
  try {
    console.log("[SERVER ACTION] addIncome - START")
    
    const validated = incomeSchema.parse({
      amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
      source: data.source,
      description: data.description,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[SERVER ACTION] addIncome - Auth error:", authError)
      return {
        success: false,
        data: null,
        error: "Kimlik doğrulama hatası. Lütfen tekrar giriş yapın."
      }
    }

    const { data: insertedData, error } = await supabase
      .from("income")
      .insert({
        user_id: user.id,
        amount: validated.amount,
        source: validated.source || null,
        description: validated.description || null,
        log_date: getCurrentISODate().split('T')[0],
      })
      .select()

    if (error) {
      console.error("[SERVER ACTION] addIncome - DB error:", error)
      
      if (error.code === "42P01") {
        return {
          success: false,
          data: null,
          error: "Veritabanı tablosu bulunamadı. Lütfen Supabase SQL Editor'de 'supabase-schema-extended.sql' dosyasını çalıştırın."
        }
      }
      
      return {
        success: false,
        data: null,
        error: `Gelir eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`
      }
    }

    console.log("[SERVER ACTION] addIncome - SUCCESS:", insertedData)
    revalidatePath("/finance")
    return { success: true, data: insertedData, error: null }
  } catch (error: any) {
    console.error("[SERVER ACTION] addIncome - EXCEPTION:", error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return {
        success: false,
        data: null,
        error: `Geçersiz veri: ${errorMessages}`
      }
    }
    
    return {
      success: false,
      data: null,
      error: error?.message || "Gelir eklenirken beklenmeyen bir hata oluştu"
    }
  }
}

// Get monthly finance summary
export async function getMonthlyFinanceSummary() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const startOfMonth = getStartOfMonth(new Date())
    const endOfMonth = getEndOfMonth(new Date())
    const startStr = format(startOfMonth, "yyyy-MM-dd")
    const endStr = format(endOfMonth, "yyyy-MM-dd")

    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", startStr)
      .lte("log_date", endStr)

    // Fetch income
    const { data: income, error: incomeError } = await supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", startStr)
      .lte("log_date", endStr)

    if (expensesError || incomeError) {
      console.error("Error fetching finance data:", expensesError || incomeError)
      return null
    }

    const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0
    const totalIncome = income?.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0) || 0
    const balance = totalIncome - totalExpenses

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {}
    expenses?.forEach(expense => {
      const category = expense.category || "Diğer"
      expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(expense.amount || 0)
    })

    // Group income by source
    const incomeBySource: Record<string, number> = {}
    income?.forEach(inc => {
      const source = inc.source || "Diğer"
      incomeBySource[source] = (incomeBySource[source] || 0) + parseFloat(inc.amount || 0)
    })

    return {
      totalExpenses,
      totalIncome,
      balance,
      expensesByCategory,
      incomeBySource,
      expenseCount: expenses?.length || 0,
      incomeCount: income?.length || 0,
    }
  } catch (error) {
    console.error("Error in getMonthlyFinanceSummary:", error)
    return null
  }
}

// Get weekly finance data
export async function getWeeklyFinanceData() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const startOfWeek = getStartOfWeek(new Date())
    const endOfWeek = getEndOfWeek(new Date())
    const startStr = format(startOfWeek, "yyyy-MM-dd")
    const endStr = format(endOfWeek, "yyyy-MM-dd")

    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", startStr)
      .lte("log_date", endStr)

    const { data: income, error: incomeError } = await supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", startStr)
      .lte("log_date", endStr)

    if (expensesError || incomeError) {
      console.error("Error fetching weekly finance data:", expensesError || incomeError)
      return null
    }

    // Group by day
    const dailyData: Record<string, { expenses: number; income: number }> = {}
    
    expenses?.forEach(expense => {
      const day = expense.log_date
      if (!dailyData[day]) {
        dailyData[day] = { expenses: 0, income: 0 }
      }
      dailyData[day].expenses += parseFloat(expense.amount || 0)
    })

    income?.forEach(inc => {
      const day = inc.log_date
      if (!dailyData[day]) {
        dailyData[day] = { expenses: 0, income: 0 }
      }
      dailyData[day].income += parseFloat(inc.amount || 0)
    })

    return {
      dailyData,
      totalExpenses: expenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0,
      totalIncome: income?.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0) || 0,
    }
  } catch (error) {
    console.error("Error in getWeeklyFinanceData:", error)
    return null
  }
}

