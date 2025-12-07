const db = require('../db/mysql_connect');

const getEvents = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM events ORDER BY timestamp DESC LIMIT 100');
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

const getStats = async (req, res) => {
    try {
        // Example aggregation for charts
        const [severityStats] = await db.query('SELECT severity, COUNT(*) as count FROM events GROUP BY severity');
        const [statusStats] = await db.query('SELECT status, COUNT(*) as count FROM events GROUP BY status');

        res.json({
            success: true,
            data: {
                severity: severityStats,
                status: statusStats
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

const getStrategicInsights = async (req, res) => {
    try {
        // 1. Calculate Risk Index (Critical / Total)
        const [totalEvents] = await db.query('SELECT COUNT(*) as count FROM events');
        const [criticalEvents] = await db.query('SELECT COUNT(*) as count FROM events WHERE severity = "Critical"');
        const currentRiskIndex = totalEvents[0].count > 0
            ? (criticalEvents[0].count / totalEvents[0].count) * 100
            : 0;

        // 2. Calculate Growth Trend (Last 3 Days vs Previous 3 Days)
        // This simulates "Year-over-Year" growth by looking at recent trend momentum
        const [recentStats] = await db.query(`
            SELECT COUNT(*) as count FROM events 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 3 DAY)
        `);
        const [previousStats] = await db.query(`
            SELECT COUNT(*) as count FROM events 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 6 DAY) 
            AND timestamp < DATE_SUB(NOW(), INTERVAL 3 DAY)
        `);

        let growthRate = 0;
        if (previousStats[0].count > 0) {
            growthRate = ((recentStats[0].count - previousStats[0].count) / previousStats[0].count) * 100;
        }

        // 3. Generate Alternatives based on REAL data
        let alternatives = [];

        if (currentRiskIndex > 20 || growthRate > 30) {
            alternatives = [
                {
                    title: "Seçenek A: Yüksek Yatırım (Önerilen)",
                    desc: "AI tabanlı WAF ve SIEM lisanslarının satın alınması.",
                    impact: "Yüksek",
                    cost: "$$$"
                },
                {
                    title: "Seçenek B: Süreç İyileştirme",
                    desc: "Mevcut Firewall kurallarının sıkılaştırılması ve 7/24 vardiya sistemine geçiş.",
                    impact: "Orta",
                    cost: "$"
                }
            ];
        } else {
            alternatives = [
                {
                    title: "Seçenek A: Mevcut Yapıyı Koru",
                    desc: "Sistem stabil. Sadece rutin güncellemeler yapılsın.",
                    impact: "Nötr",
                    cost: "$"
                },
                {
                    title: "Seçenek B: Proaktif Test",
                    desc: "Dışarıdan Penetrasyon Testi hizmeti alınarak gizli açıklar aransın.",
                    impact: "Yüksek",
                    cost: "$$"
                }
            ];
        }

        res.json({
            success: true,
            data: {
                riskIndex: currentRiskIndex.toFixed(1),
                projectedGrowth: growthRate.toFixed(1),
                recommendation: currentRiskIndex > 20 ? "Kritik Seviye - Aksiyon Şart" : "Stabil Seviye",
                alternatives,
                period: "Gelecek 12 Ay Tahmini"
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


module.exports = { getEvents, getStats, getStrategicInsights };
