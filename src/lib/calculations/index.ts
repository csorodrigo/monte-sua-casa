// Orquestrador principal dos calculos

import {
  DadosSimulacao,
  ResultadoOrcamento,
  TipoTelhado,
  TipoTijolo,
  PadraoAcabamento,
  Estado,
} from '@/types';
import { calcularOrcamentoCasa } from './casa';
import { calcularOrcamentoMuro } from './muro';
import { calcularOrcamentoPiscina } from './piscina';

// Re-exportar funcoes uteis (seletivamente para evitar conflitos)
export {
  areaComodo,
  perimetroComodo,
  areaParedesComodo,
  areaTotalConstruida,
  perimetroTotal,
  areaTotalParedes,
  areaTelhado,
  areaParedesExternas,
  areaParedesInternas,
  dimensoesExternas,
} from './area';

export {
  quantidadePilares,
  concretoPilares,
  ferroPilares,
  concretoVigas,
  ferroVigas,
  ferroLaje,
  calcularEstrutura,
} from './estrutura';

export * from './constants';
export { calcularOrcamentoCasa } from './casa';
export { calcularOrcamentoMuro } from './muro';
export { calcularOrcamentoPiscina } from './piscina';

interface ParametrosOrcamentoCompleto {
  dados: DadosSimulacao;
  tipoTelhado: TipoTelhado;
  tipoTijolo: TipoTijolo;
  padraoAcabamento: PadraoAcabamento;
  estado: Estado;
}

/**
 * Calcula o orcamento completo incluindo casa, muro (opcional) e piscina (opcional)
 */
export function calcularOrcamentoCompleto(
  params: ParametrosOrcamentoCompleto
): ResultadoOrcamento {
  const { dados, tipoTelhado, tipoTijolo, padraoAcabamento, estado } = params;

  // Calcular orcamento da casa
  const resultadoCasa = calcularOrcamentoCasa({
    comodos: dados.comodos,
    tipoTelhado,
    tipoTijolo,
    padraoAcabamento,
    estado,
    reboco: dados.reboco,
  });

  // Calcular muro se incluido
  const resultadoMuro = calcularOrcamentoMuro({
    muro: dados.muro,
    estado,
  });

  // Calcular piscina se incluida
  const resultadoPiscina = calcularOrcamentoPiscina({
    piscina: dados.piscina,
    estado,
  });

  // Montar breakdown completo
  const breakdown = { ...resultadoCasa.breakdown };

  if (dados.muro.incluir) {
    breakdown.muro = resultadoMuro.secaoMateriais;
    breakdown.maoObraMuro = resultadoMuro.secaoMaoObra;
  }

  if (dados.piscina.incluir) {
    breakdown.piscina = resultadoPiscina.secaoMateriais;
    breakdown.maoObraPiscina = resultadoPiscina.secaoMaoObra;
  }

  // Calcular totais gerais
  const totalMateriais =
    resultadoCasa.totalMateriais +
    resultadoMuro.resultado.totalMateriais +
    resultadoPiscina.resultado.totalMateriais;

  const totalMaoObra =
    resultadoCasa.totalMaoObra +
    resultadoMuro.resultado.totalMaoObra +
    resultadoPiscina.resultado.totalMaoObra;

  const totalGeral = totalMateriais + totalMaoObra;

  return {
    areaTotalConstruida: resultadoCasa.areaTotalConstruida,
    areaParedes: resultadoCasa.areaParedes,
    areaTelhado: resultadoCasa.areaTelhado,
    totalMateriais: Math.round(totalMateriais * 100) / 100,
    totalMaoObra: Math.round(totalMaoObra * 100) / 100,
    totalGeral: Math.round(totalGeral * 100) / 100,
    breakdown,
    muro: dados.muro.incluir ? resultadoMuro.resultado : undefined,
    piscina: dados.piscina.incluir ? resultadoPiscina.resultado : undefined,
  };
}

/**
 * Formata valor monetario em reais
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata numero com separador de milhares
 */
export function formatarNumero(valor: number, decimais: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor);
}

/**
 * Gera ID unico para comodos
 */
export function gerarIdComodo(): string {
  return `comodo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Valores padrao para novo comodo
 */
export function novoComodo(nome: string = 'Novo Comodo'): {
  id: string;
  nome: string;
  largura: number;
  comprimento: number;
  peDireito: number;
} {
  return {
    id: gerarIdComodo(),
    nome,
    largura: 3,
    comprimento: 4,
    peDireito: 2.8,
  };
}

/**
 * Comodos padrao para iniciar simulacao
 */
export function comodosPadrao() {
  return [
    { id: gerarIdComodo(), nome: 'Sala', largura: 4, comprimento: 5, peDireito: 2.8 },
    { id: gerarIdComodo(), nome: 'Cozinha', largura: 3, comprimento: 4, peDireito: 2.8 },
    { id: gerarIdComodo(), nome: 'Quarto 1', largura: 3, comprimento: 4, peDireito: 2.8 },
    { id: gerarIdComodo(), nome: 'Quarto 2', largura: 3, comprimento: 3.5, peDireito: 2.8 },
    { id: gerarIdComodo(), nome: 'Banheiro', largura: 2, comprimento: 2.5, peDireito: 2.8 },
  ];
}
