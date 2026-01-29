// Tipos para relatórios detalhados

import { OrcamentoCasaDetalhado } from '@/lib/calculations/orcamento-detalhado-casa';
import { MaoObraCasaDetalhada } from '@/lib/calculations/mao-de-obra-casa';
import { OrcamentoMuroDetalhado, MaoObraMuroDetalhada } from '@/lib/calculations/orcamento-detalhado-muro';
import { OrcamentoPiscinaDetalhado, MaoObraPiscinaDetalhada } from '@/lib/calculations/orcamento-detalhado-piscina';
import { MemorialCalculoEstrutural } from '@/lib/calculations/memorial-calculo-estrutural';

export interface RelatorioCompleto {
  // Resumo
  resumo: {
    areaTotalConstruida: number;
    areaParedes: number;
    areaTelhado: number;
    totalMateriaisCasa: number;
    totalMaoObraCasa: number;
    totalMateriaisMuro: number;
    totalMaoObraMuro: number;
    totalMateriaisPiscina: number;
    totalMaoObraPiscina: number;
    totalGeralMateriais: number;
    totalGeralMaoObra: number;
    totalGeral: number;
  };

  // Relatórios detalhados
  orcamentoCasa: OrcamentoCasaDetalhado;
  maoObraCasa: MaoObraCasaDetalhada;
  orcamentoMuro: OrcamentoMuroDetalhado;
  maoObraMuro: MaoObraMuroDetalhada;
  orcamentoPiscina: OrcamentoPiscinaDetalhado;
  maoObraPiscina: MaoObraPiscinaDetalhada;
  memorialEstrutural: MemorialCalculoEstrutural;
}

// Enum para tipos de relatório
export type TipoRelatorio =
  | 'resumo'
  | 'orcamento-casa'
  | 'mao-obra-casa'
  | 'orcamento-muro'
  | 'mao-obra-muro'
  | 'orcamento-piscina'
  | 'mao-obra-piscina'
  | 'memorial-estrutural';

export const NOMES_RELATORIOS: Record<TipoRelatorio, string> = {
  'resumo': 'Resumo Geral',
  'orcamento-casa': 'Orçamento Casa - Materiais',
  'mao-obra-casa': 'Mão de Obra - Casa',
  'orcamento-muro': 'Orçamento Muro - Materiais',
  'mao-obra-muro': 'Mão de Obra - Muro',
  'orcamento-piscina': 'Orçamento Piscina - Materiais',
  'mao-obra-piscina': 'Mão de Obra - Piscina',
  'memorial-estrutural': 'Memorial de Cálculo Estrutural',
};
