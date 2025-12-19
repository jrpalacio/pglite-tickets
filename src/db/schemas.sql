-- =========================
-- Tabla de productos
-- =========================
CREATE TABLE productos (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  price NUMERIC NOT NULL,
  category SMALLINT NOT NULL,
  poins SMALLINT NOT NULL,
  contents TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Tabla de tickets
-- =========================
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
);

-- =========================
-- Tabla de detalles de tickets
-- =========================
CREATE TABLE IF NOT EXISTS ticket_details (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC NOT NULL,

  CONSTRAINT fk_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES productos(id)
);

-- =========================
-- Insertar productos iniciales
-- =========================
INSERT INTO productos (name, price, category, poins, contents) VALUES
('Happy Drop', 1158.00, 1, 20, '20 ml'),
('Happy Ending', 276.00, 2, 4, '60 ml'),
('Happy Face Day', 695.00, 3, 12, '60 ml'),
('Happy Face Night', 695.00, 3, 12, '60 ml'),
('Happy Focus', 992.00, 1, 17, '20 ml'),
('Happy Gummies', 710.00, 4, 13, '25 piezas'),
('Happy Honey', 1158.00, 1, 20, '20 ml'),
('Happy Kids', 970.00, 1, 17, '20 ml'),
('Happy Oil 250ml', 882.00, 2, 15, '250 ml'),
('Happy Oil 60ml', 276.00, 2, 4, '60 ml'),
('Happy Pet', 827.00, 1, 15, '20 ml'),
('Happy Power', 850.00, 5, 20, '60 capsulas'),
('Happy Sleep', 992.00, 1, 17, '20 ml');