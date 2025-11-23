/**
 * Pre-defined task templates for quick adding
 * Organized by categories for easy selection
 */

export interface TaskTemplate {
  title: string
  type: "DAILY_HABIT" | "ONE_TIME" | "PROGRESS"
  reset_frequency?: "daily" | "weekly" | "none"
  target_value?: number
  category: string
  emoji?: string
  priority?: "low" | "medium" | "high"
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // Health & Fitness
  {
    title: "Su İç",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sağlık & Fitness",
    emoji: "💧",
  },
  {
    title: "Egzersiz Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sağlık & Fitness",
    emoji: "🏃",
  },
  {
    title: "Yoga Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sağlık & Fitness",
    emoji: "🧘",
  },
  {
    title: "Vitamin Al",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sağlık & Fitness",
    emoji: "💊",
  },
  {
    title: "10.000 Adım At",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sağlık & Fitness",
    emoji: "👣",
  },
  {
    title: "Sağlıklı Yemek Ye",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sağlık & Fitness",
    emoji: "🥗",
  },
  {
    title: "Kahvaltı Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sağlık & Fitness",
    emoji: "🍳",
  },
  {
    title: "8 Saat Uyu",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sağlık & Fitness",
    emoji: "😴",
  },

  // Personal Care
  {
    title: "Diş Fırçala",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Bakım",
    emoji: "🦷",
  },
  {
    title: "Duş Al",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Bakım",
    emoji: "🚿",
  },
  {
    title: "Yüz Yıkama Rutini",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Bakım",
    emoji: "🧼",
  },
  {
    title: "Saç Bakımı",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Bakım",
    emoji: "💇",
  },

  // Work & Productivity
  {
    title: "Email Kontrol Et",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "İş & Verimlilik",
    emoji: "📧",
  },
  {
    title: "Toplantıya Katıl",
    type: "ONE_TIME",
    category: "İş & Verimlilik",
    emoji: "📅",
    priority: "high",
  },
  {
    title: "Proje Tamamla",
    type: "ONE_TIME",
    category: "İş & Verimlilik",
    emoji: "✅",
    priority: "high",
  },
  {
    title: "Rapor Hazırla",
    type: "ONE_TIME",
    category: "İş & Verimlilik",
    emoji: "📊",
    priority: "medium",
  },
  {
    title: "Sunum Hazırla",
    type: "ONE_TIME",
    category: "İş & Verimlilik",
    emoji: "📝",
    priority: "high",
  },
  {
    title: "Doktor Randevusu",
    type: "ONE_TIME",
    category: "İş & Verimlilik",
    emoji: "🏥",
    priority: "high",
  },
  {
    title: "Müşteri Toplantısı",
    type: "ONE_TIME",
    category: "İş & Verimlilik",
    emoji: "🤝",
    priority: "high",
  },
  {
    title: "İş Görüşmesi",
    type: "ONE_TIME",
    category: "İş & Verimlilik",
    emoji: "💼",
    priority: "high",
  },
  {
    title: "Fatura Ödeme",
    type: "ONE_TIME",
    category: "İş & Verimlilik",
    emoji: "💳",
    priority: "high",
  },
  {
    title: "Müşteri Arama",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "İş & Verimlilik",
    emoji: "📞",
  },

  // Education & Learning
  {
    title: "Ders Çalış",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğitim & Öğrenme",
    emoji: "📚",
  },
  {
    title: "Ödev Yap",
    type: "ONE_TIME",
    category: "Eğitim & Öğrenme",
    emoji: "✏️",
    priority: "high",
  },
  {
    title: "Sınav Çalışması",
    type: "ONE_TIME",
    category: "Eğitim & Öğrenme",
    emoji: "📝",
    priority: "high",
  },
  {
    title: "Proje Teslimi",
    type: "ONE_TIME",
    category: "Eğitim & Öğrenme",
    emoji: "📦",
    priority: "high",
  },
  {
    title: "Ders Notlarını Gözden Geçir",
    type: "ONE_TIME",
    category: "Eğitim & Öğrenme",
    emoji: "📋",
    priority: "medium",
  },
  {
    title: "Kitap Oku",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğitim & Öğrenme",
    emoji: "📖",
  },
  {
    title: "Yeni Kelime Öğren",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğitim & Öğrenme",
    emoji: "🔤",
  },
  {
    title: "Dil Pratiği Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğitim & Öğrenme",
    emoji: "🌍",
  },
  {
    title: "Online Kurs İzle",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğitim & Öğrenme",
    emoji: "🎓",
  },

