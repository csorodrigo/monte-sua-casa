// Tipos do sistema Monte sua Casa

export interface Comodo {
  id: string;
  nome: string;
  largura: number;
  comprimento: number;
  peDireito: number; // altura do pe direito (padrao 2.80m)
}

export interface ConfiguracaoReboco {
  externo: boolean;
  interno: boolean;
}

export interface ConfiguracaoMuro {
  incluir: boolean;
  frente: number;
  fundo: number;
  direita: number;
  esquerda: number;
  altura: number;
}

export interface ConfiguracaoPiscina {
  incluir: boolean;
  largura: number;
  comprimento: number;
  profundidade: number;
}

export interface DadosSimulacao {
  estadoId: number;
  tipoTelhadoId: number;
  tipoTijoloId: number;
  padraoAcabamentoId: number;
  reboco: ConfiguracaoReboco;
  comodos: Comodo[];
  muro: ConfiguracaoMuro;
  piscina: ConfiguracaoPiscina;
  incluirChurrasqueira: boolean;
}

export interface ItemOrcamento {
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  total: number;
}

export interface SecaoOrcamento {
  nome: string;
  itens: ItemOrcamento[];
  subtotal: number;
}

export interface BreakdownOrcamento {
  fundacao: SecaoOrcamento;
  estrutura: SecaoOrcamento;
  alvenaria: SecaoOrcamento;
  telhado: SecaoOrcamento;
  reboco: SecaoOrcamento;
  acabamento: SecaoOrcamento;
  maoObraCasa: SecaoOrcamento;
  maoObraMuro?: SecaoOrcamento;
  maoObraPiscina?: SecaoOrcamento;
  muro?: SecaoOrcamento;
  piscina?: SecaoOrcamento;
}

export interface ResultadoOrcamento {
  areaTotalConstruida: number;
  areaParedes: number;
  areaTelhado: number;
  totalMateriais: number;
  totalMaoObra: number;
  totalGeral: number;
  breakdown: BreakdownOrcamento;
  muro?: ResultadoMuro;
  piscina?: ResultadoPiscina;
}

export interface ResultadoMuro {
  areaTotal: number;
  totalMateriais: number;
  totalMaoObra: number;
  total: number;
}

export interface ResultadoPiscina {
  areaSuperficie: number;
  volume: number;
  totalMateriais: number;
  totalMaoObra: number;
  total: number;
}

// Tipos do banco de dados (Prisma)
export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  cub: number;  // CUB do estado para cálculos
  custoMaoObraPorM2: number;  // Mantido para compatibilidade
}

export interface TipoTelhado {
  id: number;
  nome: string;
  precoPorM2: number;
}

export interface TipoTijolo {
  id: number;
  nome: string;
  precoUnidade: number;
  tijolosPorM2: number;
  multiplicadorFerro: number;
}

export interface PadraoAcabamento {
  id: number;
  nome: string;
  multiplicadorPreco: number;
  descricao?: string | null;
}

// Tipos para API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DadosIniciais {
  estados: Estado[];
  tiposTelhado: TipoTelhado[];
  tiposTijolo: TipoTijolo[];
  padroesAcabamento: PadraoAcabamento[];
}

// Tipos para graficos
export interface DadoGraficoPizza {
  nome: string;
  valor: number;
  cor: string;
}
