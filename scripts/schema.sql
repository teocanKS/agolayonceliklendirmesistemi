CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    severity VARCHAR(50), -- Critical, High, Medium, Low, Info
    status VARCHAR(50),   -- New, Investigating, Blocked, Closed
    source_ip VARCHAR(50),
    dest_ip VARCHAR(50),
    timestamp DATETIME,
    flow_bytes_per_s DECIMAL(15, 2),
    label VARCHAR(100),   -- Attack type or Benign
    ack_lane VARCHAR(50),
    detection_rule VARCHAR(100)
);
