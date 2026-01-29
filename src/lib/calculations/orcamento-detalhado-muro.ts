// Orçamento detalhado do Muro - Baseado na planilha original
// Fórmulas do Excel: Preços × (1 + INCC) para materiais
// Mão de obra: PreçoBase × (CUB_Estado / CUB_Base)

import { ConfiguracaoMuro, Estado } from '@/types';
import { ItemOrcamentoDetalhado, SecaoOrcamentoDetalhado } from './orcamento-detalhado-casa';
import { getFatorINCC, getCUBBase, BDI } from '@/lib/configuracoes';

// Preços base do muro (aplicar INCC nos materiais)
const INCC = getFatorINCC();

function comINCC(preco: number): number {
  return preco * (1 + INCC);
}

export const PRECOS_MURO = {
  // 1.0 SERVIÇOS PRELIMINARES
  raspacemLimpezaTerreno: comINCC(17.80),      // m²

  // 2.1 MOVIMENTO DE TERRA
  escavacaoValasBaldrame: comINCC(37.50),      // m³
  reterroCompactacao: comINCC(25.45),          // m³
  espalhamentoBase: comINCC(23.90),            // m³
  apiloamentoFundoVala: comINCC(27.50),        // m²

  // 2.2 BALDRAME E ALVENARIA DE ELEVAÇÃO
  baldrameTijoloFuradoDobrado: comINCC(543.91), // m³
  alvenariaTijoloFurado: comINCC(58.58),       // m² (h=2.00m, traço 1:2:8)
  cintaSuperiorConcretoArmado: comINCC(1250.50), // m³
  pilares10x15cm: comINCC(1250.50),            // m³ (a cada 2,5m)
  chapiscoTraco1_4: comINCC(7.34),             // m²
  rebocoTraco1_5: comINCC(35.80),              // m²

  // 2.3 PINTURA DO MURO
  texturaDuasDemaos: comINCC(25.40),           // m²

  // 2.4 PORTÕES
  portaoMetalon: comINCC(560.00),              // m²
  motorCremalheira6m: comINCC(800.00),         // unid
};

