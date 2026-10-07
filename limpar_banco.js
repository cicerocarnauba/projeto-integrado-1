const fs = require('fs');
const path = require('path');
const os = require('os');
const Database = require('better-sqlite3');

const devPath = path.join(os.homedir(), '.config (development)', 'biblioteca.db');
const prodPath = path.join(os.homedir(), '.config', 'projeto-integrado-1', 'biblioteca.db');

const targets = [
  { nome: 'Desenvolvimento (npm run dev)', caminho: devPath },
  { nome: 'Produção (app empacotado)', caminho: prodPath }
];

console.log('Limpando dados do banco de dados SQLite...\n');

targets.forEach(target => {
  try {
    if (!fs.existsSync(target.caminho)) {
      console.log(`- ${target.nome}: arquivo não encontrado (${target.caminho})\n`);
      return;
    }

    const db = new Database(target.caminho);
    db.pragma('foreign_keys = OFF');

    // Identifica todas as tabelas criadas pelo sistema
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all();

    if (tables.length === 0) {
      console.log(`- ${target.nome}: nenhuma tabela encontrada.`);
      db.close();
      return;
    }

    // Remove todos os registros de cada tabela
    tables.forEach(({ name }) => {
      db.exec(`DELETE FROM "${name}";`);
    });

    // Reseta os IDs auto-incrementáveis
    const hasSeq = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'")
      .get();
    if (hasSeq) {
      db.exec("DELETE FROM sqlite_sequence;");
    }

    db.pragma('foreign_keys = ON');
    db.exec('VACUUM;');

    console.log(`✓ ${target.nome}:`);
    console.log(`  Arquivo: ${target.caminho}`);
    tables.forEach(({ name }) => {
      const count = db.prepare(`SELECT count(*) as c FROM "${name}"`).get().c;
      console.log(`  - ${name}: ${count} registros`);
    });
    console.log('');

    db.close();
  } catch (err) {
    console.error(`Erro ao limpar ${target.nome}:`, err.message);
  }
});

console.log('Banco de dados limpo com sucesso!');
