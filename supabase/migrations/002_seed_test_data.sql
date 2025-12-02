-- ============================================
-- Seed Test Data for Looque CRM
-- ============================================

-- ============================================
-- USERS (Employees)
-- ============================================
DO $$
DECLARE
  emp1_id UUID := 'cf6de5b6-636d-4fdb-ad5c-4b1242800757';
  emp2_id UUID := 'f6821329-d037-4394-86c0-d6e925a1fd87';
  emp3_id UUID := 'f6b2eab2-2736-468b-a0c6-cec16551736d';
  emp4_id UUID := 'a24c980e-fbe5-4c18-aeaf-6895b7d947d6';
  emp5_id UUID := 'eb8616b4-888d-46bd-8fb4-28ed1c238321';
  emp6_id UUID := '81e5b5a8-ebfb-4ee4-aef3-1a4b697f4559';
  emp7_id UUID := '0d790689-dc1d-4273-8b86-df0377a6f978';
  emp8_id UUID := '67dfd819-627c-49a3-bfa7-630fe1c49f6f';
BEGIN
  INSERT INTO users (user_id, role, full_name, email, phone, salary, salary_per_day) VALUES
    (emp1_id, 'cashier', 'Sarah Johnson', 'sarah.johnson@looque.com', '+1234567891', 3000.00, 100.00),
    (emp2_id, 'sales_executive', 'Michael Chen', 'michael.chen@looque.com', '+1234567892', 3500.00, 116.67),
    (emp3_id, 'fashion_designer', 'Emma Williams', 'emma.williams@looque.com', '+1234567893', 4500.00, 150.00),
    (emp4_id, 'tailor', 'David Brown', 'david.brown@looque.com', '+1234567894', 3200.00, 106.67),
    (emp5_id, 'manager', 'Lisa Anderson', 'lisa.anderson@looque.com', '+1234567895', 5000.00, 166.67),
    (emp6_id, 'event_manager', 'James Wilson', 'james.wilson@looque.com', '+1234567896', 3800.00, 126.67),
    (emp7_id, 'cashier', 'Maria Garcia', 'maria.garcia@looque.com', '+1234567897', 3000.00, 100.00),
    (emp8_id, 'sales_executive', 'Robert Taylor', 'robert.taylor@looque.com', '+1234567898', 3500.00, 116.67)
  ON CONFLICT (user_id) DO NOTHING;
END $$;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (name, description) VALUES
  ('T-Shirts', 'Casual and comfortable t-shirts'),
  ('Jeans', 'Classic and modern denim jeans'),
  ('Dresses', 'Elegant and stylish dresses'),
  ('Jackets', 'Warm and fashionable jackets'),
  ('Shoes', 'Comfortable and trendy footwear'),
  ('Accessories', 'Bags, belts, and other accessories')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (name, description, category_id, base_price) 
SELECT 
  p.name,
  p.description,
  c.id as category_id,
  p.base_price
FROM (VALUES
  ('Classic White T-Shirt', 'Premium cotton t-shirt, perfect for everyday wear', 'T-Shirts', 29.99),
  ('Slim Fit Jeans', 'Modern slim fit denim jeans', 'Jeans', 79.99),
  ('Summer Dress', 'Light and breezy summer dress', 'Dresses', 59.99),
  ('Leather Jacket', 'Genuine leather jacket', 'Jackets', 199.99),
  ('Sneakers', 'Comfortable running sneakers', 'Shoes', 89.99),
  ('Denim Jacket', 'Classic denim jacket', 'Jackets', 69.99),
  ('Black T-Shirt', 'Essential black cotton t-shirt', 'T-Shirts', 24.99),
  ('Skinny Jeans', 'Trendy skinny fit jeans', 'Jeans', 84.99),
  ('Evening Dress', 'Elegant evening dress', 'Dresses', 129.99),
  ('Boots', 'Stylish leather boots', 'Shoes', 119.99)
) AS p(name, description, category_name, base_price)
JOIN categories c ON c.name = p.category_name
ON CONFLICT DO NOTHING;