  // Home & Chores
  {
    title: "Bulaşık Yıka",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Ev İşleri",
    emoji: "🍽️",
  },
  {
    title: "Çamaşır Yıka",
    type: "DAILY_HABIT",
    reset_frequency: "weekly",
    category: "Ev İşleri",
    emoji: "👕",
  },
  {
    title: "Temizlik Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Ev İşleri",
    emoji: "🧹",
  },
  {
    title: "Yemek Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Ev İşleri",
    emoji: "👨‍🍳",
  },
  {
    title: "Alışveriş Yap",
    type: "ONE_TIME",
    category: "Ev İşleri",
    emoji: "🛒",
    priority: "medium",
  },
  {
    title: "Ev Temizliği (Derin)",
    type: "ONE_TIME",
    category: "Ev İşleri",
    emoji: "🧽",
    priority: "low",
  },
  {
    title: "Eşya Tamiri",
    type: "ONE_TIME",
    category: "Ev İşleri",
    emoji: "🔧",
    priority: "medium",
  },
  {
    title: "Dekorasyon Değişikliği",
    type: "ONE_TIME",
    category: "Ev İşleri",
    emoji: "🖼️",
    priority: "low",
  },
  {
    title: "Çöp At",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Ev İşleri",
    emoji: "🗑️",
  },
  {
    title: "Bitki Sula",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Ev İşleri",
    emoji: "🌱",
  },

  // Personal Development
  {
    title: "Meditasyon Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Gelişim",
    emoji: "🧘‍♀️",
  },
  {
    title: "Günlük Yaz",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Gelişim",
    emoji: "📔",
  },
  {
    title: "Hedefleri Gözden Geçir",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Gelişim",
    emoji: "🎯",
  },
  {
    title: "Minnet Günlüğü",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Gelişim",
    emoji: "🙏",
  },
  {
    title: "Yeni Beceri Öğren",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Kişisel Gelişim",
    emoji: "🛠️",
  },

  // Social & Relationships
  {
    title: "Aileyle Konuş",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sosyal & İlişkiler",
    emoji: "👨‍👩‍👧‍👦",
  },
  {
    title: "Arkadaşlarla Görüş",
    type: "ONE_TIME",
    category: "Sosyal & İlişkiler",
    emoji: "👥",
    priority: "medium",
  },
  {
    title: "Doğum Günü Partisi",
    type: "ONE_TIME",
    category: "Sosyal & İlişkiler",
    emoji: "🎉",
    priority: "high",
  },
  {
    title: "Aile Toplantısı",
    type: "ONE_TIME",
    category: "Sosyal & İlişkiler",
    emoji: "👨‍👩‍👧‍👦",
    priority: "high",
  },
  {
    title: "Randevu",
    type: "ONE_TIME",
    category: "Sosyal & İlişkiler",
    emoji: "📅",
    priority: "high",
  },
  {
    title: "Sosyal Medya Kontrol Et",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sosyal & İlişkiler",
    emoji: "📱",
  },
  {
    title: "Mesajlara Cevap Ver",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Sosyal & İlişkiler",
    emoji: "💬",
  },

