require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
};

// Helper to get random item
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random time within a specific day (0 = today, 1 = yesterday...)
const getRandomTimeForDay = (dayOffset) => {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
};

const generateEvents = () => {
    const events = [];
    const days = 7; // Generate for last 7 days

    for (let day = 0; day < days; day++) {
        // Determine daily pattern based on "mock" day of week
        // We simulate that:
        // Day 0 (Today): Mixed
        // Day 2 (Wednesday-ish): DDoS Attack
        // Day 4 (Friday-ish): PortScan
        // Others: Mostly Benign

        let eventCount = 30 + Math.floor(Math.random() * 20); // 30-50 events per day
        let attackProb = 0.1; // Default low attack probability
        let dominantAttack = "Web Attack";

        if (day === 2) { // Simulate "Wednesday" DDoS
            eventCount = 80; // Spike in traffic
            attackProb = 0.8;
            dominantAttack = "DDoS";
        } else if (day === 4) { // Simulate "Friday" PortScan
            eventCount = 60;
            attackProb = 0.6;
            dominantAttack = "PortScan";
        }

        for (let i = 0; i < eventCount; i++) {
            const isAttack = Math.random() < attackProb;
            let type, severity, rule, flow;

            if (isAttack) {
                type = dominantAttack;
                if (type === "DDoS") {
                    severity = "Critical";
                    flow = 500000 + Math.random() * 1000000;
                    rule = "High Traffic Volume";
                } else if (type === "PortScan") {
                    severity = "High";
                    flow = 1000 + Math.random() * 5000;
                    rule = "Sequential Port Access";
                } else {
                    type = random(["Web Attack", "BruteForce"]);
                    severity = type === "Web Attack" ? "Medium" : "High";
                    flow = 500 + Math.random() * 2000;
                    rule = type === "Web Attack" ? "SQL Pattern Match" : "Failed Login Spikes";
                }
            } else {
                type = "BENIGN";
                severity = "Info";
                flow = 100 + Math.random() * 1000;
                rule = "None";
            }

            events.push({
                title: `${type} Event`,
                severity: severity,
                status: "New",
                source_ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
                dest_ip: "10.0.0.5",
                timestamp: getRandomTimeForDay(day),
                flow_bytes_per_s: flow.toFixed(2),
                label: type,
                ack_lane: isAttack ? "Firewall/IDS" : "None",
                detection_rule: rule
            });
        }
    }
    return events;
};

async function seed() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                severity VARCHAR(50),
                status VARCHAR(50),
                source_ip VARCHAR(50),
                dest_ip VARCHAR(50),
                timestamp DATETIME,
                flow_bytes_per_s DECIMAL(15, 2),
                label VARCHAR(100),
                ack_lane VARCHAR(50),
                detection_rule VARCHAR(100)
            )
        `);
        console.log('Table ensured.');

        // Optional: Truncate to start fresh
        // await connection.execute('TRUNCATE TABLE events');

        const events = generateEvents();
        console.log(`Generated ${events.length} events for the last 7 days.`);

        for (const event of events) {
            await connection.execute(
                'INSERT INTO events (title, severity, status, source_ip, dest_ip, timestamp, flow_bytes_per_s, label, ack_lane, detection_rule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [event.title, event.severity, event.status, event.source_ip, event.dest_ip, event.timestamp, event.flow_bytes_per_s, event.label, event.ack_lane, event.detection_rule]
            );
        }

        console.log('Seeding completed successfully.');
        await connection.end();
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seed();

