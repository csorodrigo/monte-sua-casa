// Mão de Obra detalhada da Casa - Baseado na planilha original

import { Estado, PadraoAcabamento } from '@/types';
import { ItemOrcamentoDetalhado, SecaoOrcamentoDetalhado, PRECOS_CASA } from './orcamento-detalhado-casa';

// Preços de mão de obra (variação de 0.79% conforme planilha)
const VARIACAO_MAO_OBRA = 0.79;

export const PRECOS_MAO_OBRA_CASA = {
  // 3.1 MOVIMENTO DE TERRA
  escavacaoValasBaldrame: 37.50,
  escavacaoFundacao60x60: 37.50,
  reterroCompactacao: 25.45,
  espalhamentoBase: 23.90,
  apiloamentoFundoVala: 27.50,

  // 3.2 BALDRAME E ALVENARIA DE ELEVAÇÃO
  alvenariaPedraArgamassada: 311.50,
  cintaConcretoArmado: 635.44,
  impermeabilizacaoBaldrame: 8.80,
  alvenariaTijoloFurado: 41.50,

  // 3.3 FUNDAÇÕES E ESTRUTURAS
  concretoPilaresVigas: 205.50,
  formaDesforma: 11.20,
  armaduraCA50: 4.10,
  lancamentoConcreto: 159.08,
  lajePrefabricada: 14.91,

  // 3.4 ESQUADRIAS E FERRAGENS
  portaEntradaDecorativa: 550.00,
  portaMadeiraLei: 130.00,
  portaAluminio: 280.00,
  janelaAluminio: 350.00,
  fechaduraInterna: 45.00,
  dobradica: 12.00,

  // 3.5 COBERTURA
  madeiraTesoura: 85.00,
  telha: 45.00,
  cumeeira: 15.00,
  rufoPingadeira: 35.00,
  calha: 45.00,

  // 3.6 REVESTIMENTOS
  chapiscoParede: 5.59,
  rebocoParede: 21.91,
  contrapisoArgamassa: 32.51,
  ceramicaPiso: 42.00,
  ceramicaParede: 48.00,
  rejunte: 6.51,

  // 3.7-3.9 INSTALAÇÕES (simplificado)
  instalacaoHidraulicaPorM2: 45.00,
  instalacaoSanitariaPorM2: 25.00,
  instalacaoEletricaPorM2: 55.00,

  // 3.10 PINTURA
  massaCorrePVA: 8.51,
  lixamento: 2.51,
  pinturaLatexPVA: 12.51,
  pinturaAcrilica: 15.51,
};

interface ParametrosMaoObraCasa {
  areaTotal: number;
  perimetroExterno: number;
  areaParedes: number;
  areaTelhado: number;
  qtdPilares: number;
  qtdBanheiros: number;
  qtdQuartos: number;
  estado: Estado;
  padraoAcabamento: PadraoAcabamento;
}

export interface MaoObraCasaDetalhada {
  movimentoTerra: SecaoOrcamentoDetalhado;
  baldrameAlvenaria: SecaoOrcamentoDetalhado;
  fundacoesEstruturas: SecaoOrcamentoDetalhado;
  esquadriasFerragens: SecaoOrcamentoDetalhado;
  cobertura: SecaoOrcamentoDetalhado;
  revestimentos: SecaoOrcamentoDetalhado;
  instalacoes: SecaoOrcamentoDetalhado;
  pintura: SecaoOrcamentoDetalhado;
  subtotal: number;
  bdi: number;
  bdiPercentual: number;
  totalGeral: number;
}

function criarItem(
  codigo: string,
  descricao: string,
  unidade: string,
  quantidade: number,
  precoUnitario: number
): ItemOrcamentoDetalhado {
  return {
    codigo,
    descricao,
    unidade,
    quantidade: Math.round(quantidade * 100) / 100,
    precoUnitario: Math.round(precoUnitario * 100) / 100,
    total: Math.round(quantidade * precoUnitario * 100) / 100,
  };
}

function criarSecao(codigo: string, nome: string, itens: ItemOrcamentoDetalhado[]): SecaoOrcamentoDetalhado {
  const subtotal = itens.reduce((sum, item) => sum + item.total, 0);
  return { codigo, nome, itens, subtotal: Math.round(subtotal * 100) / 100 };
}

/**
 * Calcula a mão de obra detalhada da casa
 */
