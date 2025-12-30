-- Добавление таблицы администраторов

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание первого админа (логин: admin, пароль: admin123)
-- Пароль admin123 хеш SHA-256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO admins (username, password_hash, full_name) VALUES
    ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Главный администратор')
ON CONFLICT (username) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
