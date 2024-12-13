
CREATE TABLE Stores (
    StoreId SERIAL PRIMARY KEY, 
    StoreName VARCHAR(255) NOT NULL,
    Location VARCHAR(1000) NOT NULL Unique,
    Icon VARCHAR(500),
    UserId varchar(255)
);

CREATE TABLE Categories (
    CategoryId SERIAL PRIMARY KEY, 
    CategoryName VARCHAR(100) NOT NULL
);

CREATE TABLE Products (
    ProductId SERIAL PRIMARY KEY, 
    ProductName VARCHAR(255) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    CategoryId INT REFERENCES Categories(CategoryId),
    ProductImage VARCHAR(500),
    StoreId INT REFERENCES Stores(StoreId) 
);

CREATE TABLE Customers (
    CustomerId SERIAL PRIMARY KEY, 
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE Map (
    MapId SERIAL PRIMARY KEY,
    MapName VARCHAR(100) Unique,
    HeatherMap VARCHAR(50),
    AccessTokenMap VARCHAR(200),
    MapText TEXT NOT NULL
);

CREATE TABLE ApiKeys (
   ApiKeyId SERIAL PRIMARY KEY,
   KeyValue UUID UNIQUE NOT NULL,
   UserId VARCHAR(255) NOT NULL,
   CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   ExpiresAt TIMESTAMP NOT NULL,
   IsActive BOOLEAN NOT NULL DEFAULT TRUE
);


-- Tiendas
INSERT INTO Stores (UserId, StoreName, Icon, Location)
VALUES
    ('user1', 'Gadget Galaxy', 'https://th.bing.com/th/id/OIP.aNb4Bsb0ILFnn4LyAbvQtwHaHa?w=185&h=185&c=7&r=0&o=5&dpr=1.1&pid=1.7', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.154767, -17.406434],
        [-66.154723, -17.406435],
        [-66.154724, -17.406473],
        [-66.154768, -17.406469],
        [-66.154767, -17.406434]
      ]
    ]
  }
}'),
    ('user1', 'Book Haven', 'https://th.bing.com/th/id/OIF.mvNXloXUbrb8d2wLTdMtUQ?w=168&h=180&c=7&r=0&o=5&dpr=1.1&pid=1.7', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.154923, -17.406182],
        [-66.154889, -17.406184],
        [-66.154893, -17.406227],
        [-66.154928, -17.406226],
        [-66.154923, -17.406182]
      ]
    ]
  }
}'),
    ('user1', 'Cafe Bliss', 'https://th.bing.com/th/id/OIP.RnAhuhGV73AYs8WvTe8qbgHaHa?w=201&h=201&c=7&r=0&o=5&dpr=1.1&pid=1.7', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.155084, -17.406414],
        [-66.154973, -17.406415],
        [-66.154974, -17.406447],
        [-66.155085, -17.406448],
        [-66.155084, -17.406414]
      ]
    ]
  }
}'),
    ('user1', 'Fitness Zone', 'https://th.bing.com/th/id/OIF.3pW5YkGsEiYI6NzI4etLcA?w=181&h=181&c=7&r=0&o=5&dpr=1.1&pid=1.7', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.154915, -17.406896],
        [-66.154916, -17.406923],
        [-66.154888, -17.406925],
        [-66.154886, -17.406897],
        [-66.154915, -17.406896]
      ]
    ]
  }
}'),
    ('user1', 'The Toy Chest', 'https://th.bing.com/th/id/OIF.BvrIJ3YgPVWjZnUTlCNNsg?w=191&h=192&c=7&r=0&o=5&dpr=1.1&pid=1.7', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.155334, -17.406784],
        [-66.155275, -17.406781],
        [-66.155277, -17.406832],
        [-66.155336, -17.406831],
        [-66.155334, -17.406784]
      ]
    ]
  }
}'),
    ('user1', 'Natures Basket', 'https://th.bing.com/th/id/OIF.HTfwMjQ3Q4RCp1vkEE04sg?w=174&h=180&c=7&r=0&o=5&dpr=1.1&pid=1.7', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.155175, -17.406174],
        [-66.155142, -17.406175],
        [-66.155146, -17.406219],
        [-66.155179, -17.406217],
        [-66.155175, -17.406174]
      ]
    ]
  }
}'),
    ('user1', 'Fashion Fusion', 'https://th.bing.com/th/id/OIP.6Q8Egx3FlAnoYZavgWNuuwAAAA?w=150&h=150&c=7&r=0&o=5&dpr=1.1&pid=1.7', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.154765, -17.406369],
        [-66.15472, -17.406369],
        [-66.15472, -17.406401],
        [-66.154765, -17.406399],
        [-66.154765, -17.406369]
      ]
    ]
  }
}'),
    ('user1', 'Pet Palace', 'https://res.cloudinary.com/df4jbfzik/image/upload/v1728058471/product/16/wwlfzrkjjx5yerselhin_ng0pev_h8omsd.jpg.png', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.154837, -17.406612],
        [-66.154816, -17.406613],
        [-66.154816, -17.406646],
        [-66.154839, -17.406647],
        [-66.154837, -17.406612]
      ]
    ]
  }
}'),
    ('user1', 'Tech Savvy', 'https://th.bing.com/th?q=Logos+De+Lobos&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.1&pid=InlineBlock&mkt=es-XL&cc=BO&setlang=es&adlt=moderate&t=1&mw=247', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.154927, -17.406381],
        [-66.154894, -17.40638],
        [-66.154894, -17.406405],
        [-66.154928, -17.406403],
        [-66.154927, -17.406381]
      ]
    ]
  }
}'),
    ('user1', 'Beauty Boutique', 'https://th.bing.com/th/id/OIP.Z2xI3Z4h90bsJMoNaxUDEQHaG-?w=185&h=180&c=7&r=0&o=5&dpr=1.1&pid=1.7', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.155418, -17.406984],
        [-66.155379, -17.406984],
        [-66.155381, -17.407019],
        [-66.15542, -17.407019],
        [-66.155418, -17.406984]
      ]
    ]
  }
}'),
    ('user1', 'Home Essentials', 'https://th.bing.com/th?q=Logos+De+Lobos&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.1&pid=InlineBlock&mkt=es-XL&cc=BO&setlang=es&adlt=moderate&t=1&mw=247', '{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-66.155202, -17.407035],
        [-66.155144, -17.407035],
        [-66.155147, -17.407067],
        [-66.155203, -17.407068],
        [-66.155202, -17.407035]
      ]
    ]
  }
}');


