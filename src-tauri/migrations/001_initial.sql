CREATE TABLE IF NOT EXISTS app_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS restaurant_tables(id TEXT PRIMARY KEY,name TEXT NOT NULL,sort_order INTEGER NOT NULL,is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY,table_id TEXT NOT NULL,booking_date TEXT NOT NULL,start_time TEXT NOT NULL,end_time TEXT NOT NULL,guest_name TEXT NOT NULL,phone TEXT,guest_count INTEGER NOT NULL,comment TEXT,status TEXT NOT NULL CHECK(status IN ('confirmed','pending','seated','completed','cancelled')),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(table_id) REFERENCES restaurant_tables(id) ON DELETE RESTRICT);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_table_date ON bookings(table_id,booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
INSERT OR IGNORE INTO app_settings(key,value) VALUES('restaurantName','Peybey CRM'),('dayStart','09:00'),('dayEnd','23:00'),('stepMinutes','30'),('showCompleted','true');
