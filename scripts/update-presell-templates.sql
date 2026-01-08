-- Limpar templates antigos
DELETE FROM presell_templates;

-- Inserir os novos tipos de presell que temos implementados
INSERT INTO presell_templates (name, type, template_html, thumbnail_url, is_active) VALUES
('Cookies', 'Cookies', '<div>Template Cookies</div>', NULL, true),
('Idade Homem', 'Idade Homem', '<div>Template Idade Homem</div>', NULL, true),
('Idade Mulher', 'Idade Mulher', '<div>Template Idade Mulher</div>', NULL, true),
('Sexo', 'Sexo', '<div>Template Sexo</div>', NULL, true),
('Maior de Idade', 'Maior de Idade', '<div>Template Maior de Idade</div>', NULL, true),
('Assinar newsletter', 'Assinar newsletter', '<div>Template Newsletter</div>', NULL, true),
('País', 'País', '<div>Template País</div>', NULL, true),
('Teste de captcha', 'Teste de captcha', '<div>Template Captcha</div>', NULL, true),
('Player de vídeo', 'Player de vídeo', '<div>Template Vídeo</div>', NULL, true);

-- Verificar se foi inserido
SELECT * FROM presell_templates ORDER BY id;