const db = require('../db/mysql_connect');

const getEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const offset = (page - 1) * limit;

        const [countResult] = await db.query('SELECT COUNT(*) as total FROM olaylar_gorunumu');
        const totalItems = countResult[0].total;

        const [rows] = await db.query(
            'SELECT * FROM olaylar_gorunumu ORDER BY zaman_damgasi DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(totalItems / limit),
                totalItems: totalItems
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const getStats = async (req, res) => {
    try {
        const [severityStats] = await db.query('SELECT seviye_adi as severity, COUNT(*) as count FROM olaylar_gorunumu WHERE zaman_damgasi >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY seviye_adi');
        const [statusStats] = await db.query('SELECT durum as status, COUNT(*) as count FROM olaylar_gorunumu WHERE zaman_damgasi >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY durum');

        res.json({
            success: true,
            data: {
                severity: severityStats,
                status: statusStats
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getLongTermStats = async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE_FORMAT(zaman_damgasi, '%Y-%m') as month, 
                seviye_adi as severity, 
                COUNT(*) as count 
            FROM olaylar_gorunumu 
            WHERE zaman_damgasi >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month, seviye_adi
            ORDER BY month ASC
        `;
        const [rows] = await db.query(query);

        const labels = [...new Set(rows.map(r => r.month))];
        const datasets = {};

        rows.forEach(row => {
            if (!datasets[row.severity]) {
                datasets[row.severity] = new Array(labels.length).fill(0);
            }
            const index = labels.indexOf(row.month);
            if (index !== -1) {
                datasets[row.severity][index] = row.count;
            }
        });

        res.json({
            success: true,
            data: {
                labels,
                datasets
            }
        });

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getStrategicInsights = async (req, res) => {
    try {
        const [riskStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN seviye_adi = 'Critical' THEN 1 ELSE 0 END) as critical,
                SUM(CASE WHEN seviye_adi = 'High' THEN 1 ELSE 0 END) as high
            FROM olaylar_gorunumu 
            WHERE zaman_damgasi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        const total = riskStats[0].total || 1;
        const weightedRiskScore = ((riskStats[0].critical * 2 + riskStats[0].high) / total) * 50;
        const currentRiskIndex = Math.min(weightedRiskScore, 100);

        const [recentStats] = await db.query(`
            SELECT COUNT(*) as count FROM olaylar_gorunumu 
            WHERE zaman_damgasi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        const [prevStats] = await db.query(`
            SELECT COUNT(*) as count FROM olaylar_gorunumu 
            WHERE zaman_damgasi >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND zaman_damgasi < DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        let growthRate = 0;
        if (prevStats[0].count > 0) {
            growthRate = ((recentStats[0].count - prevStats[0].count) / prevStats[0].count) * 100;
        }

        let alternatives = [];
        let recommendation = "";

        if (currentRiskIndex > 40) {
            recommendation = "Kritik Risk - Stratejik Müdahale Gerekir";
            alternatives.push({
                title: "Seçenek A: Kapasite Artırımı (Önerilen)",
                desc: `Risk skoru ${currentRiskIndex.toFixed(1)} seviyesinde. Mevcut Firewall lisanslarını genişletin.`,
                impact: "Yüksek",
                cost: "$$$"
            });
            alternatives.push({
                title: "Seçenek B: Vardiya Sıkılaştırma",
                desc: "Sistem yoğunluğu arttı. Analist sayısını vardiyada 2'ye çıkarın.",
                impact: "Orta",
                cost: "$$"
            });
        } else if (growthRate > 15) {
            recommendation = "Büyüme Sinyali - Hazırlıklı Olun";
            alternatives.push({
                title: "Seçenek A: Proaktif İnceleme",
                desc: `Olay sayısı geçen aya göre %${growthRate.toFixed(1)} arttı. "Threat Hunting" başlatın.`,
                impact: "Yüksek",
                cost: "$$"
            });
            alternatives.push({
                title: "Seçenek B: Log Seviyesini Düşür",
                desc: "Gürültüyü azaltmak için sadece High/Critical logları toplayın.",
                impact: "Düşük",
                cost: "$"
            });
        } else {
            recommendation = "Sistem Stabil";
            alternatives.push({
                title: "Seçenek A: Rutin Bakım",
                desc: "Mevcut yapı yeterli. Rutin güncellemelere devam edin.",
                impact: "Nötr",
                cost: "$"
            });
            alternatives.push({
                title: "Seçenek B: Eğitim Planla",
                desc: "Sakin dönemde analistlere ileri seviye malware eğitimi verdirin.",
                impact: "Yüksek (Uzun vade)",
                cost: "$$"
            });
        }

        res.json({
            success: true,
            data: {
                riskIndex: currentRiskIndex.toFixed(1),
                projectedGrowth: growthRate.toFixed(1),
                recommendation,
                alternatives,
                period: "Son 30 Gün Bazlı Analiz"
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

module.exports = { getEvents, getStats, getStrategicInsights, getLongTermStats };