-- ============================================
-- SAFE INSERT FOR PRODUCT VARIANTS
-- ============================================
DO $$
DECLARE
  tshirt_id UUID;
  jeans_id UUID;
  dress_id UUID;
  jacket_id UUID;
  sneakers_id UUID;
BEGIN
  SELECT id INTO tshirt_id FROM products WHERE name = 'Classic White T-Shirt' LIMIT 1;
  SELECT id INTO jeans_id FROM products WHERE name = 'Slim Fit Jeans' LIMIT 1;
  SELECT id INTO dress_id FROM products WHERE name = 'Summer Dress' LIMIT 1;
  SELECT id INTO jacket_id FROM products WHERE name = 'Leather Jacket' LIMIT 1;
  SELECT id INTO sneakers_id FROM products WHERE name = 'Sneakers' LIMIT 1;

  IF tshirt_id IS NOT NULL THEN
    INSERT INTO product_variants (product_id, size, color, sku, price, stock_quantity, reorder_point)
    VALUES
      (tshirt_id, 'S', 'White', 'TSH-WHT-S', 29.99, 50, 10),
      (tshirt_id, 'M', 'White', 'TSH-WHT-M', 29.99, 75, 10),
      (tshirt_id, 'L', 'White', 'TSH-WHT-L', 29.99, 60, 10),
      (tshirt_id, 'XL', 'White', 'TSH-WHT-XL', 29.99, 40, 10)
    ON CONFLICT (sku) DO NOTHING;
  END IF;

  IF jeans_id IS NOT NULL THEN
    INSERT INTO product_variants (product_id, size, color, sku, price, stock_quantity, reorder_point)
    VALUES
      (jeans_id, '28', 'Blue', 'JNS-BLU-28', 79.99, 30, 5),
      (jeans_id, '30', 'Blue', 'JNS-BLU-30', 79.99, 45, 5),
      (jeans_id, '32', 'Blue', 'JNS-BLU-32', 79.99, 50, 5),
      (jeans_id, '34', 'Blue', 'JNS-BLU-34', 79.99, 35, 5)
    ON CONFLICT (sku) DO NOTHING;
  END IF;

  IF dress_id IS NOT NULL THEN
    INSERT INTO product_variants (product_id, size, color, sku, price, stock_quantity, reorder_point)
    VALUES
      (dress_id, 'S', 'Red', 'DRS-RED-S', 59.99, 25, 5),
      (dress_id, 'M', 'Red', 'DRS-RED-M', 59.99, 30, 5),
      (dress_id, 'L', 'Red', 'DRS-RED-L', 59.99, 20, 5)
    ON CONFLICT (sku) DO NOTHING;
  END IF;

  IF jacket_id IS NOT NULL THEN
    INSERT INTO product_variants (product_id, size, color, sku, price, stock_quantity, reorder_point)
    VALUES
      (jacket_id, 'M', 'Black', 'JCK-BLK-M', 199.99, 15, 3),
      (jacket_id, 'L', 'Black', 'JCK-BLK-L', 199.99, 20, 3),
      (jacket_id, 'XL', 'Black', 'JCK-BLK-XL', 199.99, 12, 3)
    ON CONFLICT (sku) DO NOTHING;
  END IF;

  IF sneakers_id IS NOT NULL THEN
    INSERT INTO product_variants (product_id, size, color, sku, price, stock_quantity, reorder_point)
    VALUES
      (sneakers_id, '8', 'White', 'SNK-WHT-8', 89.99, 40, 10),
      (sneakers_id, '9', 'White', 'SNK-WHT-9', 89.99, 50, 10),
      (sneakers_id, '10', 'White', 'SNK-WHT-10', 89.99, 45, 10),
      (sneakers_id, '11', 'White', 'SNK-WHT-11', 89.99, 35, 10)
    ON CONFLICT (sku) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- CUSTOMERS