export function calcularMaoObraCasaDetalhada(params: ParametrosMaoObraCasa): MaoObraCasaDetalhada {
  const {
    areaTotal,
    perimetroExterno,
    areaParedes,
    areaTelhado,
    qtdPilares,
    qtdBanheiros,
    qtdQuartos,
    estado,
    padraoAcabamento,
  } = params;

  // Fator de ajuste pelo estado (base SP = 98)
  const fatorEstado = estado.custoMaoObraPorM2 / 98;
  const mult = padraoAcabamento.multiplicadorPreco;

  // 3.1 MOVIMENTO DE TERRA
  const volumeEscavacaoBaldrame = perimetroExterno * 0.4 * 0.4;
  const volumeEscavacaoFundacao = qtdPilares * 0.6 * 0.6 * 0.6;
  const volumeReterro = volumeEscavacaoBaldrame * 0.3;
  const areaEspalhamento = areaTotal * 0.5;
  const areaApiloamento = perimetroExterno * 0.4;

  const movimentoTerra = criarSecao('3.1', 'MOVIMENTO DE TERRA', [
    criarItem('3.1.1', 'Escavação manual de valas - baldrames', 'm³', volumeEscavacaoBaldrame, PRECOS_MAO_OBRA_CASA.escavacaoValasBaldrame * fatorEstado),
    criarItem('3.1.2', 'Escavação manual de fundação', 'm³', volumeEscavacaoFundacao, PRECOS_MAO_OBRA_CASA.escavacaoFundacao60x60 * fatorEstado),
    criarItem('3.1.3', 'Reterro manual com compactação', 'm³', volumeReterro, PRECOS_MAO_OBRA_CASA.reterroCompactacao * fatorEstado),
    criarItem('3.1.4', 'Espalhamento e adensamento de base', 'm³', areaEspalhamento, PRECOS_MAO_OBRA_CASA.espalhamentoBase * fatorEstado),
    criarItem('3.1.5', 'Apiloamento de fundo de vala', 'm²', areaApiloamento, PRECOS_MAO_OBRA_CASA.apiloamentoFundoVala * fatorEstado),
  ]);

  // 3.2 BALDRAME E ALVENARIA
  const volumeAlvenariaPedra = perimetroExterno * 0.3 * 0.3;
  const volumeCinta = perimetroExterno * 0.1 * 0.1;
  const areaImpermeabilizacao = perimetroExterno * 0.5;

  const baldrameAlvenaria = criarSecao('3.2', 'BALDRAME E ALVENARIA DE ELEVAÇÃO', [
    criarItem('3.2.1', 'Alvenaria de pedra argamassada', 'm³', volumeAlvenariaPedra, PRECOS_MAO_OBRA_CASA.alvenariaPedraArgamassada * fatorEstado),
    criarItem('3.2.2', 'Cinta em concreto armado', 'm³', volumeCinta, PRECOS_MAO_OBRA_CASA.cintaConcretoArmado * fatorEstado),
    criarItem('3.2.3', 'Impermeabilização de Baldrame', 'm²', areaImpermeabilizacao, PRECOS_MAO_OBRA_CASA.impermeabilizacaoBaldrame * fatorEstado),
    criarItem('3.2.4', 'Alvenaria em tijolo furado', 'm²', areaParedes, PRECOS_MAO_OBRA_CASA.alvenariaTijoloFurado * fatorEstado),
  ]);

  // 3.3 FUNDAÇÕES E ESTRUTURAS
  const volumeConcretoTotal = (qtdPilares * 0.15 * 0.15 * 2.8) + (perimetroExterno * 0.15 * 0.3) + (areaTotal * 0.1);
  const areaForma = (qtdPilares * 0.15 * 4 * 2.8) + (perimetroExterno * 0.3 * 2);
  const pesoFerro = (qtdPilares * 35) + (perimetroExterno * 4) + (areaTotal * 4.5);

  const fundacoesEstruturas = criarSecao('3.3', 'FUNDAÇÕES E ESTRUTURAS', [
    criarItem('3.3.1', 'Concreto em pilares, vigas e escada', 'm³', volumeConcretoTotal, PRECOS_MAO_OBRA_CASA.concretoPilaresVigas * fatorEstado),
    criarItem('3.3.2', 'Forma e desforma', 'm²', areaForma, PRECOS_MAO_OBRA_CASA.formaDesforma * fatorEstado),
    criarItem('3.3.3', 'Armadura CA 50', 'kg', pesoFerro, PRECOS_MAO_OBRA_CASA.armaduraCA50 * fatorEstado),
    criarItem('3.3.4', 'Lançamento e aplicação do concreto', 'm³', volumeConcretoTotal, PRECOS_MAO_OBRA_CASA.lancamentoConcreto * fatorEstado),
    criarItem('3.3.5', 'Lajes pré-fabricadas', 'm²', areaTotal, PRECOS_MAO_OBRA_CASA.lajePrefabricada * fatorEstado),
  ]);

  // 3.4 ESQUADRIAS
  const qtdPortasInternas = qtdQuartos + qtdBanheiros + 2;

  const esquadriasFerragens = criarSecao('3.4', 'ESQUADRIAS E FERRAGENS', [
    criarItem('3.4.1', 'Instalação porta entrada', 'unid', 1, PRECOS_MAO_OBRA_CASA.portaEntradaDecorativa * fatorEstado * 0.3),
    criarItem('3.4.2', 'Instalação portas internas', 'unid', qtdPortasInternas, PRECOS_MAO_OBRA_CASA.portaMadeiraLei * fatorEstado * 0.3),
    criarItem('3.4.3', 'Instalação janelas', 'm²', (qtdQuartos + qtdBanheiros + 2) * 1.5, PRECOS_MAO_OBRA_CASA.janelaAluminio * fatorEstado * 0.25),
  ]);

  // 3.5 COBERTURA
  const cobertura = criarSecao('3.5', 'COBERTURA', [
    criarItem('3.5.1', 'Estrutura de madeira', 'm²', areaTelhado, PRECOS_MAO_OBRA_CASA.madeiraTesoura * fatorEstado * 0.4),
    criarItem('3.5.2', 'Colocação de telhas', 'm²', areaTelhado * 1.1, PRECOS_MAO_OBRA_CASA.telha * fatorEstado),
    criarItem('3.5.3', 'Cumeeira e acabamentos', 'm', Math.sqrt(areaTotal) * 0.5, PRECOS_MAO_OBRA_CASA.cumeeira * fatorEstado),
    criarItem('3.5.4', 'Calhas e rufos', 'm', perimetroExterno * 0.4, PRECOS_MAO_OBRA_CASA.calha * fatorEstado * 0.5),
  ]);

  // 3.6 REVESTIMENTOS
  const areaPintura = areaParedes + areaTotal;

  const revestimentos = criarSecao('3.6', 'REVESTIMENTOS', [
    criarItem('3.6.1', 'Chapisco', 'm²', areaParedes, PRECOS_MAO_OBRA_CASA.chapiscoParede * fatorEstado),
    criarItem('3.6.2', 'Reboco', 'm²', areaParedes, PRECOS_MAO_OBRA_CASA.rebocoParede * fatorEstado),
    criarItem('3.6.3', 'Contrapiso', 'm²', areaTotal, PRECOS_MAO_OBRA_CASA.contrapisoArgamassa * fatorEstado),
    criarItem('3.6.4', 'Assentamento cerâmica piso', 'm²', areaTotal, PRECOS_MAO_OBRA_CASA.ceramicaPiso * fatorEstado * mult),
    criarItem('3.6.5', 'Assentamento cerâmica parede', 'm²', (qtdBanheiros * 12) + 8, PRECOS_MAO_OBRA_CASA.ceramicaParede * fatorEstado * mult),
    criarItem('3.6.6', 'Rejuntamento', 'm²', areaTotal + (qtdBanheiros * 12) + 8, PRECOS_MAO_OBRA_CASA.rejunte * fatorEstado),
  ]);

  // 3.7-3.9 INSTALAÇÕES
  const instalacoes = criarSecao('3.7-3.9', 'INSTALAÇÕES (HIDRÁULICA, SANITÁRIA E ELÉTRICA)', [
    criarItem('3.7', 'Instalação hidráulica', 'm²', areaTotal, PRECOS_MAO_OBRA_CASA.instalacaoHidraulicaPorM2 * fatorEstado * mult),
    criarItem('3.8', 'Instalação sanitária', 'm²', areaTotal, PRECOS_MAO_OBRA_CASA.instalacaoSanitariaPorM2 * fatorEstado),
    criarItem('3.9', 'Instalação elétrica', 'm²', areaTotal, PRECOS_MAO_OBRA_CASA.instalacaoEletricaPorM2 * fatorEstado * mult),
  ]);

  // 3.10 PINTURA
  const pintura = criarSecao('3.10', 'PINTURA', [
    criarItem('3.10.1', 'Aplicação massa corrida', 'm²', areaPintura, PRECOS_MAO_OBRA_CASA.massaCorrePVA * fatorEstado),
    criarItem('3.10.2', 'Lixamento', 'm²', areaPintura, PRECOS_MAO_OBRA_CASA.lixamento * fatorEstado),
    criarItem('3.10.3', 'Pintura látex PVA', 'm²', areaParedes * 0.6 + areaTotal, PRECOS_MAO_OBRA_CASA.pinturaLatexPVA * fatorEstado * mult),
    criarItem('3.10.4', 'Pintura acrílica', 'm²', areaParedes * 0.4, PRECOS_MAO_OBRA_CASA.pinturaAcrilica * fatorEstado * mult),
  ]);

  // Calcular subtotal e BDI
  const subtotal =
    movimentoTerra.subtotal +
    baldrameAlvenaria.subtotal +
    fundacoesEstruturas.subtotal +
    esquadriasFerragens.subtotal +
    cobertura.subtotal +
    revestimentos.subtotal +
    instalacoes.subtotal +
    pintura.subtotal;

  const bdiPercentual = 15; // 15% conforme planilha
  const bdi = subtotal * (bdiPercentual / 100);
  const totalGeral = subtotal + bdi;

  return {
    movimentoTerra,
    baldrameAlvenaria,
    fundacoesEstruturas,
    esquadriasFerragens,
    cobertura,
    revestimentos,
    instalacoes,
    pintura,
    subtotal: Math.round(subtotal * 100) / 100,
    bdi: Math.round(bdi * 100) / 100,
    bdiPercentual,
    totalGeral: Math.round(totalGeral * 100) / 100,
  };
}