-- Categorías
INSERT INTO Categories (CategoryName) VALUES ('Televisores');
INSERT INTO Categories (CategoryName) VALUES ('Celulares');
INSERT INTO Categories (CategoryName) VALUES ('Computadoras');
INSERT INTO Categories (CategoryName) VALUES ('Electrodomésticos');
INSERT INTO Categories (CategoryName) VALUES ('Audio y Video');

-- Productos para la tienda "Gadget Galaxy" (Categoría: Televisores, Celulares)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Televisor Samsung 50" 4K', 'Televisor 4K con pantalla ultra delgada de Samsung', 499.99, 1, 1),
       ('iPhone 13', 'Smartphone Apple con pantalla OLED de 6.1 pulgadas', 999.99, 2, 1),
       ('Samsung Galaxy S21', 'Smartphone Samsung con pantalla de 6.2 pulgadas y cámara triple', 799.99, 2, 1);

-- Productos para la tienda "Book Haven" (Categoría: Computadoras, Celulares)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('MacBook Air 2022', 'Laptop ultraligera con chip M1 y pantalla Retina de 13 pulgadas', 1199.99, 3, 2),
       ('Dell Inspiron 14', 'Laptop Dell con pantalla de 14 pulgadas y procesador Intel Core i5', 899.99, 3, 2),
       ('iPad Mini', 'Tableta compacta de Apple con pantalla de 8.3 pulgadas', 499.99, 3, 2);