-- ============================================
INSERT INTO customers (full_name, email, phone, address, segment) VALUES
  ('John Smith', 'john.smith@email.com', '+1987654321', '123 Main St, New York, NY', 'VIP'),
  ('Emily Davis', 'emily.davis@email.com', '+1987654322', '456 Oak Ave, Los Angeles, CA', 'frequent'),
  ('Chris Martinez', 'chris.martinez@email.com', '+1987654323', '789 Pine Rd, Chicago, IL', 'regular'),
  ('Jessica Lee', 'jessica.lee@email.com', '+1987654324', '321 Elm St, Houston, TX', 'VIP'),
  ('Daniel Kim', 'daniel.kim@email.com', '+1987654325', '654 Maple Dr, Phoenix, AZ', 'frequent'),
  ('Sophia Brown', 'sophia.brown@email.com', '+1987654326', '987 Cedar Ln, Philadelphia, PA', 'regular'),
  ('Matthew Wilson', 'matthew.wilson@email.com', '+1987654327', '147 Birch Way, San Antonio, TX', 'at_risk'),
  ('Olivia Moore', 'olivia.moore@email.com', '+1987654328', '258 Spruce St, San Diego, CA', 'VIP'),
  ('William Taylor', 'william.taylor@email.com', '+1987654329', '369 Willow Ave, Dallas, TX', 'frequent'),
  ('Ava Anderson', 'ava.anderson@email.com', '+1987654330', '741 Cherry Blvd, San Jose, CA', 'regular'),
  ('James Thomas', 'james.thomas@email.com', '+1987654331', '852 Ash St, Austin, TX', 'regular'),
  ('Isabella Jackson', 'isabella.jackson@email.com', '+1987654332', '963 Poplar Rd, Jacksonville, FL', 'VIP'),
  ('Benjamin White', 'benjamin.white@email.com', '+1987654333', '159 Hickory Ln, Fort Worth, TX', 'frequent'),
  ('Mia Harris', 'mia.harris@email.com', '+1987654334', '357 Magnolia Dr, Columbus, OH', 'regular'),
  ('Lucas Martin', 'lucas.martin@email.com', '+1987654335', '468 Cypress Way, Charlotte, NC', 'regular')
ON CONFLICT DO NOTHING;

-- ============================================
-- ATTENDANCE
-- ============================================
INSERT INTO attendance (user_id, date, check_in_time, status)
SELECT 
  u.id as user_id,
  CURRENT_DATE - (d.day_offset || ' days')::INTERVAL as date,
  (CURRENT_DATE - (d.day_offset || ' days')::INTERVAL + TIME '09:00:00' + (RANDOM() * INTERVAL '2 hours')) as check_in_time,
  CASE 
    WHEN RANDOM() > 0.1 THEN 'present'
    WHEN RANDOM() > 0.5 THEN 'absent'
    ELSE 'late'
  END as status
FROM users u
CROSS JOIN generate_series(0, 29) AS d(day_offset)
WHERE u.role != 'admin'
  AND RANDOM() > 0.15
ON CONFLICT (user_id, date) DO NOTHING;

