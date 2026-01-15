// Database utilities

export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || '';
}

export function parseDatabaseUrl(url: string): DatabaseConnection {
  const parsed = new URL(url);
  
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 5432,
    database: parsed.pathname.slice(1),
    user: parsed.username,
    password: parsed.password
  };
}