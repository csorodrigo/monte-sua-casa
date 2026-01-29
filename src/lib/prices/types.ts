// Tipos e interfaces para precos - Gerado automaticamente
// Data de geracao: 2026-01-29 08:40:26
// Fonte: monte-sua-casa-simulacao.xlsx

/**
 * Fator de ajuste para materiais (0.79%)
 * Aplicado sobre o preco base para obter o preco ajustado
 */
export const FATOR_AJUSTE_MATERIAIS = 0.0079;

/**
 * Aplica o fator de ajuste ao preco base
 * @param precoBase - Preco base do item
 * @returns Preco ajustado com fator de 0.79%
 */
export function aplicarAjuste(precoBase: number): number {
  return precoBase * (1 + FATOR_AJUSTE_MATERIAIS);
}

/**
 * Interface para precos de uma secao
 */
export interface PrecosSecao {
  [key: string]: number;
}

/**
 * Interface para sub-secoes de revestimentos
 */
export interface PrecosRevestimentos {
  parede: PrecosSecao;
  teto: PrecosSecao;
  pisos: PrecosSecao;
}

/**
 * Interface completa de precos de materiais
 */
export interface PrecosMateriais {
  movimentoTerra: PrecosSecao;
  baldrameAlvenaria: PrecosSecao;
  fundacoesEstruturas: PrecosSecao;
  esquadriasFerragens: PrecosSecao;
  cobertura: PrecosSecao;
  revestimentos: PrecosRevestimentos;
  instalacaoHidraulica: PrecosSecao;
  instalacaoSanitaria: PrecosSecao;
  instalacaoEletrica: PrecosSecao;
  gasGlp: PrecosSecao;
  pintura: PrecosSecao;
  churrasqueira: PrecosSecao;
  limpezaObra: PrecosSecao;
}

/**
 * Interface completa de precos de mao de obra
 */
export interface PrecosMaoObra {
  movimentoTerra: PrecosSecao;
  baldrameAlvenaria: PrecosSecao;
  fundacoesEstruturas: PrecosSecao;
  esquadriasFerragens: PrecosSecao;
  cobertura: PrecosSecao;
  revestimentos: PrecosRevestimentos;
  instalacaoHidraulica: PrecosSecao;
  instalacaoSanitaria: PrecosSecao;
  instalacaoEletrica: PrecosSecao;
  gasGlp: PrecosSecao;
  pintura: PrecosSecao;
  churrasqueira: PrecosSecao;
  limpezaObra: PrecosSecao;
}
