import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Pure Fabrication: isola a criação da conexão e do schema
export class DatabaseConnection {
  private static instance: Database.Database | null = null;

  private constructor() {}

  public static getInstance(): Database.Database {
    if (!DatabaseConnection.instance) {
      const dbPath = path.join(app.getPath('userData'), 'biblioteca.db');
      DatabaseConnection.instance = new Database(dbPath);
      DatabaseConnection.instance.pragma('journal_mode = WAL');
      DatabaseConnection.instance.pragma('foreign_keys = ON');
      DatabaseConnection.createSchema(DatabaseConnection.instance);
    }
    return DatabaseConnection.instance;
  }

  private static createSchema(db: Database.Database): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS professor (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        primeiro_nome   TEXT NOT NULL,
        sobrenome       TEXT NOT NULL,
        email           TEXT NOT NULL UNIQUE,
        status          TEXT NOT NULL DEFAULT 'ATIVO'
                        CHECK (status IN ('ATIVO', 'INATIVO')),
        data_cadastro   TEXT NOT NULL,
        data_atualizacao TEXT NOT NULL
      );
    `);
  }
}