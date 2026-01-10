# KDS Ağ Olayları Analiz Sistemi

## Proje Açıklaması

Bu proje, Kurumsal Dijital Sistemler (KDS) dersi kapsamında geliştirilmiş, ağ olaylarının analiz edilmesi ve karar destek çıktıları üretilmesini amaçlayan sunucu taraflı bir yazılım projesidir. Sistem, ağ üzerinde oluşan olayları analiz ederek istatistiksel veriler, risk seviyeleri ve stratejik öngörüler üretir.

Uygulama, MVC (Model-View-Controller) mimarisine uygun olarak tasarlanmış olup REST prensiplerine uygun API uç noktaları içermektedir. Kod yapısı okunabilirlik, sürdürülebilirlik ve genişletilebilirlik esas alınarak geliştirilmiştir.

---

## Senaryo Tanımı

Kurumsal bir ağ altyapısında farklı türlerde ağ olayları (DDoS saldırıları, anormal trafik yoğunluğu, riskli aktiviteler vb.) meydana gelmektedir. Bu olaylar manuel olarak takip edilmekte ve karar alma süreçlerinde gecikmelere yol açmaktadır.

Bu proje kapsamında geliştirilen sistem, ağ olaylarını analiz ederek:

* Güncel olay istatistiklerini üretir
* Uzun vadeli trend analizleri yapar
* Stratejik karar destek verileri sunar

Amaç, yöneticilerin ağ güvenliği ve operasyonel riskler hakkında daha hızlı ve doğru kararlar alabilmesini sağlamaktır.

---

## Kurulum

Bu proje Node.js tabanlı bir sunucu uygulamasıdır.

### Gereksinimler

* Node.js (v18 veya üzeri)
* npm

### Kurulum Adımları

1. Projeyi klonlayın:

```bash
git clone https://github.com/teocanKS/kdsagolayproje.git
cd kdsagolayproje
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Ortam değişkenlerini ayarlayın:

* Proje dizininde bulunan `.env.example` dosyasını kopyalayarak `.env` dosyasını oluşturun.

```bash
cp .env.example .env
```

* `.env` dosyası içerisine kendi veritabanı ve port bilgilerinizi girin.

4. Uygulamayı başlatın:

```bash
npm start
```

Uygulama varsayılan olarak aşağıdaki adres üzerinden çalışır:

```
http://localhost:PORT
```

`PORT` değeri `.env` dosyasında tanımlıdır.

---

## API Endpoint Listesi

| Endpoint                  | Metod | Açıklama                                     |
| ------------------------- | ----- | -------------------------------------------- |
| `/api/events`             | GET   | Ağ olaylarını listeler                       |
| `/api/stats`              | GET   | Son 30 güne ait istatistikleri döner         |
| `/api/strategic-insights` | GET   | Stratejik karar destek çıktıları üretir      |
| `/api/long-term-stats`    | GET   | Uzun vadeli (12 ay) trend analizlerini döner |

---

## İş Kuralları (Özel Senaryolar)

1. **Eksik veri ile analiz yapılamaz**
   Zorunlu alanlar eksik gönderildiğinde sistem analiz üretmez.

* HTTP Status: `400`
* Mesaj: `Zorunlu alanlar eksik`

2. **Kritik seviyedeki bir olay düşük risk olarak değerlendirilemez**
   Kritik tehdit içeren bir olayın risk seviyesi sistem tarafından otomatik olarak düşürülemez.

* HTTP Status: `422`
* Mesaj: `Kritik tehdit düşük risk olarak değerlendirilemez`

---

## ER Diyagramı
Aşağıda, uygulamada kullanılan veritabanı yapısını gösteren ER diyagramı yer almaktadır.

![ER Diyagramı](./ErdiagramiKDSProje.png)

## Ortam Değişkenleri

Projede kullanılan ortam değişkenleri `.env.example` dosyasında tanımlanmıştır. Güvenlik sebebiyle `.env` dosyası repoya eklenmemiştir.
