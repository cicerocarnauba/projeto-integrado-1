const fs = require('fs');
const path = require('path');
const os = require('os');
const Database = require('better-sqlite3');

const devPath = path.join(os.homedir(), '.config (development)', 'biblioteca.db');
const prodPath = path.join(os.homedir(), '.config', 'projeto-integrado-1', 'biblioteca.db');
const sqlFile = path.join(__dirname, 'seed_dados.sql');

if (!fs.existsSync(sqlFile)) {
  console.error('Arquivo seed_dados.sql não encontrado!');
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8');

const targets = [
  { nome: 'Desenvolvimento (npm run dev)', caminho: devPath },
  { nome: 'Produção (app empacotado)', caminho: prodPath }
];

console.log('Populando bancos de dados...\n');

targets.forEach(target => {
  try {
    const dir = path.dirname(target.caminho);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const db = new Database(target.caminho);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Executa a carga do seed
    db.exec(sql);
    // Garante que livros inativos tenham obrigatoriamente 0 exemplares e 0 emprestados
    db.exec("UPDATE livro SET quantidade_total = 0, quantidade_emprestada = 0 WHERE status = 'INATIVO';");

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
    console.error(`Erro ao atualizar ${target.nome}:`, err.message);
  }
});

console.log('Banco de dados populado com sucesso cobrindo todos os cenários de teste!');
console.log('Cenários disponíveis em cada entidade:');
console.log('  1. SEM histórico (Excluir físico)');
console.log('  2. COM histórico concluído (Desativar com sucesso)');
console.log('  3. COM empréstimo pendente (Bloqueio de desativação)');
console.log('  4. INATIVO (Ativar)\n');
