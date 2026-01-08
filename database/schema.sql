-- Tabela de usuários (simplificada para MVP)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de domínios disponíveis para presells
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de presells
CREATE TABLE presells (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    domain_id INT NOT NULL,
    page_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL, -- URL amigável
    affiliate_link TEXT NOT NULL,
    producer_sales_page TEXT NOT NULL,
    presell_type VARCHAR(50) CHECK (presell_type IN ('VSL', 'Carta de Vendas', 'Landing Page', 'Página de Captura')) NOT NULL,
    language VARCHAR(20) CHECK (language IN ('Português', 'Inglês', 'Espanhol')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'paused')) DEFAULT 'draft',
    
    -- Conteúdo gerado
    headline TEXT,
    subheadline TEXT,
    content_html TEXT, -- HTML completo da presell
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Métricas
    views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (domain_id) REFERENCES domains(id),
    UNIQUE (domain_id, slug)
);

-- Tabela de templates de presell
CREATE TABLE presell_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('VSL', 'Carta de Vendas', 'Landing Page', 'Página de Captura')) NOT NULL,
    template_html TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tracking de conversões
CREATE TABLE presell_analytics (
    id SERIAL PRIMARY KEY,
    presell_id INT NOT NULL,
    event_type VARCHAR(20) CHECK (event_type IN ('view', 'click', 'conversion')) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (presell_id) REFERENCES presells(id)
);

-- Índices para performance
CREATE INDEX idx_presell_event ON presell_analytics(presell_id, event_type);
CREATE INDEX idx_created ON presell_analytics(created_at);

-- Inserir domínios iniciais
INSERT INTO domains (domain_name) VALUES 
    ('lojaonlineproducts.site'),
    ('theofficialportal.store'),
    ('onlydiscount.site');

-- Inserir templates básicos
INSERT INTO presell_templates (name, type, template_html) VALUES
    ('VSL Padrão', 'VSL', '<div>Template VSL</div>'),
    ('Carta de Vendas Clássica', 'Carta de Vendas', '<div>Template Carta</div>'),
    ('Landing Page Moderna', 'Landing Page', '<div>Template Landing</div>'),
    ('Captura com Isca Digital', 'Página de Captura', '<div>Template Captura</div>');