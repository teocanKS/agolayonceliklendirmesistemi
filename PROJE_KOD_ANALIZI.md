# Proje Kod Analizi ve KDS Dönüşüm Raporu

## 1. Genel Yapı
Proje, Node.js + Express backend ve Vanilla JS frontend mimarisi üzerine kurulmuş bir web tabanlı Karar Destek Sistemidir (KDS). Veritabanı olarak MySQL kullanılmaktadır.

**Dosya Yapısı:**
- `/api`: Backend mantığı. `index.js` (entry point), `controllers/` (iş mantığı), `routers/` (yönlendirme).
- `/public`: Frontend varlıkları. `index.html` (tek sayfa), `styles.css`, `app.js` (logic).
- `/scripts`: Veritabanı kurulum (`schema.sql`) ve veri üretim (`seed_data.js`) scriptleri.

## 2. Mevcut Kod Analizi

### Backend (`/api`)
- **Güçlü Yönler:**
  - `mysql2/promise` ile modern, asenkron DB bağlantısı kullanılıyor.
  - Klasör yapısı modüler (`controllers`, `routers`).
  - Hata yakalama (try-catch) blokları mevcut.
  - `getStrategicInsights` fonksiyonu ile KDS'ye giriş yapılmış (Risk İndeksi hesabı).
- **Zayıf Yönler / Eksikler:**
  - **Kapsam:** Veriler sadece operasyonel (anlık/kısa vadeli). 'Strategic Insights' sadece son 3-6 günü karşılaştırıyor. İstenen 6-12 aylık projeksiyon yok.
  - **Hardcoded Logic:** Öneri sitemi (Options A/B) dinamik veriden ziyade sert kurallara (if risk > 20) bağlı.
  - **Veri Derinliği:** Aylık veya çeyreklik analiz yapan SQL sorguları yok.

### Frontend (`/public`)
- **Güçlü Yönler:**
  - Modüler JS yapısı (Scoring Engine ayrılmış olabilir, `app.js` import kullanıyor).
  - Temiz bir UI yapısı var, KPI kartları anlaşılır.
  - **Filtreleme:** Client-side filtreleme performansı (az veri için) iyi.
- **Kritik Sorunlar:**
  - **Kütüphane İhlali:** Proje kurallarına aykırı olarak **Chart.js v3** CDN üzerinden kullanılıyor. Bunun tamamen kaldırılıp **HTML/CSS tabanlı (Vanilla JS)** grafiklere dönülmesi gerekiyor.
  - **Simülasyon:** Gelecek tahmini (`riskData`) rastgele sayı üretimiyle (`Math.random()`) yapılıyor. Bu bir KDS için kabul edilemez; veriye dayalı olmalı.

### Veritabanı (`schema.sql`)
- Tek tablo (`events`) yapısı var.
- İndeksleme eksik (performans için `timestamp` veya `severity` indekslenebilir).
- KDS için gerekli "Varlık Değeri", "Tehdit Kataloğu" gibi yan tablolar yok (fakat mevcut kapsamda `events` tablosu şişirilerek bu simüle edilebilir, schema bozulmadan devam edilecek).

## 3. KDS Kriterleri Gap Analizi (Mevcut vs Hedef)

| KDS Özelliği | Mevcut Durum | Hedef (6-12 Ay Dönüşümü) |
|--------------|--------------|--------------------------|
| **Zaman Ufku** | Operasyonel (Günlük/Haftalık) | Taktiksel/Stratejik (Yıllık) |
| **Gelecek Tahmini** | Rastgele (`Math.random`) | Heuristic Model (Geçmiş trende dayalı projeksiyon) |
| **Senaryo Analizi** | Client-side basit ağırlık değişimi | Sunucu destekli, tarihsel veriye dayalı senaryolar |
| **Görselleştirme** | Chart.js (Yasaklı) | Custom CSS/JS Grafikler (Power BI benzeri) |
| **Veri Hacmi** | ~300 satır (Rastgele) | Binlerce satır (Mevsimsellik içeren 1 yıllık veri) |

## 4. Tespit Edilen Riskler ve Öneriler
1.  **Teknik Borç:** Chart.js bağımlılığı acilen kaldırılmalı.
2.  **Veri Kalitesi:** `seed_data.js` scripti sadece son 7 günü üretiyor. Taktiksel karar desteği için bunun **geriye dönük 1 yıl** veri üretecek şekilde güncellenmesi lazım. Ayrıca "Kışın artan saldırı" gibi senaryolar veriye gömülmeli.
3.  **Güvenlik:** `.env` dosyası gitignore'da olmalı (şu an kontrol edildi, var). SQL sorgularında parametre kullanımı (`?`) mevcut, bu korunmalı.

## 5. Eylem Planı
Analiz sonucunda, kodun **"Sadeleştirilmesi"** değil, **"Derinleştirilmesi"** gerektiği ortaya çıkmıştır. Hocanın seviyesini aşmadan (Framework yok, ORM yok), saf SQL ve JS ile daha akıllı bir analiz motoru yazılacaktır.

**Onay:** Bu analiz doğrultusunda "Faz 2: Veri ve Altyapı" adımına geçilecektir.