-- ============================================
-- ORDERS
-- ============================================
INSERT INTO orders (customer_id, order_number, status, total_amount, shipping_address, payment_status)
SELECT 
  c.id as customer_id,
  'ORD-' || TO_CHAR(CURRENT_DATE - (d.day_offset || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD(o.order_num::TEXT, 4, '0') as order_number,
  (ARRAY['pending', 'processing', 'shipped', 'delivered', 'cancelled'])[FLOOR(RANDOM() * 5 + 1)] as status,
  (RANDOM() * 500 + 50)::DECIMAL(10,2) as total_amount,
  c.address as shipping_address,
  CASE 
    WHEN RANDOM() > 0.3 THEN 'paid'
    ELSE 'pending'
  END as payment_status
FROM customers c
CROSS JOIN generate_series(0, 60) AS d(day_offset)
CROSS JOIN generate_series(1, 3) AS o(order_num)
WHERE RANDOM() > 0.7
LIMIT 50
ON CONFLICT (order_number) DO NOTHING;

-- ============================================
-- ORDER ITEMS
-- ============================================
INSERT INTO order_items (order_id, product_variant_id, quantity, price, subtotal)
SELECT 
  o.id as order_id,
  pv.id as product_variant_id,
  FLOOR(RANDOM() * 3 + 1)::INTEGER as quantity,
  pv.price,
  pv.price * FLOOR(RANDOM() * 3 + 1)::INTEGER as subtotal
FROM orders o
CROSS JOIN product_variants pv
WHERE RANDOM() > 0.7
LIMIT 100
ON CONFLICT DO NOTHING;

-- ============================================
-- INVENTORY MOVEMENTS
-- ============================================
INSERT INTO inventory (product_variant_id, movement_type, quantity, notes, created_by)
SELECT 
  pv.id as product_variant_id,
  (ARRAY['in', 'out', 'sale', 'adjustment'])[FLOOR(RANDOM() * 4 + 1)] as movement_type,
  FLOOR(RANDOM() * 20 + 1)::INTEGER as quantity,
  CASE 
    WHEN RANDOM() > 0.7 THEN 'Stock adjustment'
    WHEN RANDOM() > 0.5 THEN 'Sale transaction'
    ELSE 'Inventory update'
  END as notes,
  (SELECT id FROM users WHERE role != 'admin' ORDER BY RANDOM() LIMIT 1) as created_by
FROM product_variants pv
CROSS JOIN generate_series(1, 5) AS i(movement_num)
WHERE RANDOM() > 0.5
LIMIT 50
ON CONFLICT DO NOTHING;

-- ============================================
-- TICKETS
-- ============================================
INSERT INTO tickets (customer_id, subject, description, status, priority, assigned_to)
SELECT 
  c.id as customer_id,
  (ARRAY['Order not received', 'Product defect', 'Return request', 'Size exchange', 'Payment issue', 'Shipping delay'])[FLOOR(RANDOM() * 6 + 1)] as subject,
  'Customer inquiry about: ' || (ARRAY['Order not received', 'Product defect', 'Return request', 'Size exchange', 'Payment issue', 'Shipping delay'])[FLOOR(RANDOM() * 6 + 1)] as description,
  (ARRAY['open', 'in_progress', 'resolved', 'closed'])[FLOOR(RANDOM() * 4 + 1)] as status,
  (ARRAY['low', 'medium', 'high', 'urgent'])[FLOOR(RANDOM() * 4 + 1)] as priority,
  (SELECT id FROM users WHERE role != 'admin' ORDER BY RANDOM() LIMIT 1) as assigned_to
FROM customers c
CROSS JOIN generate_series(1, 2) AS t(ticket_num)
WHERE RANDOM() > 0.7
LIMIT 20
ON CONFLICT DO NOTHING;

-- ============================================
-- SALARY RECORDS
-- ============================================
INSERT INTO salary_records (user_id, month, year, present_days, absent_days, salary_amount, calculated_amount, status)
SELECT 
  u.id as user_id,
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER as month,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as year,
  (SELECT COUNT(*) FROM attendance WHERE user_id = u.id AND status = 'present' AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)) as present_days,
  (SELECT COUNT(*) FROM attendance WHERE user_id = u.id AND status = 'absent' AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)) as absent_days,
  u.salary as salary_amount,
  u.salary_per_day * COALESCE((SELECT COUNT(*) FROM attendance WHERE user_id = u.id AND status = 'present' AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)), 0) as calculated_amount,
  CASE WHEN RANDOM() > 0.5 THEN 'paid' ELSE 'pending' END as status
FROM users u
WHERE u.role != 'admin'
ON CONFLICT (user_id, month, year) DO UPDATE
SET 
  present_days = EXCLUDED.present_days,
  absent_days = EXCLUDED.absent_days,
  calculated_amount = EXCLUDED.calculated_amount;
