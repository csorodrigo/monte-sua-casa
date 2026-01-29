// Calculos de area, perimetro e paredes

import { Comodo } from '@/types';
import { ALVENARIA, TELHADO, ESTRUTURA } from './constants';

/**
 * Calcula a area de um comodo em m2
 */
export function areaComodo(largura: number, comprimento: number): number {
  return largura * comprimento;
}

/**
 * Calcula o perimetro de um comodo em metros
 */
export function perimetroComodo(largura: number, comprimento: number): number {
  return 2 * (largura + comprimento);
}

/**
 * Calcula a area das paredes de um comodo em m2
 * @param largura - largura do comodo em metros
 * @param comprimento - comprimento do comodo em metros
 * @param peDireito - altura do pe direito (padrao 2.80m)
 */
export function areaParedesComodo(
  largura: number,
  comprimento: number,
  peDireito: number = ALVENARIA.alturaParede
): number {
  const perimetro = perimetroComodo(largura, comprimento);
  return perimetro * peDireito;
}

/**
 * Calcula a area total construida de todos os comodos
 */
export function areaTotalConstruida(comodos: Comodo[]): number {
  return comodos.reduce((total, comodo) => {
    return total + areaComodo(comodo.largura, comodo.comprimento);
  }, 0);
}

/**
 * Calcula o perimetro total da construcao
 * Simplificacao: considera a soma de todos os perimetros
 * Para calculo mais preciso, seria necessario considerar paredes compartilhadas
 */
export function perimetroTotal(comodos: Comodo[]): number {
  return comodos.reduce((total, comodo) => {
    return total + perimetroComodo(comodo.largura, comodo.comprimento);
  }, 0);
}

/**
 * Calcula a area total de paredes internas e externas
 */
export function areaTotalParedes(comodos: Comodo[]): number {
  return comodos.reduce((total, comodo) => {
    return total + areaParedesComodo(
      comodo.largura,
      comodo.comprimento,
      comodo.peDireito || ALVENARIA.alturaParede
    );
  }, 0);
}

/**
 * Calcula a area do telhado considerando inclinacao e beiral
 * @param areaBase - area da base da construcao em m2
 */
export function areaTelhado(areaBase: number): number {
  // Adiciona beiral (considera 60cm de cada lado)
  // Estimativa: aumenta 15% para considerar beirais
  const areaComBeiral = areaBase * 1.15;

  // Aplica fator de inclinacao
  return areaComBeiral * TELHADO.inclinacaoMedia;
}

/**
 * Calcula o volume de concreto para fundacao (baldrame)
 * @param perimetro - perimetro total da construcao
 */
export function concretoFundacao(perimetro: number): number {
  return perimetro * ESTRUTURA.larguraFundacao * ESTRUTURA.profundidadeFundacao;
}

/**
 * Calcula o volume de concreto para contrapiso
 * @param area - area total em m2
 */
export function concretoContrapiso(area: number): number {
  return area * ESTRUTURA.espessuraContrapiso;
}

/**
 * Calcula o volume de concreto para laje
 * @param area - area total em m2
 */
export function concretoLaje(area: number): number {
  return area * ESTRUTURA.espessuraLaje;
}

/**
 * Estima a area de paredes externas (simplificado)
 * Considera aproximadamente 40% das paredes como externas
 */
export function areaParedesExternas(areaTotalParedes: number): number {
  return areaTotalParedes * 0.4;
}

/**
 * Estima a area de paredes internas
 */
export function areaParedesInternas(areaTotalParedes: number): number {
  return areaTotalParedes * 0.6;
}

/**
 * Calcula dimensoes externas aproximadas da construcao
 * Util para calcular perimetro externo real
 */
export function dimensoesExternas(comodos: Comodo[]): {
  largura: number;
  comprimento: number;
  perimetroExterno: number;
} {
  // Simplificacao: considera a raiz quadrada da area total
  // para estimar uma construcao aproximadamente quadrada
  const areaTotal = areaTotalConstruida(comodos);
  const lado = Math.sqrt(areaTotal);

  return {
    largura: lado,
    comprimento: lado,
    perimetroExterno: 4 * lado,
  };
}
