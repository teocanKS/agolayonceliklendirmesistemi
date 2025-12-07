# KDS - Olay Önceliklendirme Sistemi

Bu proje, SOC (Security Operations Center) yöneticileri için geliştirilmiş bir Karar Destek Sistemidir (KDS).

## Özellikler
- **MySQL Veritabanı**: Olay verilerini saklar.
- **Node.js/Express Backend**: Veri erişimi ve API sağlar.
- **Dinamik Frontend**: HTML/CSS/JS ile oluşturulmuş interaktif dashboard.
- **Analitik Modeller**: JS tabanlı puanlama motoru.

## Kurulum

1.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

2.  `.env` dosyasını oluşturun ve veritabanı bilgilerinizi girin:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sifreniz
    DB_NAME=kds_db
    ```

3.  Veritabanını hazırlayın ve örnek verileri yükleyin:
    ```bash
    npm run seed
    ```

4.  Projeyi başlatın:
    ```bash
    npm start
    ```
    Tarayıcıda `http://localhost:3000` adresine gidin.

## Vercel Deployment

1.  Bu projeyi GitHub'a yükleyin.
2.  Vercel'de yeni proje oluşturun ve bu repoyu seçin.
3.  Vercel proje ayarlarında "Environment Variables" kısmına veritabanı bilgilerinizi (DB_HOST, DB_USER, vb.) ekleyin.
4.  Deploy edin!
