// Calculo completo do orcamento da casa

import {
  Comodo,
  TipoTelhado,
  TipoTijolo,
  PadraoAcabamento,
  Estado,
  ConfiguracaoReboco,
  SecaoOrcamento,
  ItemOrcamento,
  BreakdownOrcamento,
} from '@/types';
import { PRECOS, DESPERDICIO, TELHADO, ALVENARIA } from './constants';
import {
  areaTotalConstruida,
  areaTotalParedes,
  areaTelhado,
  areaParedesExternas,
  areaParedesInternas,
  dimensoesExternas,
} from './area';
import { calcularEstrutura } from './estrutura';

interface ParametrosCasa {
  comodos: Comodo[];
  tipoTelhado: TipoTelhado;
  tipoTijolo: TipoTijolo;
  padraoAcabamento: PadraoAcabamento;
  estado: Estado;
  reboco: ConfiguracaoReboco;
}

interface ResultadoCasa {
  areaTotalConstruida: number;
  areaParedes: number;
  areaTelhado: number;
  totalMateriais: number;
  totalMaoObra: number;
  totalGeral: number;
  breakdown: BreakdownOrcamento;
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
 * Cria uma secao de orcamento
 */
function criarSecao(nome: string, itens: ItemOrcamento[]): SecaoOrcamento {
  const subtotal = itens.reduce((sum, item) => sum + item.total, 0);
  return {
    nome,
    itens,
    subtotal: Math.round(subtotal * 100) / 100,
  };
}

/**
 * Calcula orcamento de fundacao
 */
function calcularFundacao(
  perimetro: number,
  areaTotal: number
): SecaoOrcamento {
  const volumeConcreto = perimetro * 0.4 * 0.6 * DESPERDICIO.concreto;
  const qtdSapatas = Math.ceil(areaTotal / 12); // 1 sapata a cada 12m2

  const itens: ItemOrcamento[] = [
    criarItem('Concreto fundacao', volumeConcreto, 'm3', PRECOS.concretoPorM3),
    criarItem('Sapatas', qtdSapatas, 'un', PRECOS.sapataPorUnidade),
    criarItem('Ferro fundacao', perimetro * 2.5 * DESPERDICIO.ferro, 'kg', PRECOS.ferroPorKg),
  ];

  return criarSecao('Fundacao', itens);
}

/**
 * Calcula orcamento de estrutura
 */
function calcularEstruturaOrcamento(
  areaTotal: number,
  perimetro: number,
  tipoTijolo: TipoTijolo
): SecaoOrcamento {
  const estrutura = calcularEstrutura(areaTotal, perimetro, tipoTijolo);

  const itens: ItemOrcamento[] = [
    criarItem('Concreto pilares', estrutura.detalhamento.concretoPilares, 'm3', PRECOS.concretoPorM3),
    criarItem('Concreto vigas', estrutura.detalhamento.concretoVigas, 'm3', PRECOS.concretoPorM3),
    criarItem('Concreto laje', estrutura.detalhamento.concretoLaje, 'm3', PRECOS.concretoPorM3),
    criarItem('Ferro estrutural', estrutura.ferroTotal, 'kg', PRECOS.ferroPorKg),
    criarItem('Arame recozido', estrutura.ferroTotal * 0.05, 'kg', PRECOS.aramePorKg),
  ];

  return criarSecao('Estrutura', itens);
}

/**
 * Calcula orcamento de alvenaria (paredes)
 */
function calcularAlvenaria(
  areaParedes: number,
  tipoTijolo: TipoTijolo
): SecaoOrcamento {
  const areaComDesperdicio = areaParedes * DESPERDICIO.materiais;
  const qtdTijolos = areaComDesperdicio * tipoTijolo.tijolosPorM2;
  const argamassa = areaParedes * ALVENARIA.argamassaPorM2 * DESPERDICIO.materiais;

  const itens: ItemOrcamento[] = [
    criarItem(tipoTijolo.nome, qtdTijolos, 'un', tipoTijolo.precoUnidade),
    criarItem('Argamassa assentamento', argamassa, 'm3', PRECOS.concretoPorM3 * 0.8),
    criarItem('Cimento (sacos)', Math.ceil(areaParedes / 10), 'sc', PRECOS.cimentoPorSaco),
    criarItem('Areia', argamassa * 3, 'm3', PRECOS.areiaPorM3),
  ];

  return criarSecao('Alvenaria', itens);
}

/**
 * Calcula orcamento de telhado
 */
function calcularTelhadoOrcamento(
  areaTelhado: number,
  tipoTelhado: TipoTelhado
): SecaoOrcamento {
  const areaComDesperdicio = areaTelhado * DESPERDICIO.materiais;

  const itens: ItemOrcamento[] = [
    criarItem(`Telha ${tipoTelhado.nome}`, areaComDesperdicio, 'm2', tipoTelhado.precoPorM2),
    criarItem('Estrutura madeira', areaComDesperdicio, 'm2', TELHADO.estruturaMadeiraPorM2),
    criarItem('Cumeeira e acessorios', areaTelhado * 0.1, 'm2', tipoTelhado.precoPorM2 * 1.5),
  ];

  return criarSecao('Telhado', itens);
}

/**
 * Calcula orcamento de reboco
 */
function calcularReboco(
  areaParedes: number,
  reboco: ConfiguracaoReboco
): SecaoOrcamento {
  const itens: ItemOrcamento[] = [];

  if (reboco.externo) {
    const areaExterna = areaParedesExternas(areaParedes);
    itens.push(criarItem('Reboco externo', areaExterna, 'm2', PRECOS.argamassaPorM2));
  }

  if (reboco.interno) {
    const areaInterna = areaParedesInternas(areaParedes);
    itens.push(criarItem('Reboco interno', areaInterna, 'm2', PRECOS.argamassaPorM2));
  }

  // Se nenhum reboco, adiciona item zerado para manter estrutura
  if (itens.length === 0) {
    itens.push(criarItem('Reboco (nao incluido)', 0, 'm2', 0));
  }

  return criarSecao('Reboco', itens);
}

/**
 * Calcula orcamento de acabamento
 */
function calcularAcabamento(
  areaTotal: number,
  areaParedes: number,
  padraoAcabamento: PadraoAcabamento
): SecaoOrcamento {
  const multiplicador = padraoAcabamento.multiplicadorPreco;

  const itens: ItemOrcamento[] = [
    criarItem('Piso', areaTotal, 'm2', PRECOS.pisoPorM2 * multiplicador),
    criarItem('Revestimento banheiros/cozinha', areaTotal * 0.3, 'm2', PRECOS.azulejoPorM2 * multiplicador),
    criarItem('Esquadrias', areaTotal, 'm2', PRECOS.esquadriasPorM2 * multiplicador),
    criarItem('Instalacao eletrica', areaTotal, 'm2', PRECOS.eletricaPorM2 * multiplicador),
    criarItem('Instalacao hidraulica', areaTotal, 'm2', PRECOS.hidraulicaPorM2 * multiplicador),
    criarItem('Pintura', areaParedes, 'm2', PRECOS.pinturaPorM2 * multiplicador),
  ];

  return criarSecao(`Acabamento (${padraoAcabamento.nome})`, itens);
}

/**
 * Calcula orcamento de mao de obra
 */
function calcularMaoObra(
  areaTotal: number,
  estado: Estado,
  padraoAcabamento: PadraoAcabamento
): SecaoOrcamento {
  const custoBase = estado.custoMaoObraPorM2 * padraoAcabamento.multiplicadorPreco;

  const itens: ItemOrcamento[] = [
    criarItem(`Mao de obra (${estado.sigla})`, areaTotal, 'm2', custoBase),
  ];

  return criarSecao('Mao de Obra', itens);
}

/**
 * Calcula o orcamento completo da casa
 */
export function calcularOrcamentoCasa(params: ParametrosCasa): ResultadoCasa {
  const { comodos, tipoTelhado, tipoTijolo, padraoAcabamento, estado, reboco } = params;

  // Calculos de area
  const areaTotal = areaTotalConstruida(comodos);
  const areaParedes = areaTotalParedes(comodos);
  const areaTelhadoCalc = areaTelhado(areaTotal);
  const dimensoes = dimensoesExternas(comodos);
  const perimetro = dimensoes.perimetroExterno;

  // Calcular cada secao
  const fundacao = calcularFundacao(perimetro, areaTotal);
  const estrutura = calcularEstruturaOrcamento(areaTotal, perimetro, tipoTijolo);
  const alvenaria = calcularAlvenaria(areaParedes, tipoTijolo);
  const telhado = calcularTelhadoOrcamento(areaTelhadoCalc, tipoTelhado);
  const rebocoSecao = calcularReboco(areaParedes, reboco);
  const acabamento = calcularAcabamento(areaTotal, areaParedes, padraoAcabamento);
  const maoObra = calcularMaoObra(areaTotal, estado, padraoAcabamento);

  // Totais
  const totalMateriais =
    fundacao.subtotal +
    estrutura.subtotal +
    alvenaria.subtotal +
    telhado.subtotal +
    rebocoSecao.subtotal +
    acabamento.subtotal;

  const totalMaoObraValor = maoObra.subtotal;
  const totalGeral = totalMateriais + totalMaoObraValor;

  return {
    areaTotalConstruida: Math.round(areaTotal * 100) / 100,
    areaParedes: Math.round(areaParedes * 100) / 100,
    areaTelhado: Math.round(areaTelhadoCalc * 100) / 100,
    totalMateriais: Math.round(totalMateriais * 100) / 100,
    totalMaoObra: Math.round(totalMaoObraValor * 100) / 100,
    totalGeral: Math.round(totalGeral * 100) / 100,
    breakdown: {
      fundacao,
      estrutura,
      alvenaria,
      telhado,
      reboco: rebocoSecao,
      acabamento,
      maoObra,
    },
  };
}
