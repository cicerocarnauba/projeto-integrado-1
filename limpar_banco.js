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

console.log('Limpando bancos de dados (removendo todos os registros)...\n');

targets.forEach(target => {
  try {
    if (!fs.existsSync(target.caminho)) {
      console.log(`- ${target.nome}: Arquivo de banco ainda não existe (${target.caminho}).`);
      return;
    }

    const db = new Database(target.caminho);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = OFF');

    db.exec(`
      DELETE FROM item_emprestimo;
      DELETE FROM emprestimo;
      DELETE FROM livro;
      DELETE FROM turma;
      DELETE FROM professor;
      DELETE FROM sqlite_sequence WHERE name IN ('item_emprestimo', 'emprestimo', 'livro', 'turma', 'professor');
    `);

    db.pragma('foreign_keys = ON');

    const profs = db.prepare('SELECT count(*) as c FROM professor').get().c;
    const turmas = db.prepare('SELECT count(*) as c FROM turma').get().c;
    const livros = db.prepare('SELECT count(*) as c FROM livro').get().c;
    const emprestimos = db.prepare('SELECT count(*) as c FROM emprestimo').get().c;
    const itensEmp = db.prepare('SELECT count(*) as c FROM item_emprestimo').get().c;

    console.log(`✓ ${target.nome}:`);
    console.log(`  Arquivo: ${target.caminho}`);
    console.log(`  - Professores: ${profs}`);
    console.log(`  - Turmas: ${turmas}`);
    console.log(`  - Livros: ${livros}`);
    console.log(`  - Empréstimos: ${emprestimos}`);
    console.log(`  - Itens de Empréstimo: ${itensEmp}\n`);

    db.close();
  } catch (err) {
    console.error(`Erro ao limpar ${target.nome}:`, err.message);
  }
});

console.log('Bancos de dados esvaziados com sucesso!');
