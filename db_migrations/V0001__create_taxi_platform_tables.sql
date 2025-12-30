-- Создание таблиц для такси-платформы МДПС

-- Таблица пользователей (пассажиры и водители)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('passenger', 'driver')),
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица балансов пассажиров
CREATE TABLE IF NOT EXISTS passenger_balances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bonus_balance DECIMAL(10, 2) DEFAULT 0.00,
    rub_balance DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Таблица балансов водителей
CREATE TABLE IF NOT EXISTS driver_balances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    shift_active BOOLEAN DEFAULT FALSE,
    shift_ends_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Таблица профилей водителей
CREATE TABLE IF NOT EXISTS driver_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    car_brand VARCHAR(100),
    car_color VARCHAR(50),
    car_number VARCHAR(20),
    license_number VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_trips INTEGER DEFAULT 0,
    UNIQUE(user_id)
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER REFERENCES users(id),
    driver_id INTEGER REFERENCES users(id),
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('bonus', 'rub', 'cash')),
    final_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    comment TEXT,
    passenger_rating INTEGER CHECK (passenger_rating >= 1 AND passenger_rating <= 5),
    passenger_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Таблица транзакций пополнения и вывода
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit_rub', 'deposit_bonus', 'withdrawal', 'shift_payment')),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Таблица промокодов
CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    bonus_amount DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица использованных промокодов
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    promo_code_id INTEGER REFERENCES promo_codes(id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, promo_code_id)
);

-- Таблица настроек системы (для админки)
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица баланса админа
CREATE TABLE IF NOT EXISTS admin_balance (
    id SERIAL PRIMARY KEY,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных данных
INSERT INTO system_settings (setting_key, setting_value) VALUES
    ('city_name', 'Павлово'),
    ('shift_cost', '350'),
    ('discount_percent', '30'),
    ('site_maintenance', 'false')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO admin_balance (balance) SELECT 0.00 WHERE NOT EXISTS (SELECT 1 FROM admin_balance);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_orders_passenger ON orders(passenger_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
