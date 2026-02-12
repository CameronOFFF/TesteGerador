CREATE TABLE tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_da_marca VARCHAR(120) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  logo_url VARCHAR(255) NULL,
  whatsapp_texto_padrao VARCHAR(120) NULL,
  texto_curto_padrao VARCHAR(13) NULL,
  vencimento_em DATE NOT NULL,
  limite_troca_logo_dia INT NOT NULL DEFAULT 2,
  suporte_whatsapp_url VARCHAR(255) NULL,
  canal_telegram_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE logo_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  change_date DATE NOT NULL,
  change_count INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_logo_changes (tenant_id, change_date),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE searches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  type ENUM('movie','series') NOT NULL,
  query VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  type VARCHAR(80) NOT NULL,
  payload_json JSON NOT NULL,
  status ENUM('pending','processing','done','failed') NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  result_url VARCHAR(255) NULL,
  error TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE cached_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sport VARCHAR(40) NOT NULL,
  date_key VARCHAR(40) NOT NULL,
  data_json JSON NOT NULL,
  fetched_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  UNIQUE KEY uq_cache (sport, date_key)
);
