# Proje Kod Analizi ve KDS Eşleştirmesi

Bu doküman, projedeki dosyaların ve kod bloklarının hangi KDS (Karar Destek Sistemi) maddesini karşıladığını teknik olarak açıklar.

## 1. `public/scoring-engine.js` (Analitik Motor)
Bu dosya projenin "beyni"dir ve karar verme mantığını içerir.

*   **KDS Madde 7 (Analitik Modeller):** `PriorityScorer` sınıfı ve `calculateScore` fonksiyonu, olayları matematiksel bir modele göre puanlar.
*   **KDS Madde 13 (Değişen Şartlara Uyum):** `weights` (ağırlıklar) objesi sabittir ancak `app.js` üzerinden dinamik olarak değiştirilebilir. Bu, modelin esnekliğini sağlar.
*   **KDS Madde 2 (Yarı Yapısal Kararlar):** `getRecommendation` fonksiyonu, puana göre "ENGELLE" veya "İZLE" önerisi üretir. Bu kesin bir emir değil, bir öneridir.

## 2. `public/app.js` (Frontend Mantığı)
Kullanıcı etkileşimi ve veri görselleştirme burada yapılır.

*   **KDS Madde 1 (Geleceği Planlama):** `updateCharts` fonksiyonu içindeki `riskTrendChart` (Line Chart), geçmiş veriden ziyade gelecekteki risk yoğunluğunu simüle ederek yöneticinin plan yapmasını sağlar.
*   **KDS Madde 8 (Kullanıcı Etkileşimi):** `applyScenario` fonksiyonu, kullanıcının butonlara basarak ("DDoS Senaryosu" vb.) modelin çalışma şeklini anlık olarak değiştirmesini sağlar.
*   **KDS Madde 14 (Düzensiz Zamanlarda Kullanım):** `refreshData` fonksiyonu, kullanıcının istediği an veritabanından en güncel veriyi çekmesine olanak tanır.
*   **KDS Madde 5 (Kullanıcı Kontrolü):** `renderEvents` fonksiyonu, kullanıcının seçtiği filtreleri (`state.filters`) dikkate alarak tabloyu günceller.

## 3. `public/index.html` (Arayüz)
Kullanıcının gördüğü ekran tasarımıdır.

*   **KDS Madde 12 (Kullanım Kolaylığı):** Temiz CSS yapısı, renk kodları (Kırmızı=Kritik) ve anlaşılır yerleşim.
*   **KDS Madde 9 (Stratejik ve Taktik):**
    *   **Üst Kısım (KPI Kartları):** "Toplam Olay", "Ortalama Risk" gibi özet bilgiler üst düzey yöneticiler (Stratejik) içindir.
    *   **Alt Kısım (Tablo):** Detaylı olay listesi operasyonel analistler (Taktik) içindir.
*   **KDS Madde 11 (Grup Desteği):** Web tabanlı olduğu için tarayıcı üzerinden birden fazla kişi aynı anda erişebilir.

## 4. `api/controllers/eventController.js` (Backend Mantığı)
Veritabanı ile arayüz arasındaki köprüdür.

*   **KDS Madde 4 (Sürecin Tüm Aşamaları):** Veriyi ham halden (SQL) alıp, JSON formatında arayüze sunarak analiz sürecini başlatır.
*   **KDS Madde 6 (Veri Tabanı Erişimi):** `db.query('SELECT * FROM events...')` komutu ile doğrudan MySQL veritabanına erişir.

## 5. `api/db/mysql_connect.js` (Veritabanı Bağlantısı)
*   **KDS Madde 6 (Veri Tabanı Erişimi):** MySQL bağlantı havuzunu (pool) yönetir. Projenin gerçek bir veritabanı üzerinde çalıştığının kanıtıdır.

## 6. `scripts/seed_data.js` (Veri Üretimi)
*   **KDS Madde 4 (Veri Toplama):** Gerçek hayatta sensörlerden gelecek verileri simüle eder. Farklı senaryolara (DDoS, PortScan) uygun veri setleri oluşturarak sistemin test edilmesini sağlar.

## Özet Tablo

| Dosya / Fonksiyon | İlgili KDS Maddesi | Açıklama |
| :--- | :--- | :--- |
| `scoring-engine.js` | **7, 2, 13** | Puanlama algoritması, öneri sistemi, ağırlık yönetimi. |
| `riskTrendChart` (app.js) | **1** | Gelecek 24 saatlik risk tahmini grafiği. |
| `applyScenario` (app.js) | **8, 13** | Senaryo butonları ile modelin değiştirilmesi. |
| `refreshData` (app.js) | **14, 6** | Anlık veri çekme ve veritabanı erişimi. |
| `index.html` (KPI Cards) | **9** | Yöneticiler için stratejik özet. |
| `index.html` (Table) | **9, 3** | Analistler için detay ve karar desteği. |
| `mysql_connect.js` | **6** | MySQL veritabanı entegrasyonu. |
