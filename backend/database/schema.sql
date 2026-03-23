-- NewZora Database Schema
-- Run this SQL script to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS newzora;
USE newzora;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News table
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(20) PRIMARY KEY,
    news_id INT NOT NULL,
    host_id INT NOT NULL,
    max_users INT DEFAULT 10,
    status ENUM('active', 'ended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_news_id (news_id),
    INDEX idx_host_id (host_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Room participants table
CREATE TABLE IF NOT EXISTS room_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(20) NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (room_id, user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: Sample news articles
-- ============================================

INSERT INTO news (title, content, image_url) VALUES
(
    'Revolutionary AI Model Breaks New Ground in Natural Language Processing',
    'Researchers at leading tech institutions have unveiled a groundbreaking AI model that demonstrates unprecedented capabilities in understanding and generating human language. The new model, trained on diverse datasets from around the world, shows remarkable improvements in contextual understanding and nuanced response generation. Industry experts believe this development could revolutionize fields ranging from healthcare to education, enabling more natural and effective human-computer interactions.',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
),
(
    'Global Climate Summit Reaches Historic Agreement on Carbon Emissions',
    'World leaders have come together at the annual climate summit to announce a landmark agreement that sets ambitious targets for reducing carbon emissions over the next decade. The accord includes binding commitments from major economies and establishes a new framework for monitoring progress. Environmental activists have cautiously welcomed the deal while emphasizing the importance of implementation and accountability.',
    'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800'
),
(
    'Space Tourism Takes Off: Private Companies Begin Commercial Flights',
    'The era of commercial space travel has officially begun as private aerospace companies launch their first paying customers into orbit. Tickets for these historic journeys, while still extremely expensive, have sold out for months ahead. Experts predict that as technology advances and costs decrease, space tourism could become more accessible to a broader range of people within the next decade.',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800'
),
(
    'Breakthrough in Quantum Computing Promises Faster Drug Discovery',
    'Scientists have achieved a major milestone in quantum computing that could dramatically accelerate the process of drug discovery and development. The new quantum system can simulate molecular interactions at speeds previously thought impossible, potentially cutting years off the time needed to bring new medications to market. Healthcare researchers are particularly excited about applications in personalized medicine.',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800'
),
(
    'Remote Work Revolution: Companies Embrace Hybrid Work Models',
    'A comprehensive study of major corporations reveals that hybrid work arrangements have become the new norm across industries. The research shows that employees working in flexible arrangements report higher job satisfaction and productivity levels. Companies are investing heavily in collaboration tools and office redesigns to support this new way of working, signaling a permanent shift in workplace culture.',
    'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=800'
),
(
    'Electric Vehicle Sales Surge as Infrastructure Expands',
    'Electric vehicle manufacturers are reporting record sales as charging infrastructure continues to expand globally. New fast-charging networks are making long-distance travel increasingly practical for EV owners. Government incentives and environmental awareness are driving adoption rates, with several countries announcing plans to phase out traditional combustion engine vehicles entirely.',
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'
),
(
    'Major Cybersecurity Vulnerability Discovered in Popular Software',
    'Security researchers have identified a critical vulnerability affecting millions of devices worldwide. The flaw, discovered in commonly used software, could potentially allow attackers to gain unauthorized access to sensitive data. Software vendors are rushing to release patches, and cybersecurity agencies are urging users to update their systems immediately.',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800'
),
(
    'Archaeological Discovery Rewrites Ancient History Timeline',
    'A team of archaeologists has uncovered artifacts that challenge existing theories about early human civilization. The findings, dating back thousands of years, suggest that sophisticated societies may have developed earlier than previously believed. The discovery has sparked intense debate in academic circles and prompted requests for additional funding to explore the site further.',
    'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800'
);

-- Verify seed data
SELECT 'Seed data inserted successfully!' AS status;
SELECT COUNT(*) AS total_news FROM news;
