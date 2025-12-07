# Vercel Deployment Rehberi

Bu projeyi Vercel'de yayınlamak için aşağıdaki adımları takip etmelisin.

⚠️ **ÇOK ÖNEMLİ UYARI:**
Şu an bilgisayarında (MAMP) çalışan veritabanı (`localhost`) Vercel'de **ÇALIŞMAZ**. Vercel bulutta (internette) çalışan bir sistemdir, senin bilgisayarına erişemez.
Bu yüzden önce veritabanını internete taşıman (Cloud Database) gerekir.

---

## Adım 1: Bulut Veritabanı Oluşturma (Ücretsiz)
Vercel'in veritabanına erişebilmesi için **Aiven** veya **Railway** gibi ücretsiz MySQL hizmeti veren bir yer kullanmalısın.

1.  **Aiven.io** veya **Railway.app** sitesine gidip ücretsiz hesap aç.
2.  Yeni bir **MySQL** servisi oluştur.
3.  Sana verilen bağlantı bilgilerini (Host, User, Password, Database Name, Port) bir kenara not et.
4.  Bu yeni veritabanına bağlanıp (Workbench veya DBeaver ile) `scripts/schema.sql` dosyasındaki tablo oluşturma kodunu çalıştır.

## Adım 2: Projeyi GitHub'a Yükle
Eğer henüz yapmadıysan:
1.  GitHub'da yeni bir repo oluştur (Örn: `kds-proje`).
2.  Terminalde şu komutları çalıştır:
    ```bash
    git init
    git add .
    git commit -m "Proje tamamlandı"
    git branch -M main
    git remote add origin https://github.com/KULLANICI_ADIN/kds-proje.git
    git push -u origin main
    ```

## Adım 3: Vercel'e Deploy Etme
1.  [Vercel.com](https://vercel.com) adresine git ve GitHub hesabınla giriş yap.
2.  **"Add New..."** -> **"Project"** butonuna tıkla.
3.  GitHub'daki `kds-proje` reponu seç ve **"Import"** de.
4.  **"Environment Variables"** kısmına gel ve Adım 1'de aldığın bulut veritabanı bilgilerini gir:
    *   `DB_HOST`: (Bulut veritabanı adresi)
    *   `DB_USER`: (Bulut kullanıcı adı)
    *   `DB_PASSWORD`: (Bulut şifresi)
    *   `DB_NAME`: (Bulut veritabanı adı - genelde defaultdb)
    *   `DB_PORT`: (Bulut portu - genelde 3306 veya farklı olabilir)
    *   `DB_SSL`: `true` (Eğer "Self-signed certificate" hatası alırsan veya bağlantı reddedilirse bunu ekle)
5.  **"Deploy"** butonuna bas! 🚀

## Adım 4: Son Kontrol
Deploy bittiğinde Vercel sana bir link verecek (örn: `https://kds-proje.vercel.app`).
Bu linke tıkla. Eğer veritabanı bilgilerin doğruysa projen artık internette herkesin erişimine açık çalışıyor olacak!
