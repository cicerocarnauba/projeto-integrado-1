// Painel de testes — Professor + Turma (abas)
// Stack: Tailwind CSS. Substituível; serve apenas para exercitar os canais IPC.
import { useEffect, useState } from 'react';

// =============================================================
// Tipos
// =============================================================
interface Professor {
  id: number | null;
  primeiroNome: string;
  sobrenome: string;
  email: string;
  status: 'ATIVO' | 'INATIVO';
  dataCadastro?: string;
  dataAtualizacao?: string;
}

interface Turma {
  id: number | null;
  nome: string;
  status: 'ATIVO' | 'INATIVO';
  dataCadastro?: string;
  dataAtualizacao?: string;
}

type Mensagem = { tipo: 'sucesso' | 'erro'; texto: string } | null;

// =============================================================
// Classes Tailwind reutilizáveis
// =============================================================
const inputCls =
  'rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500';

const btnPrimary =
  'rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50';

const btnDark =
  'rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50';

const btnGhost =
  'rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

// =============================================================
// Componentes auxiliares
// =============================================================
function MensagemBanner({ mensagem }: { mensagem: Mensagem }) {
  if (!mensagem) return null;

  return (
    <div
      className={`rounded-md border px-4 py-2 text-sm ${
        mensagem.tipo === 'sucesso'
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
          : 'border-rose-300 bg-rose-50 text-rose-800'
      }`}
    >
      {mensagem.tipo === 'sucesso' ? '✅' : '❌'} {mensagem.texto}
    </div>
  );
}

