INSERT INTO football_competitions_config (competition_id, `group`, enabled, display_name)
VALUES
  (2013, 'BR', 1, 'Brasileirão Série A'),
  (2021, 'INT', 1, 'Premier League'),
  (2002, 'INT', 1, 'Bundesliga')
ON DUPLICATE KEY UPDATE
  enabled = VALUES(enabled),
  display_name = VALUES(display_name);

INSERT INTO broadcast_rules (competition_id, broadcaster, country_code, enabled)
VALUES
  (2013, 'Globo / Premiere', 'BR', 1),
  (2021, 'ESPN / Star+', 'BR', 1)
ON DUPLICATE KEY UPDATE
  broadcaster = VALUES(broadcaster),
  enabled = VALUES(enabled);
