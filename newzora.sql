CREATE DATABASE newzora

USE newzora;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id VARCHAR(50) PRIMARY KEY,
  news_id INT,
  host_id INT,
  max_users INT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(50),
  user_id INT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO news (title, content, image_url)
VALUES 
('Breaking News 1', 'This is sample news content', 'https://via.placeholder.com/300'),
('Breaking News 2', 'Another news content', 'https://via.placeholder.com/300');