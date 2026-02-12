INSERT INTO tenants (id, nome_da_marca, slug, whatsapp_texto_padrao, texto_curto_padrao, vencimento_em, suporte_whatsapp_url, canal_telegram_url)
VALUES (1, 'Marca Demo', 'marca-demo', '+5511999999999', 'CHAME AQUI', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'https://wa.me/5511999999999', 'https://t.me/canaldemo');

-- Para facilitar primeiro acesso local, senha demo salva em texto plano e convertida no login quando necessário.
INSERT INTO users (tenant_id, email, senha_hash, role)
VALUES (1, 'admin@demo.com', 'admin123', 'admin');
