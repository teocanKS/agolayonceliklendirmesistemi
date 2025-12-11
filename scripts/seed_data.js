require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

// Helper to get random item
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random time within a specific date
const getRandomTimeForDate = (date) => {
    const newDate = new Date(date);
    newDate.setHours(Math.floor(Math.random() * 24));
    newDate.setMinutes(Math.floor(Math.random() * 60));
    return newDate;
};

// Attack Patterns
const ATTACK_TYPES = {
    DDOS: "DDoS",
    BRUTE_FORCE: "BruteForce",
    WEB_ATTACK: "Web Attack",
    PORTSCAN: "PortScan",
    MALWARE: "Malware Beaconing",
    INSIDER: "Insider Threat"
};

const generateStrategicEvents = () => {
    const events = [];
    const days = 365; // Generate for last 1 year
    const today = new Date();

    console.log("Generating 12 months of strategic data...");

    for (let dayOffset = days; dayOffset >= 0; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const month = date.getMonth(); // 0-11

        // -------------------------------------------------------------
        // 1. SEASONALITY & TREND FACTORS
        // -------------------------------------------------------------

        let dailyBaseVolume = 40 + Math.floor(Math.random() * 20); // Baseline traffic
        let attackProb = 0.15;
        let dominantAttack = null;

        // Trend: Traffic increases by 20% compared to start of year (Simulating company growth)
        const growthFactor = 1 + (dayOffset / 365) * 0.2;
        dailyBaseVolume = Math.floor(dailyBaseVolume * growthFactor);

        // Seasonal Pattern: Winter (Dec-Feb) -> High DDoS Risk
        if (month === 11 || month === 0 || month === 1) {
            if (Math.random() < 0.3) { // 30% chance of heavy attack day in winter
                dailyBaseVolume += 50;
                dominantAttack = ATTACK_TYPES.DDOS;
                attackProb = 0.7;
            }
        }

        // Seasonal Pattern: Summer (Jun-Aug) -> Phishing / Malware (Vacation gaps)
        if (month >= 5 && month <= 7) {
            if (Math.random() < 0.2) {
                dominantAttack = ATTACK_TYPES.MALWARE;
                attackProb = 0.4;
            }
        }

        // Specific Scenario: "Black Friday" / End of Year Spike (Last week of Nov)
        if (month === 10 && date.getDate() > 23) {
            dailyBaseVolume += 100;
            dominantAttack = ATTACK_TYPES.WEB_ATTACK; // SQL Injection attempts on high traffic
            attackProb = 0.6;
        }

        // -------------------------------------------------------------
        // 2. EVENT GENERATION LOOP
        // -------------------------------------------------------------

        for (let i = 0; i < dailyBaseVolume; i++) {
            const isAttack = Math.random() < attackProb;
            let type, severity, rule, flow, status;

            if (isAttack) {
                // If a daily theme exists, favor it; otherwise random
                type = (dominantAttack && Math.random() < 0.7) ? dominantAttack : random(Object.values(ATTACK_TYPES));

                status = "New"; // Default status for attacks

                switch (type) {
                    case ATTACK_TYPES.DDOS:
                        severity = "Critical";
                        flow = 1000000 + Math.random() * 5000000; // Giant flow
                        rule = "Volumetric Threshold Exceeded";
                        break;
                    case ATTACK_TYPES.BRUTE_FORCE:
                        severity = "High";
                        flow = 2000 + Math.random() * 5000;
                        rule = "Multiple Failed Logins";
                        break;
                    case ATTACK_TYPES.WEB_ATTACK:
                        severity = "Medium";
                        flow = 500 + Math.random() * 1500;
                        rule = "SQL Injection Pattern";
                        break;
                    case ATTACK_TYPES.PORTSCAN:
                        severity = "High";
                        flow = 100 + Math.random() * 500;
                        rule = "Vertical Scan Detected";
                        break;
                    case ATTACK_TYPES.MALWARE:
                        severity = "Critical"; // Strategic threat!
                        flow = 50 + Math.random() * 200; // Low and slow
                        rule = "C2 Communication Pattern";
                        break;
                    case ATTACK_TYPES.INSIDER:
                        severity = "Medium";
                        flow = 5000 + Math.random() * 10000;
                        rule = "Data Exfiltration Anomaly";
                        break;
                    default:
                        severity = "Low";
                        flow = 100;
                        rule = "Generic Alert";
                }
            } else {
                type = "BENIGN";
                severity = "Info";
                flow = 50 + Math.random() * 500;
                rule = "None";
                status = "Closed";
            }

            // Randomly resolve some old events to make dashboard look realistic
            if (dayOffset > 7 && status === "New") {
                status = random(["Closed", "Investigating", "Blocked"]);
            }

            events.push([
                `${type} Event`,                // title
                severity,                       // severity
                status,                         // status
                `192.168.1.${Math.floor(Math.random() * 255)}`, // source_ip
                "10.0.0.5",                     // dest_ip
                getRandomTimeForDate(date),     // timestamp
                flow.toFixed(2),                // flow_bytes_per_s
                type,                           // label
                isAttack ? "Firewall/IDS" : "None", // ack_lane
                rule                            // detection_rule
            ]);
        }
    }
    return events;
};

async function seed() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Ensure Table Exists
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
                detection_rule VARCHAR(100),
                INDEX idx_timestamp (timestamp), 
                INDEX idx_severity (severity)
            )
        `);
        console.log('Table schema ensured (with indexes).');

        // Optional: Truncate to start fresh (Clean slate for new strategic data)
        console.log('Cleaning old data...');
        await connection.execute('TRUNCATE TABLE events');

        const events = generateStrategicEvents();
        console.log(`Generated ${events.length} events for the last 365 days.`);

        console.log('Starting bulk insert...');

        // Batch Insert to prevent packet too large errors
        const BATCH_SIZE = 1000;
        for (let i = 0; i < events.length; i += BATCH_SIZE) {
            const batch = events.slice(i, i + BATCH_SIZE);
            const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const sql = `INSERT INTO events (title, severity, status, source_ip, dest_ip, timestamp, flow_bytes_per_s, label, ack_lane, detection_rule) VALUES ${placeholders}`;

            // Flatten the batch array for the query
            const values = batch.reduce((acc, val) => acc.concat(val), []);

            await connection.execute(sql, values);
            process.stdout.write(`\rInserted ${Math.min(i + BATCH_SIZE, events.length)} / ${events.length} events...`);
        }

        console.log('\nSeeding completed successfully! 🚀');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('\nSeeding failed:', error);
        process.exit(1);
    }
}

seed();
