-- Add Town Bar to restaurants table
-- Run this in Supabase SQL Editor

INSERT INTO restaurants (name, address, lat, lng) VALUES
('Town Bar', '227 Upper Main St, Edgartown, MA 02539', 41.39, -70.54);

-- Verify insert
SELECT * FROM restaurants WHERE name = 'Town Bar';
