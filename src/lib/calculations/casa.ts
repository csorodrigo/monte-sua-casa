// Calculo completo do orcamento da casa
// Fórmula de mão de obra: Usa cálculo detalhado de mao-de-obra-casa.ts com BDI 14.40%

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
import { calcularMaoObraCasaDetalhada, ParametrosMaoObraCasa } from './mao-de-obra-casa';

interface ParametrosCasa {
  comodos: Comodo[];
  tipoTelhado: TipoTelhado;
  tipoTijolo: TipoTijolo;
  padraoAcabamento: PadraoAcabamento;
  estado: Estado;
  reboco: ConfiguracaoReboco;
  incluirChurrasqueira?: boolean;
  temPortaDecorativa?: boolean;
  profundidadeFundos?: number; // metros do fundo do lote (D11)
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
 * Converte SecaoOrcamentoDetalhado para SecaoOrcamento
 * Adaptador para manter compatibilidade com a interface existente
 */
function converterSecaoDetalhada(secaoDetalhada: { codigo: string; nome: string; itens: Array<{ codigo: string; descricao: string; unidade: string; quantidade: number; precoUnitario: number; total: number }>; subtotal: number }): SecaoOrcamento {
  return {
    nome: `${secaoDetalhada.codigo} - ${secaoDetalhada.nome}`,
    itens: secaoDetalhada.itens.map(item => ({
      descricao: item.descricao,
      quantidade: item.quantidade,
      unidade: item.unidade,
      precoUnitario: item.precoUnitario,
      total: item.total,
    })),
    subtotal: secaoDetalhada.subtotal,
  };
}

/**
 * Calcula orcamento de mao de obra usando cálculo detalhado
 * Retorna uma seção consolidada para compatibilidade com a UI existente
 */
function calcularMaoObraCasa(
  params: ParametrosMaoObraCasa
): { consolidada: SecaoOrcamento; detalhada: ReturnType<typeof calcularMaoObraCasaDetalhada> } {
  const maoObraDetalhada = calcularMaoObraCasaDetalhada(params);

  // Cria uma seção consolidada para compatibilidade
  const consolidada = criarSecao('M.O. Casa (Detalhada)', [
    criarItem('Movimento de Terra', 1, 'vb', maoObraDetalhada.movimentoTerra.subtotal),
    criarItem('Baldrame e Alvenaria', 1, 'vb', maoObraDetalhada.baldrameAlvenaria.subtotal),
    criarItem('Fundações e Estruturas', 1, 'vb', maoObraDetalhada.fundacoesEstruturas.subtotal),
    criarItem('Esquadrias e Ferragens', 1, 'vb', maoObraDetalhada.esquadriasFerragens.subtotal),
    criarItem('Cobertura', 1, 'vb', maoObraDetalhada.cobertura.subtotal),
    criarItem('Revestimentos', 1, 'vb', maoObraDetalhada.revestimentos.subtotal),
    criarItem('Instalação Hidráulica', 1, 'vb', maoObraDetalhada.instalacaoHidraulica.subtotal),
    criarItem('Instalação Sanitária', 1, 'vb', maoObraDetalhada.instalacaoSanitaria.subtotal),
    criarItem('Instalação Elétrica', 1, 'vb', maoObraDetalhada.instalacaoEletrica.subtotal),
    criarItem('Gás GLP', 1, 'vb', maoObraDetalhada.gasGlp.subtotal),
    criarItem('Pintura', 1, 'vb', maoObraDetalhada.pintura.subtotal),
    criarItem('Churrasqueira', 1, 'vb', maoObraDetalhada.churrasqueira.subtotal),
    criarItem('Limpeza da Obra', 1, 'vb', maoObraDetalhada.limpezaObra.subtotal),
    criarItem(`BDI (${maoObraDetalhada.bdiPercentual}%)`, 1, 'vb', maoObraDetalhada.bdi),
  ]);

  // Ajusta o subtotal para incluir o BDI
  consolidada.subtotal = maoObraDetalhada.totalGeral;

  return { consolidada, detalhada: maoObraDetalhada };
}

/**
 * Calcula quantidade de cômodos por tipo a partir da lista de cômodos
 */
function contarComodos(comodos: Comodo[]): { total: number; banheiros: number; quartos: number; portas: number } {
  let banheiros = 0;
  let quartos = 0;

  for (const comodo of comodos) {
    const nomeLower = comodo.nome.toLowerCase();
    if (nomeLower.includes('banheiro') || nomeLower.includes('lavabo') || nomeLower.includes('wc')) {
      banheiros++;
    }
    if (nomeLower.includes('quarto') || nomeLower.includes('dormit') || nomeLower.includes('suite')) {
      quartos++;
    }
  }

  // Total de cômodos
  const total = comodos.length;
  // Portas = quartos + banheiros + 2 (cozinha, área serviço, etc.)
  const portas = quartos + banheiros + 2;

  return { total, banheiros, quartos, portas };
}

/**
 * Calcula o orcamento completo da casa
 */
export function calcularOrcamentoCasa(params: ParametrosCasa): ResultadoCasa {
  const {
    comodos,
    tipoTelhado,
    tipoTijolo,
    padraoAcabamento,
    estado,
    reboco,
    incluirChurrasqueira = false,
    temPortaDecorativa = false,
    profundidadeFundos = 6, // valor padrão de 6 metros
  } = params;

  // Calculos de area
  const areaTotal = areaTotalConstruida(comodos);
  const areaParedes = areaTotalParedes(comodos);
  const areaTelhadoCalc = areaTelhado(areaTotal);
  const dimensoes = dimensoesExternas(comodos);
  const perimetro = dimensoes.perimetroExterno;

  // Calcular quantidades de cômodos
  const contagem = contarComodos(comodos);

  // Calcular cada secao de materiais
  const fundacao = calcularFundacao(perimetro, areaTotal);
  const estrutura = calcularEstruturaOrcamento(areaTotal, perimetro, tipoTijolo);
  const alvenaria = calcularAlvenaria(areaParedes, tipoTijolo);
  const telhado = calcularTelhadoOrcamento(areaTelhadoCalc, tipoTelhado);
  const rebocoSecao = calcularReboco(areaParedes, reboco);
  const acabamento = calcularAcabamento(areaTotal, areaParedes, padraoAcabamento);

  // Parâmetros para cálculo detalhado de mão de obra
  const qtdPilares = Math.ceil(areaTotal / 12); // 1 pilar a cada 12m²
  const paramsMaoObra: ParametrosMaoObraCasa = {
    areaTotal,
    perimetroExterno: perimetro,
    areaParedes,
    areaTelhado: areaTelhadoCalc,
    qtdPilares,
    qtdBanheiros: contagem.banheiros || 1, // mínimo 1 banheiro
    qtdQuartos: contagem.quartos || 1, // mínimo 1 quarto
    estado,
    padraoAcabamento,
    incluirChurrasqueira,
    temPortaDecorativa,
    qtdComodos: contagem.total || 5, // mínimo 5 cômodos
    qtdPortas: contagem.portas || 5,
    larguraCasa: dimensoes.largura,
    comprimentoCasa: dimensoes.comprimento,
    profundidadeFundos,
  };

  // Calcular mão de obra detalhada
  const { consolidada: maoObraCasa, detalhada: maoObraDetalhada } = calcularMaoObraCasa(paramsMaoObra);

  // Totais
  const totalMateriais =
    fundacao.subtotal +
    estrutura.subtotal +
    alvenaria.subtotal +
    telhado.subtotal +
    rebocoSecao.subtotal +
    acabamento.subtotal;

  const totalMaoObraValor = maoObraCasa.subtotal;
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
      maoObraCasa,
      // Seções detalhadas de mão de obra (13 seções conforme planilha Excel)
      maoObraMovimentoTerra: converterSecaoDetalhada(maoObraDetalhada.movimentoTerra),
      maoObraBaldrameAlvenaria: converterSecaoDetalhada(maoObraDetalhada.baldrameAlvenaria),
      maoObraFundacoesEstruturas: converterSecaoDetalhada(maoObraDetalhada.fundacoesEstruturas),
      maoObraEsquadriasFerragens: converterSecaoDetalhada(maoObraDetalhada.esquadriasFerragens),
      maoObraCobertura: converterSecaoDetalhada(maoObraDetalhada.cobertura),
      maoObraRevestimentos: converterSecaoDetalhada(maoObraDetalhada.revestimentos),
      maoObraInstalacaoHidraulica: converterSecaoDetalhada(maoObraDetalhada.instalacaoHidraulica),
      maoObraInstalacaoSanitaria: converterSecaoDetalhada(maoObraDetalhada.instalacaoSanitaria),
      maoObraInstalacaoEletrica: converterSecaoDetalhada(maoObraDetalhada.instalacaoEletrica),
      maoObraGasGlp: converterSecaoDetalhada(maoObraDetalhada.gasGlp),
      maoObraPintura: converterSecaoDetalhada(maoObraDetalhada.pintura),
      maoObraChurrasqueira: converterSecaoDetalhada(maoObraDetalhada.churrasqueira),
      maoObraLimpezaObra: converterSecaoDetalhada(maoObraDetalhada.limpezaObra),
      // Totais de mão de obra detalhada
      maoObraSubtotal: maoObraDetalhada.subtotal,
      maoObraBdi: maoObraDetalhada.bdi,
      maoObraBdiPercentual: maoObraDetalhada.bdiPercentual,
      maoObraTotalGeral: maoObraDetalhada.totalGeral,
    },
  };
}
