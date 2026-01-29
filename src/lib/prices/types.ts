// Tipos e interfaces para preços
// Fórmulas do Excel implementadas corretamente

/**
 * Fator de ajuste INCC (0.79%)
 * Este valor vem do configuracoes.json
 */
export const FATOR_AJUSTE_MATERIAIS = 0.0079;

/**
 * Aplica o fator INCC ao preço base
 * Fórmula do Excel: PreçoBase × (1 + FatorINCC)
 * @param precoBase - Preço base do item
 * @returns Preço ajustado com fator INCC
 */
export function aplicarAjuste(precoBase: number): number {
  return precoBase * (1 + FATOR_AJUSTE_MATERIAIS);
}

/**
 * Aplica ajuste de estado baseado no CUB
 * Fórmula do Excel: PreçoBase × (CUB_Estado / CUB_Base)
 * @param precoBase - Preço base do item
 * @param fatorEstado - Fator do estado (CUB_Estado / CUB_Base)
 * @returns Preço ajustado pelo estado
 */
export function aplicarAjusteEstado(precoBase: number, fatorEstado: number): number {
  return precoBase * fatorEstado;
}

/**
 * Aplica ajuste completo (INCC + Estado)
 * Fórmula: PreçoBase × (1 + FatorINCC) × FatorEstado
 * @param precoBase - Preço base
 * @param fatorEstado - Fator do estado
 * @returns Preço com ambos os ajustes
 */
export function aplicarAjusteCompleto(precoBase: number, fatorEstado: number): number {
  return precoBase * (1 + FATOR_AJUSTE_MATERIAIS) * fatorEstado;
}

/**
 * Interface para preços de uma seção
 */
export interface PrecosSecao {
  [key: string]: number;
}

/**
 * Interface para sub-seções de revestimentos
 */
export interface PrecosRevestimentos {
  parede: PrecosSecao;
  teto: PrecosSecao;
  pisos: PrecosSecao;
}

/**
 * Interface completa de preços de materiais
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
 * Interface completa de preços de mão de obra
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
