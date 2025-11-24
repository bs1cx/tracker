"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Lightbulb } from "lucide-react"

const financialRules = [
  {
    id: 1,
    title: "50/30/20 Kuralı",
    description: "Gelirinizin %50'sini ihtiyaçlara, %30'unu isteklere, %20'sini tasarrufa ayırın.",
    category: "Bütçe Yönetimi"
  },
  {
    id: 2,
    title: "Acil Durum Fonu",
    description: "En az 3-6 aylık giderlerinizi karşılayacak bir acil durum fonu oluşturun.",
    category: "Tasarruf"
  },
  {
    id: 3,
    title: "Borç Önceliği",
    description: "Yüksek faizli borçları önce ödeyin. Kredi kartı borçlarınızı önceliklendirin.",
    category: "Borç Yönetimi"
  },
  {
    id: 4,
    title: "Otomatik Tasarruf",
    description: "Gelirinizin bir kısmını otomatik olarak tasarruf hesabına aktarın.",
    category: "Tasarruf"
  },
  {
    id: 5,
    title: "Bütçe Takibi",
    description: "Her harcamanızı kaydedin ve bütçenizi düzenli olarak gözden geçirin.",
    category: "Bütçe Yönetimi"
  },
  {
    id: 6,
    title: "Gereksiz Abonelikleri İptal Edin",
    description: "Kullanmadığınız abonelikleri iptal ederek aylık giderlerinizi azaltın.",
    category: "Harcama Optimizasyonu"
  },
  {
    id: 7,
    title: "Yatırım Erken Başlayın",
    description: "Ne kadar erken yatırım yaparsanız, bileşik faiz etkisi o kadar güçlü olur.",
    category: "Yatırım"
  },
  {
    id: 8,
    title: "Fiyat Karşılaştırması Yapın",
    description: "Büyük alımlar yapmadan önce farklı satıcıları karşılaştırın.",
    category: "Harcama Optimizasyonu"
  },
  {
    id: 9,
    title: "Gelir Çeşitlendirmesi",
    description: "Tek bir gelir kaynağına bağımlı kalmayın. Yan gelir kaynakları oluşturun.",
    category: "Gelir Yönetimi"
  },
  {
    id: 10,
    title: "Uzun Vadeli Planlama",
    description: "Emeklilik ve büyük hedefler için uzun vadeli finansal planlar yapın.",
    category: "Planlama"
  }
]

export function FinancialRules() {
  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Finansal En İyi 10 Kural
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {financialRules.map((rule, index) => (
            <div
              key={rule.id}
              className="p-4 border border-slate-700 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-[#60a5fa] flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <h3 className="font-semibold text-slate-200">{rule.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{rule.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">
                    {rule.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

