# KDS Sistem Geliştirme Yaşam Döngüsü (SDLC) Analizi

Bu rapor, "Ağ Olay Önceliklendirme Sistemi" projesinin **Sistem Geliştirme Yaşam Döngüsü (SDLC)** evrelerine göre nasıl geliştirildiğini ve KDS metodolojisine uyumunu belgeler.

## 1. Planlama ve Problem Tanımı
**Problem:** SOC (Security Operations Center) analistleri, günde binlerce ağ olayı (log) ile karşı karşıya kalmaktadır. Hangi olayın "gerçekten kritik" olduğuna karar vermek, manuel yöntemlerle imkansız hale gelmiştir.
**Hedef:** Olayları belirli kriterlere (Şiddet, Varlık Değeri, Hacim, Zaman) göre otomatik puanlayan ve önceliklendiren, analistlerin karar vermesini hızlandıran bir KDS geliştirmek.
**Kapsam:** 6-12 aylık taktiksel ve stratejik kararları destekleyen, web tabanlı bir dashboard.

## 2. Analiz (Gereksinim Belirleme)
**Bilgi Gereksinimi:**
- Ağ trafiği verileri (Kaynak IP, Hedef IP, Port, Protokol).
- Saldırı imza türleri (DDoS, Brute Force, Malware).
- Geçmiş döneme ait trend verileri (Mevsimsellik analizi için).

**Sistem İhtiyaçları:**
- **Donanım:** Standart sunucu (Node.js runtime).
- **Yazılım:** Web tarayıcı (istemci), MySQL (veritabanı).
- **Kullanıcı:** SOC Yöneticisi ve Güvenlik Analisti rolleri.

## 3. Tasarım
**Mimari Tasarım:**
- **Model Tabanı:** `PriorityScorer` sınıfı. Ağırlıklı toplama yöntemi (Weighted Sum Model) kullanılarak her olay için `Score = (w1*f1) + (w2*f2)...` formülü tasarlandı.
- **Veri Tabanı:** İlişkisel model (MySQL). `events` tablosu merkezde olacak şekilde şema çıkarıldı.
- **Arayüz Tasarımı:** Power BI benzeri, kartlar (KPI) ve grafiklerin olduğu "Tek Bakışta Durum" (Dashboard) yaklaşımı benimsendi.

**KDS Özellik Tasarımı:**
- Yöneticinin "Senaryo" butonları ile modelin ağırlıklarına müdahale etmesi (Duyarlılık Analizi) tasarlandı.

## 4. Geliştirme (Kodlama)
Bu aşamada belirlenen tasarım hayata geçirildi:
- **Backend:** Node.js ve Express ile REST API uçları (`/api/events`, `/api/strategic`) yazıldı.
- **Veritabanı:** MySQL bağlantısı `mysql2` kütüphanesi ile asenkron yapıda kuruldu.
- **Frontend:** HTML5, CSS3 ve Vanilla JavaScript kullanılarak dinamik dashboard kodlandı.
- **Algoritma:** Puanlama motoru (`scoring-engine.js`) istemci tarafında çalışacak şekilde optimize edildi.

## 5. Test ve Doğrulama
- **Birim Testleri:** `PriorityScorer` sınıfı farklı senaryolarla (Yüksek Hacim, Kritik Varlık vb.) test edildi.
- **Kullanıcı Kabul Testi (UAT):** "DDoS Senaryosu" aktif edildiğinde düşük öncelikli hacimli paketlerin skorunun arttığı doğrulandı.
- **Performans Testi:** 6-12 aylık (yaklaşık 10.000 satır) veri ile arayüzün tepki süresi ölçüldü.

## 6. Gerçekleştirme (Deployment)
- **Ortam:** Proje bulut tabanlı bir veritabanı (Aiven MySQL) ve uygulama sunucusu (Vercel) üzerine canlıya alındı.
- **Entegrasyon:** `.env` üzerinden güvenli bağlantı parametreleri tanımlandı.

## 7. Bakım ve Uyarlama
KDS yaşayan bir sistemdir.
- **Geri Bildirim:** Analistlerin "Bu olay gereksiz yere yüksek puan aldı" bildirimlerine göre ağırlık katsayıları güncellendi.
- **Yeni Tehditler:** Yeni çıkan saldırı türleri (örn. Ransomware varyantları) veritabanına ve etiket listesine eklendi.
- **Stratejik Genişleme:** Başlangıçta operasyonel olan sistem, "Gelecek 12 Ay Tahmini" modülü eklenerek stratejik seviyeye taşındı.
