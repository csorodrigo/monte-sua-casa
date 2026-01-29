// Calculo do orcamento de muro
// Fórmula de mão de obra: CUB_Estado / CUB_Base

import { ConfiguracaoMuro, Estado, ResultadoMuro, SecaoOrcamento, ItemOrcamento } from '@/types';
import { PRECOS, DESPERDICIO } from './constants';
import { getCUBBase } from '@/lib/configuracoes';

interface ParametrosMuro {
  muro: ConfiguracaoMuro;
  estado: Estado;
}

/**
 * Calcula a area total do muro
 */
export function areaTotalMuro(muro: ConfiguracaoMuro): number {
  const comprimentoTotal = muro.frente + muro.fundo + muro.direita + muro.esquerda;
  return comprimentoTotal * muro.altura;
}

/**
 * Calcula o comprimento linear total do muro
 */
export function comprimentoTotalMuro(muro: ConfiguracaoMuro): number {
  return muro.frente + muro.fundo + muro.direita + muro.esquerda;
}

/**
 * Cria um item de orcamento
 */
function criarItem(
  descricao: string,
  quantidade: number,
  unidade: string,
  precoUnitario: number
): ItemOrcamento {
  return {
    descricao,
    quantidade: Math.round(quantidade * 100) / 100,
    unidade,
    precoUnitario: Math.round(precoUnitario * 100) / 100,
    total: Math.round(quantidade * precoUnitario * 100) / 100,
  };
}

/**
 * Calcula o orcamento detalhado do muro
 */
export function calcularOrcamentoMuro(params: ParametrosMuro): {
  resultado: ResultadoMuro;
  secaoMateriais: SecaoOrcamento;
  secaoMaoObra: SecaoOrcamento;
} {
  const { muro, estado } = params;

  if (!muro.incluir) {
    return {
      resultado: {
        areaTotal: 0,
        totalMateriais: 0,
        totalMaoObra: 0,
        total: 0,
      },
      secaoMateriais: {
        nome: 'Mat. Muro',
        itens: [],
        subtotal: 0,
      },
      secaoMaoObra: {
        nome: 'M.O. Muro',
        itens: [],
        subtotal: 0,
      },
    };
  }

  const areaTotal = areaTotalMuro(muro);
  const comprimentoTotal = comprimentoTotalMuro(muro);
  const areaComDesperdicio = areaTotal * DESPERDICIO.materiais;

  // Calculos de materiais
  // Blocos de concreto: ~13 blocos por m2
  const qtdBlocos = areaComDesperdicio * 13;

  // Fundacao do muro: 30cm largura x 40cm profundidade
  const volumeFundacao = comprimentoTotal * 0.3 * 0.4 * DESPERDICIO.concreto;

  // Pilares do muro: 1 a cada 3 metros
  const qtdPilaresMuro = Math.ceil(comprimentoTotal / 3);
  const volumeConcreto = qtdPilaresMuro * 0.2 * 0.2 * muro.altura * DESPERDICIO.concreto;

  // Ferro
  const ferroTotal = (comprimentoTotal * 1.5 + qtdPilaresMuro * 8) * DESPERDICIO.ferro;

  // Argamassa
  const argamassa = areaComDesperdicio * 0.015; // 1.5cm de espessura

  // Chapisco e reboco
  const areaReboco = areaTotal * 2; // Dois lados

  // Itens de material
  const itensMaterial: ItemOrcamento[] = [
    criarItem('Bloco concreto 14x19x39', qtdBlocos, 'un', 3.50),
    criarItem('Concreto fundacao', volumeFundacao, 'm3', PRECOS.concretoPorM3),
    criarItem('Concreto pilares', volumeConcreto, 'm3', PRECOS.concretoPorM3),
    criarItem('Ferro CA-50', ferroTotal, 'kg', PRECOS.ferroPorKg),
    criarItem('Argamassa assentamento', argamassa, 'm3', PRECOS.concretoPorM3 * 0.8),
    criarItem('Chapisco e reboco', areaReboco, 'm2', PRECOS.argamassaPorM2),
    criarItem('Cimento (sacos)', Math.ceil(comprimentoTotal / 5), 'sc', PRECOS.cimentoPorSaco),
    criarItem('Areia', argamassa * 3, 'm3', PRECOS.areiaPorM3),
  ];

  const totalMateriais = itensMaterial.reduce((sum, item) => sum + item.total, 0);

  // Mao de obra
  // Usa fator de estado baseado no CUB
  const cubBase = getCUBBase();
  const cubEstado = estado.cub || estado.custoMaoObraPorM2 / 0.48;
  const fatorEstado = cubEstado / cubBase;
  const custoMaoObraPorM2 = PRECOS.muroMaoObraPorM2 * fatorEstado;
  const totalMaoObra = areaTotal * custoMaoObraPorM2;

  const itemMaoObra = criarItem(`Mao de obra muro (${estado.sigla})`, areaTotal, 'm2', custoMaoObraPorM2);

  return {
    resultado: {
      areaTotal: Math.round(areaTotal * 100) / 100,
      totalMateriais: Math.round(totalMateriais * 100) / 100,
      totalMaoObra: Math.round(totalMaoObra * 100) / 100,
      total: Math.round((totalMateriais + totalMaoObra) * 100) / 100,
    },
    secaoMateriais: {
      nome: 'Mat. Muro',
      itens: itensMaterial,
      subtotal: Math.round(totalMateriais * 100) / 100,
    },
    secaoMaoObra: {
      nome: 'M.O. Muro',
      itens: [itemMaoObra],
      subtotal: Math.round(totalMaoObra * 100) / 100,
    },
  };
}
