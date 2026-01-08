import { Pool } from 'pg';

// Função helper para validar senha
function getDbPassword(): string | undefined {
  const pwd = process.env.DB_PASSWORD;
  // Se a variável não existe, está vazia ou é uma string vazia, retorna undefined
  if (!pwd || pwd.trim() === '') {
    return undefined;
  }
  return pwd;
}

// Configuração do banco de dados PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: getDbPassword(),
  database: process.env.DB_NAME || 'hubfi',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 10, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo para fechar conexões inativas
  connectionTimeoutMillis: 2000, // tempo para conectar
  ssl: process.env.DB_SSL === 'require' ? { rejectUnauthorized: false } : false,
};

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(dbConfig);
  }

  async query(sql: string, params?: any[]): Promise<any> {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = new Database();