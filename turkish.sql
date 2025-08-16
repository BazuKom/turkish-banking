CREATE TABLE IF NOT EXISTS bank_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    citizenid VARCHAR(50),
    type VARCHAR(50),
    amount INT,
    color VARCHAR(20),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
