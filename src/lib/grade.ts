/**
 * Grade de horários: lida em tempo de execução de /grade.json, para que a
 * equipe possa trocar o arquivo no GitHub sem precisar recompilar o site.
 */

export interface Grade {
  atualizadoEm: string;
  duracaoMin: number;
  antecedenciaHoras: number;
  diasFuturos: number;
  /** chave = dia da semana (0 domingo … 6 sábado), valor = horários "HH:MM" */
  semana: Record<string, string[]>;
  /** datas sem atendimento, "AAAA-MM-DD" */
  bloqueios: string[];
  /** horários já tomados, "AAAA-MM-DDTHH:MM" */
  ocupados: string[];
  /** dias avulsos abertos fora da grade fixa: { "AAAA-MM-DD": ["10:00"] } */
  extras?: Record<string, string[]>;
  /** quem reservou cada horário (preenchido pela equipe no painel) */
  reservas?: Reserva[];
}

export interface Reserva {
  /** "AAAA-MM-DDTHH:MM" */
  id: string;
  nome: string;
  contato?: string;
  observacao?: string;
  criadoEm?: string;
}

export interface Dia {
  iso: string; // AAAA-MM-DD
  data: Date;
  rotuloDia: string; // "ter"
  numero: string; // "05"
  mes: string; // "ago"
  horarios: string[];
}

export const gradePadrao: Grade = {
  atualizadoEm: '',
  duracaoMin: 60,
  antecedenciaHoras: 12,
  diasFuturos: 30,
  semana: { '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [] },
  bloqueios: [],
  ocupados: [],
  extras: {},
  reservas: [],
};

/** Horários de um dia: a grade fixa da semana mais os avulsos daquela data. */
export function horariosDoDia(g: Grade, chave: string, diaSemana: number): string[] {
  const fixos = g.semana[String(diaSemana)] ?? [];
  const avulsos = g.extras?.[chave] ?? [];
  return [...new Set([...fixos, ...avulsos])].sort();
}

export const nomesDia = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const nomesDiaLongo = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];
export const nomesMes = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/** AAAA-MM-DD no fuso local (não usar toISOString, que converte para UTC). */
export function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** Monta os próximos dias com horários livres. */
export function diasDisponiveis(g: Grade, agora = new Date()): Dia[] {
  const limite = new Date(agora.getTime() + g.antecedenciaHoras * 3600_000);
  const dias: Dia[] = [];

  for (let i = 0; i < g.diasFuturos; i++) {
    const d = new Date(agora);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);

    const chave = iso(d);
    if (g.bloqueios.includes(chave)) continue;

    const daSemana = horariosDoDia(g, chave, d.getDay());
    const horarios = daSemana
      .filter((h) => !g.ocupados.includes(`${chave}T${h}`))
      .filter((h) => {
        const [hh, mm] = h.split(':').map(Number);
        const quando = new Date(d);
        quando.setHours(hh ?? 0, mm ?? 0, 0, 0);
        return quando >= limite;
      })
      .sort();

    if (horarios.length > 0) {
      dias.push({
        iso: chave,
        data: d,
        rotuloDia: nomesDia[d.getDay()] ?? '',
        numero: String(d.getDate()).padStart(2, '0'),
        mes: nomesMes[d.getMonth()] ?? '',
        horarios,
      });
    }
  }
  return dias;
}

/** "Terça, 5 de agosto, às 14:00" */
export function descreveEscolha(isoData: string, hora: string): string {
  const [a, m, d] = isoData.split('-').map(Number);
  const data = new Date(a ?? 0, (m ?? 1) - 1, d ?? 1);
  const mesLongo = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ][data.getMonth()];
  return `${nomesDiaLongo[data.getDay()]}, ${data.getDate()} de ${mesLongo}, às ${hora}`;
}