-- Productos para la tienda "Cafe Bliss" (Categoría: Electrodomésticos, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Cafetera Philips Espresso', 'Cafetera automática para espresso y cappuccino', 399.99, 4, 3),
       ('Licuadora Oster 10 velocidades', 'Licuadora de alta potencia con jarra de vidrio de 1.5 litros', 99.99, 4, 3),
       ('Altavoz Bose SoundLink', 'Altavoz Bluetooth portátil con sonido estéreo', 179.99, 5, 3);

-- Productos para la tienda "Fitness Zone" (Categoría: Electrodomésticos, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Cinta de Correr Proform', 'Cinta de correr plegable con pantalla táctil y conectividad Bluetooth', 999.99, 4, 4),
       ('Bicicleta Estática NordicTrack', 'Bicicleta estática con múltiples niveles de resistencia', 799.99, 4, 4),
       ('Audífonos Deportivos Beats', 'Audífonos inalámbricos resistentes al sudor con sonido envolvente', 199.99, 5, 4);

-- Productos para la tienda "The Toy Chest" (Categoría: Computadoras, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Nintendo Switch', 'Consola de videojuegos portátil de Nintendo', 299.99, 3, 5),
       ('Xbox Series X', 'Consola de videojuegos de última generación con soporte 4K', 499.99, 3, 5),
       ('Sony WH-1000XM4', 'Auriculares inalámbricos con cancelación activa de ruido', 349.99, 5, 5);

-- Productos para la tienda "Nature’s Basket" (Categoría: Electrodomésticos, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Refrigerador LG Smart 500L', 'Refrigerador con conectividad WiFi y dispensador de agua', 1199.99, 4, 6),
       ('Licuadora Ninja Pro', 'Licuadora de alto rendimiento con jarra de 2 litros', 129.99, 4, 6),
       ('Altavoz Sonos One', 'Altavoz inteligente compatible con Alexa y Google Assistant', 199.99, 5, 6);

-- Productos para la tienda "Fashion Fusion" (Categoría: Computadoras, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('iPad Pro 11"', 'Tableta de alto rendimiento con pantalla de 11 pulgadas y Face ID', 799.99, 3, 7),
       ('Laptop Lenovo ThinkPad', 'Laptop empresarial con pantalla de 14 pulgadas y batería de larga duración', 1399.99, 3, 7),
       ('Auriculares Sony WH-CH510', 'Auriculares Bluetooth con autonomía de 35 horas', 79.99, 5, 7);

-- Productos para la tienda "Pet Palace" (Categoría: Computadoras, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Cámara de Seguridad PetCam', 'Cámara de seguridad para monitoreo de mascotas con WiFi', 249.99, 3, 8),
       ('Altavoz Amazon Echo Dot', 'Altavoz inteligente con asistente virtual Alexa', 49.99, 5, 8),
       ('Aspiradora Dyson V11', 'Aspiradora inalámbrica con succión potente, ideal para mascotas', 499.99, 4, 8);

-- Productos para la tienda "Tech Savvy" (Categoría: Computadoras, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Monitor Samsung 32" Curvo', 'Monitor 4K UHD con pantalla curva de 32 pulgadas', 399.99, 3, 9),
       ('Asus ROG Gaming Laptop', 'Laptop para juegos con tarjeta gráfica Nvidia RTX', 1799.99, 3, 9),
       ('Sony PS5', 'Consola de videojuegos PlayStation 5 con soporte 4K', 499.99, 3, 9);

-- Productos para la tienda "Beauty Boutique" (Categoría: Electrodomésticos, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Secador de Cabello Dyson Supersonic', 'Secador de cabello con tecnología avanzada de control de temperatura', 399.99, 4, 10),
       ('Plancha de Cabello Remington', 'Plancha de cabello de cerámica con temperatura ajustable', 69.99, 4, 10),
       ('Auriculares Beats Studio', 'Auriculares inalámbricos con cancelación de ruido y sonido envolvente', 299.99, 5, 10);

-- Productos para la tienda "Home Essentials" (Categoría: Electrodomésticos, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Licuadora KitchenAid Pro', 'Licuadora profesional de alto rendimiento con jarra de vidrio', 199.99, 4, 11),
       ('Refrigerador Samsung French Door', 'Refrigerador de puertas francesas con tecnología No Frost', 1899.99, 4, 11),
       ('Bocinas Harman Kardon', 'Sistema de sonido estéreo con conectividad Bluetooth', 299.99, 5, 11);

-- Productos para la tienda "Gadget Galaxy" (Categoría: Televisores, Celulares)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Televisor Samsung 50" 4K', 'Televisor 4K con pantalla ultra delgada de Samsung', 499.99, 1, 1),
       ('iPhone 13', 'Smartphone Apple con pantalla OLED de 6.1 pulgadas', 999.99, 2, 1),
       ('Samsung Galaxy S21', 'Smartphone Samsung con pantalla de 6.2 pulgadas y cámara triple', 799.99, 2, 1),
       ('Bocina JBL Flip 5', 'Bocina portátil resistente al agua con sonido potente', 99.99, 5, 1),
       ('Bocinas Sony 5.1', 'Sistema de sonido Sony 5.1 con subwoofer', 299.99, 5, 1),
       ('Sonos One SL', 'Altavoz inteligente con sonido claro y potente', 179.99, 5, 1);

-- Productos para la tienda "Book Haven" (Categoría: Computadoras, Celulares)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('MacBook Air 2022', 'Laptop ultraligera con chip M1 y pantalla Retina de 13 pulgadas', 1199.99, 3, 2),
       ('Dell Inspiron 14', 'Laptop Dell con pantalla de 14 pulgadas y procesador Intel Core i5', 899.99, 3, 2),
       ('iPad Mini', 'Tableta compacta de Apple con pantalla de 8.3 pulgadas', 499.99, 3, 2);

-- Productos para la tienda "Cafe Bliss" (Categoría: Electrodomésticos, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Cafetera Philips Espresso', 'Cafetera automática para espresso y cappuccino', 399.99, 4, 3),
       ('Licuadora Oster 10 velocidades', 'Licuadora de alta potencia con jarra de vidrio de 1.5 litros', 99.99, 4, 3),
       ('Altavoz Bose SoundLink', 'Altavoz Bluetooth portátil con sonido estéreo', 179.99, 5, 3);

-- Productos para la tienda "Fitness Zone" (Categoría: Electrodomésticos, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Cinta de Correr Proform', 'Cinta de correr plegable con pantalla táctil y conectividad Bluetooth', 999.99, 4, 4),
       ('Bicicleta Estática NordicTrack', 'Bicicleta estática con múltiples niveles de resistencia', 799.99, 4, 4),
       ('Audífonos Deportivos Beats', 'Audífonos inalámbricos resistentes al sudor con sonido envolvente', 199.99, 5, 4);

-- Productos para la tienda "The Toy Chest" (Categoría: Computadoras, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Nintendo Switch', 'Consola de videojuegos portátil de Nintendo', 299.99, 3, 5),
       ('Xbox Series X', 'Consola de videojuegos de última generación con soporte 4K', 499.99, 3, 5),
       ('Sony WH-1000XM4', 'Auriculares inalámbricos con cancelación activa de ruido', 349.99, 5, 5);

-- Productos para la tienda "Nature’s Basket" (Categoría: Electrodomésticos, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Refrigerador LG Smart 500L', 'Refrigerador con conectividad WiFi y dispensador de agua', 1199.99, 4, 6),
       ('Licuadora Ninja Pro', 'Licuadora de alto rendimiento con jarra de 2 litros', 129.99, 4, 6),
       ('Altavoz Sonos One', 'Altavoz inteligente compatible con Alexa y Google Assistant', 199.99, 5, 6);

-- Productos para la tienda "Fashion Fusion" (Categoría: Computadoras, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('iPad Pro 11"', 'Tableta de alto rendimiento con pantalla de 11 pulgadas y Face ID', 799.99, 3, 7),
       ('Laptop Lenovo ThinkPad', 'Laptop empresarial con pantalla de 14 pulgadas y batería de larga duración', 1399.99, 3, 7),
       ('Auriculares Sony WH-CH510', 'Auriculares Bluetooth con autonomía de 35 horas', 79.99, 5, 7);

-- Productos para la tienda "Pet Palace" (Categoría: Computadoras, Audio y Video)
INSERT INTO Products (ProductName, Description, Price, CategoryId, StoreId)
VALUES ('Cámara de Seguridad PetCam', 'Cámara de seguridad para monitoreo de mascotas con WiFi', 249.99, 3, 8),
       ('Altavoz Amazon Echo Dot', 'Altavoz inteligente con asistente de voz integrado', 49.99, 5, 8);

-- Clientes
INSERT INTO Customers (FirstName, LastName, Email)
VALUES ('Juan', 'Pérez', 'juan.perez@example.com');

INSERT INTO Customers (FirstName, LastName, Email)
VALUES ('Ana', 'Martínez', 'ana.martinez@example.com');

INSERT INTO Customers (FirstName, LastName, Email)
VALUES ('Luis', 'Gómez', 'luis.gomez@example.com');

INSERT INTO Customers (FirstName, LastName, Email)
VALUES ('María', 'Rodríguez', 'maria.rodriguez@example.com');

INSERT INTO Customers (FirstName, LastName, Email)
VALUES ('Carlos', 'López', 'carlos.lopez@example.com');
