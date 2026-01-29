// Módulo de acesso às configurações do sistema
// Carrega dados do configuracoes.json e fornece funções de cálculo

import configData from '@/../data/configuracoes.json';

// Tipos baseados no configuracoes.json
export interface EstadoConfig {
  id: number;
  nome: string;
  sigla: string;
  cub: number;
}

export interface TipoTelhadoConfig {
  id: number;
  nome: string;
  precoMaterial: number;
  precoMaoObra: number;
}

export interface TipoTijoloConfig {
  id: number;
  nome: string;
  preco: number;
  consumoPorM2: number;
}

export interface TipoJanelaConfig {
  id: number;
  nome: string;
  preco: number;
}

export interface PadraoAcabamentoConfig {
  id: number;
  nome: string;
  multiplicador: number;
  precoRevestimentoParede: number;
  precoRevestimentoPiso: number;
  precoPortaEntrada: number;
}

export interface Configuracoes {
  versao: string;
  ultimaAtualizacao: string;
  fatorINCC: number;
  estados: EstadoConfig[];
  tiposTelhado: TipoTelhadoConfig[];
  tiposTijolo: TipoTijoloConfig[];
  tiposJanela: TipoJanelaConfig[];
  padroesAcabamento: PadraoAcabamentoConfig[];
  precosBaseMateriais: typeof configData.precosBaseMateriais;
  precosBaseMaoObra: typeof configData.precosBaseMaoObra;
}

/**
 * Retorna todas as configurações do sistema
 */
export function getConfiguracoes(): Configuracoes {
  return configData as Configuracoes;
}

/**
 * Retorna o fator INCC configurado
 * @returns Fator INCC (ex: 0.0079 = 0.79%)
 */
export function getFatorINCC(): number {
  return configData.fatorINCC;
}

/**
 * Retorna o CUB base (São Paulo como referência)
 */
export function getCUBBase(): number {
  const sp = configData.estados.find(e => e.sigla === 'SP');
  return sp?.cub || 2040.58;
}

/**
 * Retorna um estado por ID
 */
export function getEstadoPorId(id: number): EstadoConfig | undefined {
  return configData.estados.find(e => e.id === id);
}

/**
 * Retorna um estado por sigla
 */
export function getEstadoPorSigla(sigla: string): EstadoConfig | undefined {
  return configData.estados.find(e => e.sigla === sigla);
}

/**
 * Calcula o fator de ajuste pelo estado baseado no CUB
 * Fórmula: CUB_Estado / CUB_Base (SP)
 * @param estadoId ID do estado
 * @returns Fator de ajuste (1.0 para SP, maior para estados mais caros)
 */
export function calcularFatorEstado(estadoId: number): number {
  const estado = getEstadoPorId(estadoId);
  if (!estado) return 1.0;

  const cubBase = getCUBBase();
  return estado.cub / cubBase;
}

/**
 * Calcula o fator de ajuste pelo estado usando o objeto estado
 * @param cub CUB do estado
 * @returns Fator de ajuste
 */
export function calcularFatorEstadoPorCUB(cub: number): number {
  const cubBase = getCUBBase();
  return cub / cubBase;
}

/**
 * Aplica o fator INCC a um preço base
 * Fórmula: PrecoBase × (1 + FatorINCC)
 * @param precoBase Preço base do item
 * @returns Preço com INCC aplicado
 */
export function aplicarINCC(precoBase: number): number {
  return precoBase * (1 + configData.fatorINCC);
}

/**
 * Aplica o fator INCC e o fator de estado a um preço
 * Usado principalmente para mão de obra
 * @param precoBase Preço base
 * @param fatorEstado Fator do estado (baseado no CUB)
 * @returns Preço ajustado
 */
export function aplicarAjusteCompleto(precoBase: number, fatorEstado: number): number {
  return precoBase * (1 + configData.fatorINCC) * fatorEstado;
}

/**
 * Retorna um padrão de acabamento por ID
 */
export function getPadraoAcabamentoPorId(id: number): PadraoAcabamentoConfig | undefined {
  return configData.padroesAcabamento.find(p => p.id === id);
}

/**
 * Retorna um tipo de telhado por ID
 */
export function getTipoTelhadoPorId(id: number): TipoTelhadoConfig | undefined {
  return configData.tiposTelhado.find(t => t.id === id);
}

/**
 * Retorna um tipo de tijolo por ID
 */
export function getTipoTijoloPorId(id: number): TipoTijoloConfig | undefined {
  return configData.tiposTijolo.find(t => t.id === id);
}

/**
 * Retorna os preços base de materiais
 */
export function getPrecosBaseMateriais() {
  return configData.precosBaseMateriais;
}

/**
 * Retorna os preços base de mão de obra
 */
export function getPrecosBaseMaoObra() {
  return configData.precosBaseMaoObra;
}

// BDI por tipo de construção
export const BDI = {
  CASA: 14.40,      // 14.40% para casa
  MURO: 15.00,      // 15% para muro
  PISCINA: 20.00,   // 20% para piscina (conforme planilha Excel)
};

/**
 * Aplica BDI ao subtotal
 * @param subtotal Subtotal sem BDI
 * @param tipoBDI Tipo de BDI a aplicar ('CASA', 'MURO', 'PISCINA')
 * @returns Objeto com subtotal, bdi e total
 */
export function aplicarBDI(subtotal: number, tipoBDI: keyof typeof BDI): { subtotal: number; bdi: number; bdiPercentual: number; total: number } {
  const percentual = BDI[tipoBDI];
  const bdi = subtotal * (percentual / 100);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    bdi: Math.round(bdi * 100) / 100,
    bdiPercentual: percentual,
    total: Math.round((subtotal + bdi) * 100) / 100,
  };
}
