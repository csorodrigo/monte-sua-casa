// Calculos de estrutura: pilares, vigas, ferro, concreto

import { TipoTijolo } from '@/types';
import { ESTRUTURA, DESPERDICIO } from './constants';

/**
 * Calcula a quantidade de pilares necessarios
 * @param areaTotal - area total construida em m2
 */
export function quantidadePilares(areaTotal: number): number {
  // Minimo de 4 pilares (cantos)
  const pilares = Math.ceil(areaTotal * ESTRUTURA.pilarPorM2);
  return Math.max(4, pilares);
}

/**
 * Calcula o volume de concreto para pilares
 * @param qtdPilares - quantidade de pilares
 */
export function concretoPilares(qtdPilares: number): number {
  const volume = qtdPilares * ESTRUTURA.volumeConcretoPilar;
  return volume * DESPERDICIO.concreto;
}

/**
 * Calcula o peso de ferro para pilares
 * @param qtdPilares - quantidade de pilares
 * @param tipoTijolo - tipo de tijolo (afeta estrutura)
 */
export function ferroPilares(qtdPilares: number, tipoTijolo: TipoTijolo): number {
  const ferroBase = qtdPilares * ESTRUTURA.ferroPorPilar;
  const ferroAjustado = ferroBase * tipoTijolo.multiplicadorFerro;
  return ferroAjustado * DESPERDICIO.ferro;
}

/**
 * Calcula o volume de concreto para vigas
 * @param perimetro - perimetro total (metros lineares de viga)
 */
export function concretoVigas(perimetro: number): number {
  const volume = perimetro * ESTRUTURA.alturaViga * ESTRUTURA.larguraViga;
  return volume * DESPERDICIO.concreto;
}

/**
 * Calcula o peso de ferro para vigas
 * @param perimetro - perimetro total (metros lineares de viga)
 * @param tipoTijolo - tipo de tijolo
 */
export function ferroVigas(perimetro: number, tipoTijolo: TipoTijolo): number {
  const ferroBase = perimetro * ESTRUTURA.ferroPorMetroViga;
  const ferroAjustado = ferroBase * tipoTijolo.multiplicadorFerro;
  return ferroAjustado * DESPERDICIO.ferro;
}

/**
 * Calcula o peso de ferro para laje
 * @param area - area da laje em m2
 */
export function ferroLaje(area: number): number {
  const ferroBase = area * ESTRUTURA.ferroPorM2Laje;
  return ferroBase * DESPERDICIO.ferro;
}

/**
 * Calcula o volume de concreto para laje
 * @param area - area da laje em m2
 */
export function concretoLaje(area: number): number {
  const volume = area * ESTRUTURA.espessuraLaje;
  return volume * DESPERDICIO.concreto;
}

/**
 * Calcula o volume de concreto para fundacao (baldrame)
 * @param perimetro - perimetro da construcao em metros
 */
export function concretoFundacao(perimetro: number): number {
  const volume = perimetro * ESTRUTURA.larguraFundacao * ESTRUTURA.profundidadeFundacao;
  return volume * DESPERDICIO.concreto;
}

/**
 * Calcula o peso de ferro para fundacao
 * @param perimetro - perimetro em metros
 */
export function ferroFundacao(perimetro: number): number {
  // Estimativa: 2.5kg por metro linear de fundacao
  const ferroBase = perimetro * 2.5;
  return ferroBase * DESPERDICIO.ferro;
}

/**
 * Calcula todos os elementos estruturais
 */
export function calcularEstrutura(
  areaTotal: number,
  perimetro: number,
  tipoTijolo: TipoTijolo
): {
  qtdPilares: number;
  concretoTotal: number;
  ferroTotal: number;
  detalhamento: {
    concretoPilares: number;
    concretoVigas: number;
    concretoLaje: number;
    concretoFundacao: number;
    ferroPilares: number;
    ferroVigas: number;
    ferroLaje: number;
    ferroFundacao: number;
  };
} {
  const qtdPilares = quantidadePilares(areaTotal);

  const detalhamento = {
    concretoPilares: concretoPilares(qtdPilares),
    concretoVigas: concretoVigas(perimetro),
    concretoLaje: concretoLaje(areaTotal),
    concretoFundacao: concretoFundacao(perimetro),
    ferroPilares: ferroPilares(qtdPilares, tipoTijolo),
    ferroVigas: ferroVigas(perimetro, tipoTijolo),
    ferroLaje: ferroLaje(areaTotal),
    ferroFundacao: ferroFundacao(perimetro),
  };

  const concretoTotal =
    detalhamento.concretoPilares +
    detalhamento.concretoVigas +
    detalhamento.concretoLaje +
    detalhamento.concretoFundacao;

  const ferroTotal =
    detalhamento.ferroPilares +
    detalhamento.ferroVigas +
    detalhamento.ferroLaje +
    detalhamento.ferroFundacao;

  return {
    qtdPilares,
    concretoTotal,
    ferroTotal,
    detalhamento,
  };
}