export interface OrcamentoMuroDetalhado {
  servicosPreliminares: SecaoOrcamentoDetalhado;
  movimentoTerra: SecaoOrcamentoDetalhado;
  baldrameAlvenaria: SecaoOrcamentoDetalhado;
  pinturaMuro: SecaoOrcamentoDetalhado;
  portoes: SecaoOrcamentoDetalhado;
  subtotal: number;
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

interface ParametrosMuro {
  muro: ConfiguracaoMuro;
  areaTerreno: number; // área total do terreno para raspagem
  incluirPortao: boolean;
  larguraPortao: number; // em metros
}

/**
 * Calcula o orçamento detalhado de materiais do muro
 */
export function calcularOrcamentoMuroDetalhado(params: ParametrosMuro): OrcamentoMuroDetalhado {
  const { muro, areaTerreno, incluirPortao, larguraPortao } = params;

  if (!muro.incluir) {
    const secaoVazia = { codigo: '', nome: '', itens: [], subtotal: 0 };
    return {
      servicosPreliminares: secaoVazia,
      movimentoTerra: secaoVazia,
      baldrameAlvenaria: secaoVazia,
      pinturaMuro: secaoVazia,
      portoes: secaoVazia,
      subtotal: 0,
      totalGeral: 0,
    };
  }

  const comprimentoTotal = muro.frente + muro.fundo + muro.direita + muro.esquerda;
  const areaMuro = comprimentoTotal * muro.altura;
  const qtdPilares = Math.ceil(comprimentoTotal / 2.5); // 1 pilar a cada 2.5m

  // 1.0 SERVIÇOS PRELIMINARES
  const servicosPreliminares = criarSecao('1.0', 'SERVIÇOS PRELIMINARES', [
    criarItem('1.1', 'Raspagem e limpeza do terreno + Leve Nivelamento', 'm²', areaTerreno, PRECOS_MURO.raspacemLimpezaTerreno),
  ]);

  // 2.1 MOVIMENTO DE TERRA
  const volumeEscavacaoBaldrame = comprimentoTotal * 0.4 * 0.4;
  const volumeReterro = comprimentoTotal * 0.15 * 0.15;
  const areaEspalhamento = comprimentoTotal * 0.6;
  const areaApiloamento = comprimentoTotal * 0.4;

  const movimentoTerra = criarSecao('2.1', 'MOVIMENTO DE TERRA', [
    criarItem('2.1.1', 'Escavação manual de valas - baldrames', 'm³', volumeEscavacaoBaldrame, PRECOS_MURO.escavacaoValasBaldrame),
    criarItem('2.1.2', 'Reterro manual com compactação', 'm³', volumeReterro, PRECOS_MURO.reterroCompactacao),
    criarItem('2.1.3', 'Espalhamento e adensamento de mat.de base, e=0,15m', 'm³', areaEspalhamento, PRECOS_MURO.espalhamentoBase),
    criarItem('2.1.4', 'Apiloamento de fundo de vala', 'm²', areaApiloamento, PRECOS_MURO.apiloamentoFundoVala),
  ]);

  // 2.2 BALDRAME E ALVENARIA DE ELEVAÇÃO
  const volumeBaldrame = comprimentoTotal * 0.3 * 0.2; // 30cm x 20cm
  const areaAlvenaria = areaMuro;
  const volumeCintaSuperior = comprimentoTotal * 0.1 * 0.1;
  const volumePilares = qtdPilares * 0.10 * 0.15 * muro.altura;
  const areaChapisco = areaMuro * 2; // dois lados
  const areaReboco = areaMuro * 2;

  const baldrameAlvenaria = criarSecao('2.2', 'BALDRAME E ALVENARIA DE ELEVAÇÃO', [
    criarItem('2.2.1', 'Baldrame em tijolo furado dobrado', 'm³', volumeBaldrame, PRECOS_MURO.baldrameTijoloFuradoDobrado),
    criarItem('2.2.2', 'Alvenaria em tijolo furado, h=2.00m, traço 1:2:8', 'm²', areaAlvenaria, PRECOS_MURO.alvenariaTijoloFurado),
    criarItem('2.2.3', 'Cinta superior em concreto armado - 10x10cm', 'm³', volumeCintaSuperior, PRECOS_MURO.cintaSuperiorConcretoArmado),
    criarItem('2.2.4', 'Pilares 10x15cm, a cada 2,5m', 'm³', volumePilares, PRECOS_MURO.pilares10x15cm),
    criarItem('2.2.5', 'Chapisco traço- 1:4 (cimento e areia s/penerar)', 'm²', areaChapisco, PRECOS_MURO.chapiscoTraco1_4),
    criarItem('2.2.6', 'Reboco traço 1:5 (cimento e areia s/ penerar)', 'm²', areaReboco, PRECOS_MURO.rebocoTraco1_5),
  ]);

  // 2.3 PINTURA DO MURO
  const pinturaMuro = criarSecao('2.3', 'PINTURA DO MURO', [
    criarItem('2.3.1', 'Textura duas demãos em paredes externas', 'm²', areaReboco, PRECOS_MURO.texturaDuasDemaos),
  ]);

  // 2.4 PORTÕES
  let portoes: SecaoOrcamentoDetalhado;
  if (incluirPortao && larguraPortao > 0) {
    const areaPortao = larguraPortao * 2.5; // altura padrão do portão
    portoes = criarSecao('2.4', 'PORTÕES', [
      criarItem('2.4.1', 'Portão em Metalon', 'm²', areaPortao, PRECOS_MURO.portaoMetalon),
      criarItem('2.4.2', 'Motor com cremalheira 6m', 'unid', 1, PRECOS_MURO.motorCremalheira6m),
    ]);
  } else {
    portoes = criarSecao('2.4', 'PORTÕES', []);
  }

  // Totais
  const subtotal =
    servicosPreliminares.subtotal +
    movimentoTerra.subtotal +
    baldrameAlvenaria.subtotal +
    pinturaMuro.subtotal +
    portoes.subtotal;

  return {
    servicosPreliminares,
    movimentoTerra,
    baldrameAlvenaria,
    pinturaMuro,
    portoes,
    subtotal: Math.round(subtotal * 100) / 100,
    totalGeral: Math.round(subtotal * 100) / 100,
  };
}

// Preços de mão de obra do muro
export const PRECOS_MAO_OBRA_MURO = {
  raspacemLimpezaTerreno: 17.80,
  escavacaoValasBaldrame: 37.51,
  reterroCompactacao: 25.46,
  espalhamentoBase: 23.91,
  apiloamentoFundoVala: 27.51,
  baldrameTijoloFuradoDobrado: 311.51,
  alvenariaTijoloFurado: 41.51,
  cintaSuperiorConcretoArmado: 635.45,
  pilares10x15cm: 205.51,
  chapiscoTraco1_4: 5.59,
  rebocoTraco1_5: 21.91,
  texturaDuasDemaos: 15.51,
};

export interface MaoObraMuroDetalhada {
  servicosPreliminares: SecaoOrcamentoDetalhado;
  movimentoTerra: SecaoOrcamentoDetalhado;
  baldrameAlvenaria: SecaoOrcamentoDetalhado;
  pinturaMuro: SecaoOrcamentoDetalhado;
  subtotal: number;
  bdi: number;
  bdiPercentual: number;
  totalGeral: number;
}

/**
 * Calcula a mão de obra detalhada do muro
 */
export function calcularMaoObraMuroDetalhada(params: ParametrosMuro, estado: Estado): MaoObraMuroDetalhada {
  const { muro, areaTerreno } = params;

  if (!muro.incluir) {
    const secaoVazia = { codigo: '', nome: '', itens: [], subtotal: 0 };
    return {
      servicosPreliminares: secaoVazia,
      movimentoTerra: secaoVazia,
      baldrameAlvenaria: secaoVazia,
      pinturaMuro: secaoVazia,
      subtotal: 0,
      bdi: 0,
      bdiPercentual: 15,
      totalGeral: 0,
    };
  }

  // Fator de ajuste pelo estado baseado no CUB
  // Fórmula do Excel: CUB_Estado / CUB_Base (SP)
  const cubBase = getCUBBase();
  const cubEstado = estado.cub || estado.custoMaoObraPorM2 / 0.48;
  const fatorEstado = cubEstado / cubBase;
  const comprimentoTotal = muro.frente + muro.fundo + muro.direita + muro.esquerda;
  const areaMuro = comprimentoTotal * muro.altura;
  const qtdPilares = Math.ceil(comprimentoTotal / 2.5);

  // 1.0 SERVIÇOS PRELIMINARES
  const servicosPreliminares = criarSecao('1.0', 'SERVIÇOS PRELIMINARES', [
    criarItem('1.1', 'Raspagem e limpeza do terreno', 'm²', areaTerreno, PRECOS_MAO_OBRA_MURO.raspacemLimpezaTerreno * fatorEstado),
  ]);

  // 2.1 MOVIMENTO DE TERRA
  const volumeEscavacaoBaldrame = comprimentoTotal * 0.4 * 0.4;
  const volumeReterro = comprimentoTotal * 0.15 * 0.15;
  const areaEspalhamento = comprimentoTotal * 0.6;
  const areaApiloamento = comprimentoTotal * 0.4;

  const movimentoTerra = criarSecao('2.1', 'MOVIMENTO DE TERRA', [
    criarItem('2.1.1', 'Escavação manual de valas - baldrames', 'm³', volumeEscavacaoBaldrame, PRECOS_MAO_OBRA_MURO.escavacaoValasBaldrame * fatorEstado),
    criarItem('2.1.2', 'Reterro manual com compactação', 'm³', volumeReterro, PRECOS_MAO_OBRA_MURO.reterroCompactacao * fatorEstado),
    criarItem('2.1.3', 'Espalhamento e adensamento de base', 'm³', areaEspalhamento, PRECOS_MAO_OBRA_MURO.espalhamentoBase * fatorEstado),
    criarItem('2.1.4', 'Apiloamento de fundo de vala', 'm²', areaApiloamento, PRECOS_MAO_OBRA_MURO.apiloamentoFundoVala * fatorEstado),
  ]);

  // 2.2 BALDRAME E ALVENARIA
  const volumeBaldrame = comprimentoTotal * 0.3 * 0.2;
  const volumeCintaSuperior = comprimentoTotal * 0.1 * 0.1;
  const volumePilares = qtdPilares * 0.10 * 0.15 * muro.altura;
  const areaChapisco = areaMuro * 2;
  const areaReboco = areaMuro * 2;

  const baldrameAlvenaria = criarSecao('2.2', 'BALDRAME E ALVENARIA DE ELEVAÇÃO', [
    criarItem('2.2.1', 'Baldrame em tijolo furado dobrado', 'm³', volumeBaldrame, PRECOS_MAO_OBRA_MURO.baldrameTijoloFuradoDobrado * fatorEstado),
    criarItem('2.2.2', 'Alvenaria em tijolo furado', 'm²', areaMuro, PRECOS_MAO_OBRA_MURO.alvenariaTijoloFurado * fatorEstado),
    criarItem('2.2.3', 'Cinta superior em concreto armado', 'm³', volumeCintaSuperior, PRECOS_MAO_OBRA_MURO.cintaSuperiorConcretoArmado * fatorEstado),
    criarItem('2.2.4', 'Pilares 10x15cm, a cada 2,5m', 'm³', volumePilares, PRECOS_MAO_OBRA_MURO.pilares10x15cm * fatorEstado),
    criarItem('2.2.5', 'Chapisco traço 1:4', 'm²', areaChapisco, PRECOS_MAO_OBRA_MURO.chapiscoTraco1_4 * fatorEstado),
    criarItem('2.2.6', 'Reboco traço 1:5', 'm²', areaReboco, PRECOS_MAO_OBRA_MURO.rebocoTraco1_5 * fatorEstado),
  ]);

  // 2.3 PINTURA
  const pinturaMuro = criarSecao('2.3', 'PINTURA DO MURO', [
    criarItem('2.3.1', 'Textura duas demãos', 'm²', areaReboco, PRECOS_MAO_OBRA_MURO.texturaDuasDemaos * fatorEstado),
  ]);

  // Totais com BDI
  const subtotal =
    servicosPreliminares.subtotal +
    movimentoTerra.subtotal +
    baldrameAlvenaria.subtotal +
    pinturaMuro.subtotal;

  // BDI para muro: 15% conforme planilha
  const bdiPercentual = BDI.MURO;
  const bdi = subtotal * (bdiPercentual / 100);
  const totalGeral = subtotal + bdi;

  return {
    servicosPreliminares,
    movimentoTerra,
    baldrameAlvenaria,
    pinturaMuro,
    subtotal: Math.round(subtotal * 100) / 100,
    bdi: Math.round(bdi * 100) / 100,
    bdiPercentual,
    totalGeral: Math.round(totalGeral * 100) / 100,
  };
}
