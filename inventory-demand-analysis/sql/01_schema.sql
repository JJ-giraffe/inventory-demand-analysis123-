CREATE TABLE products(sku TEXT PRIMARY KEY,name TEXT NOT NULL,stock INTEGER CHECK(stock>=0),unit_cost REAL CHECK(unit_cost>=0),lead_days INTEGER CHECK(lead_days>=0));
CREATE TABLE sales(date TEXT NOT NULL,sku TEXT REFERENCES products(sku),units INTEGER CHECK(units>=0),PRIMARY KEY(date,sku));