function StatusBadge({ status }: { status: 'ATIVO' | 'INATIVO' }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        status === 'ATIVO'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-200 text-slate-600'
      }`}
    >
      {status}
    </span>
  );
}

// =============================================================
// Painel: Professor
// =============================================================
function ProfessorPanel() {
  const [form, setForm] = useState({
    primeiroNome: '',
    sobrenome: '',
    email: '',
  });

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');
  const [incluirInativos, setIncluirInativos] = useState(false);

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professorSelecionado, setProfessorSelecionado] = useState<Professor | null>(null);

  const [mensagem, setMensagem] = useState<Mensagem>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    void handleConsultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    const resposta = await window.ipc.professor.cadastrar(form);

    if (resposta.success) {
      setMensagem({
        tipo: 'sucesso',
        texto: `Professor cadastrado: ${resposta.data.primeiroNome} (id ${resposta.data.id})`,
      });
      setForm({ primeiroNome: '', sobrenome: '', email: '' });
      await handleConsultar();
    } else {
      setMensagem({ tipo: 'erro', texto: resposta.error ?? 'Erro desconhecido' });
    }

    setCarregando(false);
  }

  async function handleConsultar() {
    setCarregando(true);
    setMensagem(null);
    setProfessorSelecionado(null);

    const resposta = await window.ipc.professor.consultar({
      nome: filtroNome.trim() || undefined,
      email: filtroEmail.trim() || undefined,
      incluirInativos,
    });

    if (resposta.success) {
      setProfessores(resposta.data ?? []);
      setMensagem({
        tipo: 'sucesso',
        texto: `${resposta.data?.length ?? 0} professor(es) retornado(s).`,
      });
    } else {
      setMensagem({ tipo: 'erro', texto: resposta.error ?? 'Erro desconhecido' });
    }

    setCarregando(false);
  }

  function handleLimparFiltros() {
    setFiltroNome('');
    setFiltroEmail('');
    setIncluirInativos(false);
  }

  async function handleVerDetalhes(id: number) {
    setCarregando(true);
    setMensagem(null);

    const resposta = await window.ipc.professor.buscarPorId(id);

    if (resposta.success) {
      setProfessorSelecionado(resposta.data);
    } else {
      setProfessorSelecionado(null);
      setMensagem({ tipo: 'erro', texto: resposta.error ?? 'Erro desconhecido' });
    }

    setCarregando(false);
  }

  return (
    <div className="space-y-6">
      <MensagemBanner mensagem={mensagem} />

      {/* Cadastro */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Cadastrar Professor
        </h2>

        <form
          onSubmit={handleCadastrar}
          className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1.4fr_auto]"
        >
          <input
            required
            placeholder="Primeiro nome"
            value={form.primeiroNome}
            onChange={(e) => setForm({ ...form, primeiroNome: e.target.value })}
            className={inputCls}
          />
          <input
            required
            placeholder="Sobrenome"
            value={form.sobrenome}
            onChange={(e) => setForm({ ...form, sobrenome: e.target.value })}
            className={inputCls}
          />
          <input
            required
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
          <button type="submit" disabled={carregando} className={btnPrimary}>
            Cadastrar
          </button>
        </form>
      </section>

      {/* Consulta */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Consultar Professores
        </h2>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1.4fr_auto_auto_auto] md:items-center">
          <input
            placeholder="Nome ou sobrenome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className={inputCls}
          />
          <input
            placeholder="E-mail"
            value={filtroEmail}
            onChange={(e) => setFiltroEmail(e.target.value)}
            className={inputCls}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={incluirInativos}
              onChange={(e) => setIncluirInativos(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Incluir inativos
          </label>
          <button onClick={handleConsultar} disabled={carregando} className={btnDark}>
            Consultar
          </button>
          <button onClick={handleLimparFiltros} disabled={carregando} className={btnGhost}>
            Limpar
          </button>
        </div>

        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 w-16">ID</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">E-mail</th>
                <th className="px-3 py-2 w-24">Status</th>
                <th className="px-3 py-2 w-28 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {professores.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t border-slate-100 hover:bg-sky-50/50 ${
                    professorSelecionado?.id === p.id ? 'bg-sky-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">{p.id}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {p.primeiroNome} {p.sobrenome}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{p.email}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => p.id !== null && handleVerDetalhes(p.id)}
                      disabled={carregando}
                      className="text-xs font-medium text-sky-600 hover:text-sky-800 disabled:opacity-50"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}

              {professores.length === 0 && !carregando && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                    Nenhum professor encontrado com os filtros atuais.
                  </td>
                </tr>
              )}

              {carregando && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                    Carregando…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detalhes */}
      {professorSelecionado && (
        <section className="rounded-lg border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-sky-900">Detalhes do Professor</h2>
            <button
              onClick={() => setProfessorSelecionado(null)}
              className="text-xs font-medium text-sky-700 hover:text-sky-900"
            >
              Fechar
            </button>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">ID</dt>
              <dd className="font-mono text-slate-800">{professorSelecionado.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
              <dd>
                <StatusBadge status={professorSelecionado.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Nome completo</dt>
              <dd className="text-slate-800">
                {professorSelecionado.primeiroNome} {professorSelecionado.sobrenome}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">E-mail</dt>
              <dd className="text-slate-800">{professorSelecionado.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Cadastrado em</dt>
              <dd className="text-slate-800">
                {professorSelecionado.dataCadastro
                  ? new Date(professorSelecionado.dataCadastro).toLocaleString('pt-BR')
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Última atualização</dt>
              <dd className="text-slate-800">
                {professorSelecionado.dataAtualizacao
                  ? new Date(professorSelecionado.dataAtualizacao).toLocaleString('pt-BR')
                  : '—'}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}

// =============================================================
// Painel: Turma
// =============================================================
function TurmaPanel() {
  const [form, setForm] = useState({ nome: '' });

  const [filtroNome, setFiltroNome] = useState('');
  const [incluirInativos, setIncluirInativos] = useState(false);

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);

  const [mensagem, setMensagem] = useState<Mensagem>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    void handleConsultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    const resposta = await window.ipc.turma.cadastrar(form);

    if (resposta.success) {
      setMensagem({
        tipo: 'sucesso',
        texto: `Turma cadastrada: ${resposta.data.nome} (id ${resposta.data.id})`,
      });
      setForm({ nome: '' });
      await handleConsultar();
    } else {
      setMensagem({ tipo: 'erro', texto: resposta.error ?? 'Erro desconhecido' });
    }

    setCarregando(false);
  }

  async function handleConsultar() {
    setCarregando(true);
    setMensagem(null);
    setTurmaSelecionada(null);

    const resposta = await window.ipc.turma.consultar({
      nome: filtroNome.trim() || undefined,
      incluirInativos,
    });

    if (resposta.success) {
      setTurmas(resposta.data ?? []);
      setMensagem({
        tipo: 'sucesso',
        texto: `${resposta.data?.length ?? 0} turma(s) retornada(s).`,
      });
    } else {
      setMensagem({ tipo: 'erro', texto: resposta.error ?? 'Erro desconhecido' });
    }

    setCarregando(false);
  }

  function handleLimparFiltros() {
    setFiltroNome('');
    setIncluirInativos(false);
  }

  async function handleVerDetalhes(id: number) {
    setCarregando(true);
    setMensagem(null);

    const resposta = await window.ipc.turma.buscarPorId(id);

    if (resposta.success) {
      setTurmaSelecionada(resposta.data);
    } else {
      setTurmaSelecionada(null);
      setMensagem({ tipo: 'erro', texto: resposta.error ?? 'Erro desconhecido' });
    }

    setCarregando(false);
  }

  return (
    <div className="space-y-6">
      <MensagemBanner mensagem={mensagem} />

      {/* Cadastro */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Cadastrar Turma</h2>

        <form
          onSubmit={handleCadastrar}
          className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]"
        >
          <input
            required
            placeholder="Nome da turma (ex: Maternal A)"
            value={form.nome}
            onChange={(e) => setForm({ nome: e.target.value })}
            className={inputCls}
          />
          <button type="submit" disabled={carregando} className={btnPrimary}>
            Cadastrar
          </button>
        </form>
      </section>

      {/* Consulta */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Consultar Turmas</h2>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[2fr_auto_auto_auto] md:items-center">
          <input
            placeholder="Nome da turma"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className={inputCls}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={incluirInativos}
              onChange={(e) => setIncluirInativos(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Incluir inativas
          </label>
          <button onClick={handleConsultar} disabled={carregando} className={btnDark}>
            Consultar
          </button>
          <button onClick={handleLimparFiltros} disabled={carregando} className={btnGhost}>
            Limpar
          </button>
        </div>

        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 w-16">ID</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2 w-24">Status</th>
                <th className="px-3 py-2 w-28 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((t) => (
                <tr
                  key={t.id}
                  className={`border-t border-slate-100 hover:bg-sky-50/50 ${
                    turmaSelecionada?.id === t.id ? 'bg-sky-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">{t.id}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{t.nome}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => t.id !== null && handleVerDetalhes(t.id)}
                      disabled={carregando}
                      className="text-xs font-medium text-sky-600 hover:text-sky-800 disabled:opacity-50"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}

              {turmas.length === 0 && !carregando && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-400">
                    Nenhuma turma encontrada com os filtros atuais.
                  </td>
                </tr>
              )}

              {carregando && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-400">
                    Carregando…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detalhes */}
      {turmaSelecionada && (
        <section className="rounded-lg border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-sky-900">Detalhes da Turma</h2>
            <button
              onClick={() => setTurmaSelecionada(null)}
              className="text-xs font-medium text-sky-700 hover:text-sky-900"
            >
              Fechar
            </button>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">ID</dt>
              <dd className="font-mono text-slate-800">{turmaSelecionada.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
              <dd>
                <StatusBadge status={turmaSelecionada.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Nome</dt>
              <dd className="text-slate-800">{turmaSelecionada.nome}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Cadastrada em</dt>
              <dd className="text-slate-800">
                {turmaSelecionada.dataCadastro
                  ? new Date(turmaSelecionada.dataCadastro).toLocaleString('pt-BR')
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Última atualização</dt>
              <dd className="text-slate-800">
                {turmaSelecionada.dataAtualizacao
                  ? new Date(turmaSelecionada.dataAtualizacao).toLocaleString('pt-BR')
                  : '—'}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}

// =============================================================
// Home com abas
// =============================================================
export default function Home() {
  const [aba, setAba] = useState<'professor' | 'turma'>('professor');

  const tabCls = (ativa: boolean) =>
    `rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition ${
      ativa
        ? 'border-sky-600 text-sky-700'
        : 'border-transparent text-slate-500 hover:text-slate-800'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-slate-800">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            🧪 Painel de Teste — Biblioteca
          </h1>
          <p className="text-sm text-slate-500">
            Exercita os canais IPC de <code>professor</code> e <code>turma</code>.
          </p>
        </header>

        {/* Abas */}
        <div className="flex border-b border-slate-200">
          <button
            className={tabCls(aba === 'professor')}
            onClick={() => setAba('professor')}
          >
            Professor
          </button>
          <button className={tabCls(aba === 'turma')} onClick={() => setAba('turma')}>
            Turma
          </button>
        </div>

        {/* Conteúdo da aba ativa */}
        {aba === 'professor' ? <ProfessorPanel /> : <TurmaPanel />}
      </div>
    </div>
  );
}