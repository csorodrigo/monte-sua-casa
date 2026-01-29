// Static data for construction budget simulator
// Dados carregados do configuracoes.json e adaptados para compatibilidade com o sistema

import { getConfiguracoes, getCUBBase } from './configuracoes';

const config = getConfiguracoes();
const cubBase = getCUBBase();

// Estados com CUB do configuracoes.json
// Mantém compatibilidade: custoMaoObraPorM2 calculado como ~48% do CUB (proporção histórica)
export const estados = config.estados.map(e => ({
  id: e.id,
  sigla: e.sigla,
  nome: e.nome,
  cub: e.cub,
  // custoMaoObraPorM2 baseado no CUB para compatibilidade
  custoMaoObraPorM2: Math.round(e.cub * 0.48),
}));

// Tipos de telhado do configuracoes.json
export const tiposTelhado = config.tiposTelhado.map(t => ({
  id: t.id,
  nome: t.nome,
  precoPorM2: t.precoMaterial, // Preço de material como preço principal
  precoMaoObraPorM2: t.precoMaoObra,
}));

// Tipos de tijolo do configuracoes.json
export const tiposTijolo = config.tiposTijolo.map(t => ({
  id: t.id,
  nome: t.nome,
  precoUnidade: t.preco / t.consumoPorM2, // Preço por unidade
  tijolosPorM2: t.consumoPorM2,
  multiplicadorFerro: 1.0, // Padrão, pode ser ajustado por tipo
}));

// Padrões de acabamento do configuracoes.json
// Mapeia os multiplicadores conforme a planilha Excel
export const padroesAcabamento = config.padroesAcabamento.map(p => ({
  id: p.id,
  nome: p.nome,
  multiplicadorPreco: p.multiplicador,
  descricao: getDescricaoPadrao(p.nome),
}));

function getDescricaoPadrao(nome: string): string {
  switch (nome) {
    case 'LUXO':
      return 'Acabamento premium, materiais importados e de alta qualidade';
    case 'ALTO PADRÃO':
      return 'Acabamento superior, materiais de qualidade';
    case 'MÉDIO PADRÃO':
      return 'Acabamento médio, boa relação custo-benefício';
    case 'BAIXO PADRÃO':
      return 'Acabamento básico, materiais econômicos';
    default:
      return '';
  }
}

// Helper function to get estado by id
export function getEstadoById(id: number) {
  return estados.find(e => e.id === id);
}

// Helper function to get estado by sigla
export function getEstadoBySigla(sigla: string) {
  return estados.find(e => e.sigla === sigla);
}

// Helper function to get tipo telhado by id
export function getTipoTelhadoById(id: number) {
  return tiposTelhado.find(t => t.id === id);
}

// Helper function to get tipo tijolo by id
export function getTipoTijoloById(id: number) {
  return tiposTijolo.find(t => t.id === id);
}

// Helper function to get padrao acabamento by id
export function getPadraoAcabamentoById(id: number) {
  return padroesAcabamento.find(p => p.id === id);
}

// Exporta o CUB base para uso em cálculos
export { cubBase as CUB_BASE };

// Exporta o fator INCC
export const FATOR_INCC = config.fatorINCC;
