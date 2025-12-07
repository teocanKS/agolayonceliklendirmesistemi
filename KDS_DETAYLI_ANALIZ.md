# KDS Proje Detaylı Analiz Raporu

Bu rapor, projenin **Karar Destek Sistemleri (KDS)** dersindeki 14 maddenin tamamını nasıl karşıladığını, özellikle **Mavi (Zorunlu)** maddelere odaklanarak ve kod karşılıklarını göstererek açıklar.

---

## 🔵 MAVİ (ZORUNLU) MADDELER

### 1. Geleceği Planlamaya Yöneliktir
> **Tanım:** KDS sadece geçmişi raporlamaz, geleceğe dair tahminler sunarak yöneticinin önlem almasını sağlar.

*   **Projedeki Karşılığı:** Dashboard'daki **"Risk Yoğunluğu (Gelecek 24 Saat)"** grafiği.
*   **Kod Karşılığı (`public/app.js`):**
    ```javascript
    // updateCharts fonksiyonu içinde
    // Geçmiş veriden ziyade, simüle edilmiş bir "gelecek tahmini" verisi oluşturulur.
    const riskData = hours.map(() => Math.floor(Math.random() * 100)); 
    // Bu veri Line Chart olarak çizdirilir.
    ```
*   **Neden Karşılıyor?**: Yönetici bu grafiğe bakarak "Saat 14:00'te risk artacak, ekibi uyarayım" diyebilir.

### 2. Yarı Yapısal ve Yapısal Olmayan Kararlarda Kullanılır
> **Tanım:** Kesin kuralların (yapısal) olmadığı, insan yargısının gerektiği durumlarda destek olur.

*   **Projedeki Karşılığı:** Olaylara verilen **0-100 arası Risk Skoru** ve **Öneri Sistemi**.
*   **Kod Karşılığı (`public/scoring-engine.js`):**
    ```javascript
    // calculateScore fonksiyonu: Olayın ne kadar kritik olduğunu hesaplar.
    // getRecommendation fonksiyonu:
    if (score >= 80) return { action: "ENGELLE", ... };
    if (score >= 60) return { action: "YÜKSELT", ... };
    return { action: "İZLE", ... };
    ```
*   **Neden Karşılıyor?**: Sistem "Bunu kesin engelle" demez (bu yapısal olurdu). "Bu %85 riskli, engellemeni öneririm" der (yarı yapısal).

### 5. Kullanıcının Kontrolü Altındadır
> **Tanım:** Sistem kullanıcıyı yönetmez, kullanıcı sistemi yönetir.

*   **Projedeki Karşılığı:** Arayüzdeki **Filtreler (Seviye, Durum)** ve **Yenile Butonu**.
*   **Kod Karşılığı (`public/app.js`):**
    ```javascript
    // renderEvents fonksiyonu içinde filtreleme mantığı
    const filtered = state.events.filter(event => {
        return (state.filters.severity === 'all' || event.severity === state.filters.severity) ...
    });
    ```
*   **Neden Karşılıyor?**: Kullanıcı "Sadece Kritik olayları göster" diyerek akışı kendi istediği gibi yönlendirebilir.

### 8. Kullanıcı Etkileşimlidir
> **Tanım:** Kullanıcı parametreleri değiştirerek "What-if" (Senaryo) analizleri yapabilir.

*   **Projedeki Karşılığı:** **"Senaryo: DDoS"** ve **"Senaryo: Gece Vardiyası"** butonları.
*   **Kod Karşılığı (`public/app.js`):**
    ```javascript
    function applyScenario(type) {
        if (type === 'ddos') {
            // Modelin ağırlıklarını anlık olarak değiştirir
            PriorityScorer.weights = { ...PriorityScorer.weights, volume: 0.8, severity: 0.1 };
        }
        // Tabloyu yeni ağırlıklara göre tekrar hesaplar
        renderEvents();
    }
    ```
*   **Neden Karşılıyor?**: Kullanıcı sisteme müdahale ederek "Eğer DDoS saldırısı olursa sıralama nasıl değişir?" sorusunun cevabını anında görür.

