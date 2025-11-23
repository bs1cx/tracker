import { z } from "zod"

export const trackableSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  type: z.enum(["DAILY_HABIT", "ONE_TIME", "PROGRESS"]),
  target_value: z.number().int().positive().nullable().optional(),
  reset_frequency: z.enum(["daily", "weekly", "none"]).default("none"),
  scheduled_time: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
      "Geçerli bir saat formatı giriniz (HH:MM)"
    ),
  priority: z.enum(["low", "medium", "high"]).optional(),
  selected_days: z.array(z.string()).min(1, "En az 1 gün seçmelisiniz"),
})

export const updateTrackableSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["DAILY_HABIT", "ONE_TIME", "PROGRESS"]).optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
  current_value: z.number().int().min(0).optional(),
  target_value: z.number().int().positive().nullable().optional(),
  reset_frequency: z.enum(["daily", "weekly", "none"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  scheduled_time: z.string().nullable().optional(),
  selected_days: z.array(z.string()).min(1, "En az 1 gün seçmelisiniz").optional().nullable(),
})

export const incrementProgressSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().int().min(1).max(100).default(1),
})

export const completeTrackableSchema = z.object({
  id: z.string().uuid(),
})

