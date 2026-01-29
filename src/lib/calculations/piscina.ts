// Calculo do orcamento de piscina

import { ConfiguracaoPiscina, Estado, ResultadoPiscina, SecaoOrcamento, ItemOrcamento } from '@/types';
import { PRECOS, DESPERDICIO } from './constants';

interface ParametrosPiscina {
  piscina: ConfiguracaoPiscina;
  estado: Estado;
}

/**
 * Calcula o volume da piscina em m3
 */
export function volumePiscina(piscina: ConfiguracaoPiscina): number {
  return piscina.largura * piscina.comprimento * piscina.profundidade;
}

/**
 * Calcula a area da superficie (fundo + paredes)
 */
export function areaSuperificiePiscina(piscina: ConfiguracaoPiscina): number {
  const areaFundo = piscina.largura * piscina.comprimento;
  const areaParedes =
    2 * (piscina.largura * piscina.profundidade) +
    2 * (piscina.comprimento * piscina.profundidade);
  return areaFundo + areaParedes;
}

/**
 * Calcula o perimetro da piscina
 */
export function perimetroPiscina(piscina: ConfiguracaoPiscina): number {
  return 2 * (piscina.largura + piscina.comprimento);
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
 * Calcula o orcamento detalhado da piscina
 */
export function calcularOrcamentoPiscina(params: ParametrosPiscina): {
  resultado: ResultadoPiscina;
  secao: SecaoOrcamento;
} {
  const { piscina, estado } = params;

  if (!piscina.incluir) {
    return {
      resultado: {
        areaSuperficie: 0,
        volume: 0,
        totalMateriais: 0,
        totalMaoObra: 0,
        total: 0,
      },
      secao: {
        nome: 'Piscina',
        itens: [],
        subtotal: 0,
      },
    };
  }

  const volume = volumePiscina(piscina);
  const areaSuperficie = areaSuperificiePiscina(piscina);
  const perimetro = perimetroPiscina(piscina);

  // Escavacao (considera 50cm a mais em cada lado)
  const volumeEscavacao = (piscina.largura + 1) * (piscina.comprimento + 1) * (piscina.profundidade + 0.3);

  // Concreto para paredes e fundo (15cm de espessura)
  const volumeConcreto = areaSuperficie * 0.15 * DESPERDICIO.concreto;

  // Ferro estrutural
  const ferroTotal = areaSuperficie * 5 * DESPERDICIO.ferro; // 5kg por m2

  // Impermeabilizacao
  const areaImpermeabilizacao = areaSuperficie * DESPERDICIO.materiais;

  // Revestimento (azulejo/pastilha)
  const areaRevestimento = areaSuperficie * DESPERDICIO.materiais;

  // Bordas (piso atermico)
  const areaBordas = perimetro * 1.0; // 1 metro de borda ao redor

  // Sistema hidraulico (bombas, filtros, tubulacao)
  const custoHidraulico = volume * 150; // R$ 150 por m3

  // Itens de material
  const itensMaterial: ItemOrcamento[] = [
    criarItem('Escavacao', volumeEscavacao, 'm3', 45.00),
    criarItem('Concreto armado', volumeConcreto, 'm3', PRECOS.concretoPorM3),
    criarItem('Ferro CA-50', ferroTotal, 'kg', PRECOS.ferroPorKg),
    criarItem('Impermeabilizacao', areaImpermeabilizacao, 'm2', 85.00),
    criarItem('Revestimento ceramico', areaRevestimento, 'm2', PRECOS.piscinaAcabamentoPorM2),
    criarItem('Borda atermico', areaBordas, 'm2', 95.00),
    criarItem('Sistema hidraulico completo', 1, 'cj', custoHidraulico),
    criarItem('Iluminacao subaquatica', Math.ceil(volume / 15), 'un', 450.00),
  ];

  const totalMateriais = itensMaterial.reduce((sum, item) => sum + item.total, 0);

  // Mao de obra (mais especializada, portanto mais cara)
  const custoMaoObraPorM3 = PRECOS.piscinaMaoObraPorM3 * (estado.custoMaoObraPorM2 / 85);
  const totalMaoObra = volume * custoMaoObraPorM3;

  const itemMaoObra = criarItem(`Mao de obra piscina (${estado.sigla})`, volume, 'm3', custoMaoObraPorM3);

  const todosItens = [...itensMaterial, itemMaoObra];

  return {
    resultado: {
      areaSuperficie: Math.round(areaSuperficie * 100) / 100,
      volume: Math.round(volume * 100) / 100,
      totalMateriais: Math.round(totalMateriais * 100) / 100,
      totalMaoObra: Math.round(totalMaoObra * 100) / 100,
      total: Math.round((totalMateriais + totalMaoObra) * 100) / 100,
    },
    secao: {
      nome: 'Piscina',
      itens: todosItens,
      subtotal: Math.round((totalMateriais + totalMaoObra) * 100) / 100,
    },
  };
}