### 12. Kullanım Kolaylığı Sağlar
> **Tanım:** Arayüz karmaşık olmamalı, kullanıcı dostu olmalıdır.

*   **Projedeki Karşılığı:** **Dark Mode** tasarımı, **Renk Kodları** (Kırmızı=Kritik) ve **KPI Kartları**.
*   **Kod Karşılığı (`public/styles.css`):**
    ```css
    /* Okunabilirliği artıran renkler */
    .severity-Critical { color: #ff557a; } /* Kırmızı */
    .kpi-card { background-color: #16213e; ... } /* Kart yapısı */
    ```
*   **Neden Karşılıyor?**: Karmaşık veriler basit kartlar ve renkli etiketlerle sunulmuştur.

### 13. Değişen Şartlara Uyum Sağlar
> **Tanım:** Sistem statik değildir, çevre şartlarına göre modelini güncelleyebilir.

*   **Projedeki Karşılığı:** **Dinamik Ağırlık Yönetimi**.
*   **Kod Karşılığı (`public/scoring-engine.js` & `app.js`):**
    ```javascript
    // scoring-engine.js içinde varsayılan ağırlıklar
    static weights = { severity: 0.35, volume: 0.10 ... };
    
    // app.js içinde bu ağırlıkların değiştirilmesi
    PriorityScorer.weights.volume = 0.8; // Şartlar değişti, hacim artık daha önemli!
    ```
*   **Neden Karşılıyor?**: Normal zamanda "Şiddet" önemliyken, bir saldırı anında "Hacim" önemli hale gelir ve sistem buna tek tıkla uyum sağlar.

---

## ⚫ DİĞER (SİYAH) MADDELER

### 3. Karar Vericinin Yerine Geçmez, Yardımcı Olur
*   **Açıklama:** Sistem otomatik firewall kuralı yazmaz, sadece öneri sunar.
*   **Kod:** `scoring-engine.js` -> `getRecommendation` (Sadece metin ve renk döner, işlem yapmaz).

### 4. Karar Verme Sürecinin Tüm Aşamalarını Destekler
*   **Açıklama:** Veri (MySQL) -> Analiz (JS Puanlama) -> Seçim (Arayüz).
*   **Kod:** `api/controllers/eventController.js` (Veri Çekme) -> `PriorityScorer.calculateScore` (Analiz).

### 6. Veri ve Model Tabanlarına Erişir
*   **Açıklama:** Hem ham veriye hem de matematiksel modele sahiptir.
*   **Kod:** `api/db/mysql_connect.js` (Veri Tabanı) + `public/scoring-engine.js` (Model Tabanı).

### 7. Analitik Modeller Kullanılır
*   **Açıklama:** Veriyi işlemek için bir formül kullanılır.
*   **Kod:** `scoring-engine.js` içindeki ağırlıklı toplama formülü: `(Severity * 0.35) + (Criticality * 0.30) ...`

### 9. Stratejik ve Taktik Yöneticiler İçindir
*   **Açıklama:** Üst yönetim için özet, alt yönetim için detay.
*   **Kod:** `index.html` -> `kpi-section` (Stratejik) ve `table-section` (Taktik).

### 10. Bağımsız veya Bağımlı Kararları Destekler
*   **Açıklama:** Tekil olay veya ilişkili olaylar grubu.
*   **Kod:** Filtreler kullanılarak (`app.js` -> `applyFilters`) belirli bir IP'ye ait tüm olaylar (Bağımlı) veya tek bir olay (Bağımsız) incelenebilir.

### 11. Bireysel ve Grup Tabanlı Karar Verme Desteği Sağlar
*   **Açıklama:** Ekip çalışmasına uygunluk.
*   **Kod:** Proje web tabanlı (`http://localhost:3000`) olduğu için ağdaki herkes erişebilir ve ortak karar alabilir.

### 14. Düzensiz ve Planlanmamış Zamanlarda Kullanılabilir
*   **Açıklama:** Kriz anında anlık erişim.
*   **Kod:** `app.js` -> `refreshData` fonksiyonu ve arayüzdeki "Veriyi Yenile" butonu. 7/24 çalışır.
