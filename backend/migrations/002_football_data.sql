CREATE TABLE IF NOT EXISTS football_competitions_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  competition_id INT NOT NULL,
  `group` ENUM('BR','INT') NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  display_name VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_competition_group (competition_id, `group`)
);

CREATE TABLE IF NOT EXISTS football_matches_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `group` ENUM('BR','INT') NOT NULL,
  `date` DATE NOT NULL,
  payload_json JSON NOT NULL,
  fetched_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  UNIQUE KEY uq_football_cache (`group`, `date`)
);

CREATE TABLE IF NOT EXISTS broadcast_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  competition_id INT NOT NULL,
  broadcaster VARCHAR(120) NOT NULL,
  country_code VARCHAR(8) DEFAULT 'BR',
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
