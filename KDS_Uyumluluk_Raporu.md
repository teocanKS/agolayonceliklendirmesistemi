# KDS Uyumluluk Raporu

Bu proje, bir Karar Destek Sistemi (KDS) olarak tasarlanmış ve aşağıdaki 14 temel KDS özelliğini birebir karşılayacak şekilde geliştirilmiştir.

## 1. Geleceği Planlamaya Yöneliktir
**Özellik:** KDS, geçmiş verilerden yola çıkarak gelecekteki durumları tahmin etmeli ve planlamaya yardımcı olmalıdır.
**Projedeki Karşılığı:** Dashboard üzerindeki **"Risk Yoğunluğu (Gelecek 24 Saat Tahmini)"** grafiği. Bu grafik, mevcut saldırı trendlerine bakarak önümüzdeki saatlerde beklenen risk seviyesini görselleştirir. Böylece SOC yöneticisi vardiya planlamasını buna göre yapabilir.

## 2. Yarı Yapısal ve Yapısal Olmayan Kararlarda Kullanılır
**Özellik:** Her şeyin kurala bağlı olmadığı, insan yargısının gerektiği durumlarda destek olmalıdır.
**Projedeki Karşılığı:** Sistem her olaya 0-100 arası bir **Risk Skoru** verir. Ancak "Engelle" veya "İzle" kararı kesin bir kural değil, bir öneridir. Hangi olayın gerçekten kritik olduğuna son tahlilde analist karar verir; sistem sadece matematiksel bir dayanak sunar.

## 3. Karar Vericinin Yerine Geçmez, Yardımcı Olur
**Özellik:** Son sözü makine değil, insan söyler.
**Projedeki Karşılığı:** Tabloda "Öneri" sütunu bulunur (Örn: "YÜKSELT", "İZLE"). Sistem otomatik aksiyon almaz (firewall kuralı yazmaz), sadece yöneticiye **"Buna bakmalısın"** der. Kontrol tamamen kullanıcıdadır.

## 4. Karar Verme Sürecinin Tüm Aşamalarını Destekler
**Özellik:** Veri toplama, analiz, seçenek belirleme ve seçim aşamalarını kapsamalıdır.
**Projedeki Karşılığı:**
1.  **Veri Toplama:** MySQL veritabanından ham ağ trafiği verileri çekilir.
2.  **Analiz:** `scoring-engine.js` içindeki algoritma ile bu veriler işlenir ve puanlanır.
3.  **Seçenek Sunma:** Arayüzde olaylar önem sırasına göre dizilir.
4.  **Seçim:** Yönetici filtreleri kullanarak aksiyon alacağı olayları seçer.

## 5. Kullanıcının Kontrolü Altındadır
**Özellik:** Kullanıcı sistemi yönlendirebilmelidir.
**Projedeki Karşılığı:** Arayüzdeki **Filtreler** (Critical, High, New, Blocked vb.) sayesinde kullanıcı neyi görmek istediğine kendi karar verir. Veriyi istediği zaman "Yenile" butonu ile güncelleyebilir.

## 6. Veri ve Model Tabanlarına Erişir
**Özellik:** Hem ham veriye hem de işleme mantığına (modele) sahip olmalıdır.
**Projedeki Karşılığı:**
*   **Veri Tabanı:** MySQL (`kds_db` > `events` tablosu).
*   **Model Tabanı:** JavaScript içindeki `PriorityScorer` sınıfı ve ağırlıklandırma formülleri.

## 7. Analitik Modeller Kullanılır
**Özellik:** Veriyi işlemek için matematiksel veya mantıksal modeller içermelidir.
**Projedeki Karşılığı:** Projede **Ağırlıklı Puanlama Modeli** (Weighted Scoring Model) kullanılmıştır.
*   Formül: `(Şiddet * 0.35) + (Kritiklik * 0.30) + (Saldırı Tipi * 0.20) + (Hacim * 0.10) + (Saat * 0.05)`

## 8. Kullanıcı Etkileşimlidir
**Özellik:** Kullanıcı sistemle diyalog kurabilmelidir.
**Projedeki Karşılığı:** **"Senaryo Butonları"** (DDoS Saldırısı, Gece Vardiyası) buna en iyi örnektir. Kullanıcı bir butona tıkladığında sistemin hesaplama mantığı (model ağırlıkları) anlık olarak değişir ve sonuçlar ekrana yansır.

## 9. Stratejik ve Taktik Yöneticiler İçindir
**Özellik:** Farklı yönetim kademelerine hitap etmelidir.
**Projedeki Karşılığı:**
*   **Stratejik:** En üstteki **KPI Kartları** (Toplam Olay, Ortalama Risk) yöneticilere genel durumu özetler.
*   **Taktik:** Alttaki **Olay Listesi** operasyonel analistlerin tek tek olayları incelemesini sağlar.

## 10. Bağımsız veya Bağımlı Kararları Destekler
**Özellik:** Tek başına alınan kararlar veya bir zincirin parçası olan kararlar.
**Projedeki Karşılığı:** Her olay kendi başına bir risk skoru alır (Bağımsız). Ancak filtreler kullanılarak "Aynı IP'den gelen tüm saldırılar" listelendiğinde, bu olaylar birbiriyle ilişkilendirilerek toplu bir karar verilebilir (Bağımlı).

## 11. Bireysel ve Grup Tabanlı Karar Verme Desteği Sağlar
**Özellik:** Takım çalışmasına uygun olmalıdır.
**Projedeki Karşılığı:** Sistem web tabanlı olduğu için aynı anda hem SOC Yöneticisi hem de Güvenlik Analisti kendi ekranlarından sisteme girip aynı veriyi inceleyebilir ve ortak karar alabilirler.

## 12. Kullanım Kolaylığı Sağlar
**Özellik:** Arayüz anlaşılır ve kullanıcı dostu olmalıdır.
**Projedeki Karşılığı:** Karmaşık SQL sorguları yerine basit **Dropdown Menüler** ve renk kodlu (Kırmızı=Kritik, Yeşil=Düşük) görselleştirme kullanılmıştır. "Dark Mode" tasarımı göz yorgunluğunu azaltır.

## 13. Değişen Şartlara Uyum Sağlar
**Özellik:** Sistem esnek olmalıdır.
**Projedeki Karşılığı:** Bir DDoS saldırısı başladığında normalde önemsiz olan "Hacim" verisi çok önemli hale gelir. "Senaryo: DDoS" butonuna basıldığında modelin **Hacim Ağırlığı** otomatik olarak artırılır. Sistem yeni duruma adapte olur.

## 14. Düzensiz ve Planlanmamış Zamanlarda Kullanılabilir
**Özellik:** Sadece ay sonu raporu için değil, anlık kriz anında da kullanılabilmelidir.
**Projedeki Karşılığı:** Sistem 7/24 çalışır durumdadır. Bir siber saldırı anında yönetici sisteme girip **"Veriyi Yenile"** diyerek o anki durumu saniyesinde görebilir ve karar alabilir.
