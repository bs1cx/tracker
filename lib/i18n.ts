/**
 * Turkish translations for the application
 */

export const tr = {
  // Common
  common: {
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    add: "Ekle",
    create: "Oluştur",
    update: "Güncelle",
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    confirm: "Onayla",
    close: "Kapat",
    search: "Ara",
    filter: "Filtrele",
    all: "Tümü",
    today: "Bugün",
    yesterday: "Dün",
    thisWeek: "Bu Hafta",
    thisMonth: "Bu Ay",
  },

  // Auth
  auth: {
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    signOut: "Çıkış Yap",
    email: "E-posta",
    password: "Şifre",
    confirmPassword: "Şifre Onayı",
    forgotPassword: "Şifremi Unuttum",
    alreadyHaveAccount: "Zaten hesabınız var mı? Giriş yapın",
    dontHaveAccount: "Hesabınız yok mu? Kayıt olun",
    createAccount: "Hesap oluşturarak hayatınızı takip etmeye başlayın",
    enterCredentials: "Takipçinize erişmek için bilgilerinizi girin",
    checkEmail: "E-postanızı kontrol edin!",
  },

  // Dashboard
  dashboard: {
    title: "Yaşam Takipçisi",
    subtitle: "Alışkanlıklarınızı, görevlerinizi ve ilerlemenizi takip edin",
    dailyHabits: "Günlük Alışkanlıklar",
    oneTimeTasks: "Yapılacaklar Listesi",
    progressTrackers: "İzleme Listesi",
    noTrackables: "Henüz takip edilecek öğe yok. İlk öğenizi ekleyerek başlayın!",
    addItem: "Öğe Ekle",
  },

  // Trackables
  trackables: {
    addNew: "Yeni Öğe Ekle",
    createNew: "Yeni bir alışkanlık, görev veya ilerleme takipçisi oluşturun",
    title: "Başlık",
    type: "Tür",
    dailyHabit: "Günlük Alışkanlık",
    oneTimeTask: "Tek Seferlik Görev",
    progressTracker: "İlerleme Takipçisi",
    resetFrequency: "Sıfırlama Sıklığı",
    noReset: "Sıfırlama Yok",
    daily: "Günlük",
    weekly: "Haftalık",
    targetValue: "Hedef Değer (Opsiyonel)",
    lastCompleted: "Son tamamlanma:",
    creating: "Oluşturuluyor...",
    failed: "Öğe oluşturulamadı. Lütfen tekrar deneyin.",
  },

  // Templates
  templates: {
    title: "Şablonlar",
    custom: "Özel",
    searchPlaceholder: "Şablonları ara...",
    category: "Kategori",
    allCategories: "Tüm Kategoriler",
    noTemplates: "Şablon bulunamadı. Farklı bir arama deneyin.",
  },

  // Health
  health: {
    title: "Sağlık Takibi",
    heartRate: "Nabız",
    sleep: "Uyku",
    sleepDuration: "Uyku Süresi",
    sleepQuality: "Uyku Kalitesi",
    sleepEfficiency: "Uyku Verimliliği",
    rem: "REM",
    light: "Hafif",
    deep: "Derin",
    water: "Su Tüketimi",
    calories: "Kalori",
    macros: "Makrolar",
    carbs: "Karbonhidrat",
    protein: "Protein",
    fat: "Yağ",
    dailyGoal: "Günlük Hedef",
    barcodeScanner: "Barkod Tarayıcı",
  },

  // Mental Health
  mental: {
    title: "Mental Sağlık",
    mood: "Ruh Hali",
    moodTracker: "Ruh Hali Takipçisi",
    motivation: "Motivasyon Puanı",
    breathing: "Nefes Egzersizleri",
    meditation: "Meditasyon",
    journal: "Günlük",
    notes: "Notlar",
  },

  // Productivity
  productivity: {
    title: "Verimlilik",
    todo: "Görev Listesi",
    calendar: "Takvim",
    pomodoro: "Pomodoro",
    focusMode: "Odak Modu",
    weeklyGoals: "Haftalık Hedefler",
    monthlyGoals: "Aylık Hedefler",
    reports: "Raporlar",
    statistics: "İstatistikler",
  },

  // Finance
  finance: {
    title: "Finans",
    expenses: "Harcamalar",
    income: "Gelir",
    budget: "Bütçe",
    category: "Kategori",
    monthlySummary: "Aylık Özet",
    analysis: "Gelir-Gider Analizi",
  },

  // Statistics
  statistics: {
    title: "İstatistikler",
    daily: "Günlük",
    weekly: "Haftalık",
    monthly: "Aylık",
    habitStreak: "Alışkanlık Serisi",
    correlations: "Korelasyonlar",
    sleepStressActivity: "Uyku - Stres - Aktivite",
    aiSummary: "AI Özet Raporu",
  },
}

export type TranslationKey = keyof typeof tr