  // Finance
  {
    title: "Bütçe Kontrol Et",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Finans",
    emoji: "💰",
  },
  {
    title: "Faturaları Öde",
    type: "ONE_TIME",
    category: "Finans",
    emoji: "💳",
    priority: "high",
  },
  {
    title: "Banka İşlemi",
    type: "ONE_TIME",
    category: "Finans",
    emoji: "🏦",
    priority: "medium",
  },
  {
    title: "Vergi Ödemesi",
    type: "ONE_TIME",
    category: "Finans",
    emoji: "📄",
    priority: "high",
  },
  {
    title: "Yatırım Araştırması",
    type: "ONE_TIME",
    category: "Finans",
    emoji: "📈",
    priority: "low",
  },
  {
    title: "Harcamaları Kaydet",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Finans",
    emoji: "📊",
  },
  {
    title: "Tasarruf Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Finans",
    emoji: "💵",
  },

  // Entertainment & Hobbies
  {
    title: "Film İzle",
    type: "PROGRESS",
    target_value: 1,
    category: "Eğlence & Hobi",
    emoji: "🎬",
  },
  {
    title: "Dizi İzle",
    type: "PROGRESS",
    target_value: 10,
    category: "Eğlence & Hobi",
    emoji: "📺",
  },
  {
    title: "Müzik Dinle",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğlence & Hobi",
    emoji: "🎵",
  },
  {
    title: "Oyun Oyna",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğlence & Hobi",
    emoji: "🎮",
  },
  {
    title: "Resim Yap",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğlence & Hobi",
    emoji: "🎨",
  },
  {
    title: "Müzik Aleti Çal",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Eğlence & Hobi",
    emoji: "🎸",
  },

  // Technology
  {
    title: "Kod Yaz",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Teknoloji",
    emoji: "💻",
  },
  {
    title: "Yeni Teknoloji Öğren",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Teknoloji",
    emoji: "🔧",
  },
  {
    title: "Backup Al",
    type: "DAILY_HABIT",
    reset_frequency: "weekly",
    category: "Teknoloji",
    emoji: "💾",
  },

  // Travel & Transportation
  {
    title: "Araç Bakımı",
    type: "ONE_TIME",
    category: "Seyahat & Ulaşım",
    emoji: "🚗",
    priority: "medium",
  },
  {
    title: "Araç Muayenesi",
    type: "ONE_TIME",
    category: "Seyahat & Ulaşım",
    emoji: "🔍",
    priority: "high",
  },
  {
    title: "Seyahat Planlaması",
    type: "ONE_TIME",
    category: "Seyahat & Ulaşım",
    emoji: "✈️",
    priority: "medium",
  },
  {
    title: "Bilet Rezervasyonu",
    type: "ONE_TIME",
    category: "Seyahat & Ulaşım",
    emoji: "🎫",
    priority: "high",
  },
  {
    title: "Toplu Taşıma Kullan",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Seyahat & Ulaşım",
    emoji: "🚌",
  },

  // Pets
  {
    title: "Evcil Hayvan Besle",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Evcil Hayvanlar",
    emoji: "🐕",
  },
  {
    title: "Evcil Hayvan Gezdir",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Evcil Hayvanlar",
    emoji: "🐾",
  },

  // Spiritual & Mindfulness
  {
    title: "Dua Et",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Ruhsal & Farkındalık",
    emoji: "🕌",
  },
  {
    title: "Doğada Zaman Geçir",
    type: "DAILY_HABIT",
    reset_frequency: "daily",
    category: "Ruhsal & Farkındalık",
    emoji: "🌲",
  },
]

export const TASK_CATEGORIES = [
  "Sağlık & Fitness",
  "Kişisel Bakım",
  "İş & Verimlilik",
  "Eğitim & Öğrenme",
  "Ev İşleri",
  "Kişisel Gelişim",
  "Sosyal & İlişkiler",
  "Finans",
  "Eğlence & Hobi",
  "Teknoloji",
  "Seyahat & Ulaşım",
  "Evcil Hayvanlar",
  "Ruhsal & Farkındalık",
] as const

export function getTemplatesByCategory(category: string): TaskTemplate[] {
  return TASK_TEMPLATES.filter((template) => template.category === category)
}

export function searchTemplates(query: string): TaskTemplate[] {
  const lowerQuery = query.toLowerCase()
  return TASK_TEMPLATES.filter(
    (template) =>
      template.title.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery)
  )
}

