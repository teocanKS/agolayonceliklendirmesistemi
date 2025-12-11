const db = require('../db/mysql_connect');

// 1. Operational View (Last 100 recent events)
const getEvents = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM events ORDER BY timestamp DESC LIMIT 200');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

// 2. Tactical Stats (Current Snapshot)
const getStats = async (req, res) => {
    try {
        const [severityStats] = await db.query('SELECT severity, COUNT(*) as count FROM events WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY severity');
        const [statusStats] = await db.query('SELECT status, COUNT(*) as count FROM events WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY status');

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

// 3. Strategic Trends (12 Months Data for Graphics)
const getLongTermStats = async (req, res) => {
    try {
        // Aggregation by Month and Severity
        // DATE_FORMAT(timestamp, '%Y-%m') ensures we group by Year-Month
        const query = `
            SELECT 
                DATE_FORMAT(timestamp, '%Y-%m') as month, 
                severity, 
                COUNT(*) as count 
            FROM events 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month, severity
            ORDER BY month ASC
        `;
        const [rows] = await db.query(query);

        // Transform into structure suitable for frontend charts
        // { labels: ['2024-01', '2024-02'], datasets: { Critical: [10, 20], ... } }
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

// 4. Strategic Decision Support (Risk Index & Forecast)
const getStrategicInsights = async (req, res) => {
    try {
        // A. Calculate Risk Index (Weighted Criticality of Last 30 Days)
        const [riskStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical,
                SUM(CASE WHEN severity = 'High' THEN 1 ELSE 0 END) as high
            FROM events 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        const total = riskStats[0].total || 1;
        // Formula: (Critical * 2 + High * 1) / Total * 100 (Just an example metric)
        const weightedRiskScore = ((riskStats[0].critical * 2 + riskStats[0].high) / total) * 50;
        const currentRiskIndex = Math.min(weightedRiskScore, 100);

        // B. Calculate Growth Trend (This Month vs Last Month)
        const [recentStats] = await db.query(`
            SELECT COUNT(*) as count FROM events 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        const [prevStats] = await db.query(`
            SELECT COUNT(*) as count FROM events 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        let growthRate = 0;
        if (prevStats[0].count > 0) {
            growthRate = ((recentStats[0].count - prevStats[0].count) / prevStats[0].count) * 100;
        }

        // C. Generate Decision Alternatives (KDS Core)
        let alternatives = [];
        let recommendation = "";

        // Logic Rule Base
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
