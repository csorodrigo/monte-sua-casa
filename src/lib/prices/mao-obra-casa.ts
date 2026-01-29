// Preços de mão de obra da Casa - Carregados do configuracoes.json
// Os preços base são multiplicados pelo fator do estado (CUB)
//
// IMPORTANTE: Os preços base vêm do configuracoes.json (precosBaseMaoObra)

import { getPrecosBaseMaoObra, BDI } from '@/lib/configuracoes';
import { PrecosMaoObra } from './types';

const precosBase = getPrecosBaseMaoObra();

/**
 * BDI (Benefícios e Despesas Indiretas) percentual para Casa
 * Conforme planilha: 14.40%
 */
export const BDI_PERCENTUAL = BDI.CASA;

/**
 * Preços base de mão de obra da casa
 * Estes preços serão multiplicados pelo fator do estado nos cálculos
 */
export const PRECOS_MAO_OBRA_CASA: PrecosMaoObra = {
  movimentoTerra: {
    escavacaoValasBaldrame: precosBase.movimentoTerra.escavacaoValas,
    escavacaoFundacao60x60: precosBase.movimentoTerra.escavacaoFundacao,
    reterroCompactacao: precosBase.movimentoTerra.reterroCompactacao,
    espalhamentoBase: precosBase.movimentoTerra.espalhamentoBase,
    apiloamentoFundoVala: precosBase.movimentoTerra.apiloamentoFundo,
  },
  baldrameAlvenaria: {
    alvenariaPedraArgamassada: precosBase.baldrame.alvenariaPedra,
    impermeabilizacaoBaldrame: precosBase.baldrame.impermeabilizacao,
    alvenariaTijoloFurado: precosBase.baldrame.alvenariaTijolo,
  },
  fundacoesEstruturas: {
    concretoPilaresVigas: precosBase.estrutura.concretoPilaresVigas,
    formaDesforma: precosBase.estrutura.formaDesforma,
    armaduraCA50: precosBase.estrutura.armaduraCA50,
    lancamentoConcreto: precosBase.estrutura.lancamentoConcreto,
    lajePrefabricada: precosBase.estrutura.lajePrefabricada,
  },
  esquadriasFerragens: {
    portaEntradaDecorativa: precosBase.esquadrias.portaEntrada,
    portaMadeiraLei: precosBase.esquadrias.portaMadeiraLei,
    cobogoAntiChuva: precosBase.esquadrias.cobogoAntiChuva,
  },
  cobertura: {
    // Usa preço do tipo de telhado selecionado
    cobertaPadrao: 60.0,
  },
  revestimentos: {
    parede: {
      chapiscoCimentoAreia: precosBase.revestimentos.chapisco,
      embocoCimentoAreia: precosBase.revestimentos.emboco,
      revestimentoCeramico: precosBase.revestimentos.ceramicaParede,
      rejuntamentoPorcelanato: precosBase.revestimentos.rejuntamento,
    },
    teto: {
      gessoConvencionalForro: precosBase.revestimentos.gessoForro,
    },
    pisos: {
      concretoNaoEstruturalLastro: precosBase.revestimentos.concretoLastro,
      regularizacaoBase: precosBase.revestimentos.regularizacaoBase,
      revestimentoCeramico: precosBase.revestimentos.ceramicaPiso,
      rejuntamentoPorcelanato: precosBase.revestimentos.rejuntamento,
    },
  },
  instalacaoHidraulica: {
    tuboPVC50mm: precosBase.hidraulica.tuboPVC50mm,
    tuboPVC32mm: precosBase.hidraulica.tuboPVC32mm,
    tuboPVC25mm: precosBase.hidraulica.tuboPVC25mm,
    caixaDagua1500L: precosBase.hidraulica.caixaDagua,
    flange2pol: precosBase.hidraulica.flange,
    flange1pol: precosBase.hidraulica.flange,
    registroGaveta: precosBase.hidraulica.registro,
    registroGavetaCanopla: precosBase.hidraulica.registro,
    registroPressaoChuveiro: precosBase.hidraulica.registro,
    boiaMecanica: precosBase.hidraulica.boiaMecanica,
    bancadaGranitoLavatorio: precosBase.hidraulica.bancadaGranito,
    baciaSanitaria: precosBase.hidraulica.baciaSanitaria,
    chuveiroArticulado: precosBase.hidraulica.chuveiro,
    bancadaGranitoCozinha: precosBase.hidraulica.bancadaGranito,
    tanqueInox: precosBase.hidraulica.tanqueInox,
    duchaHigienica: 20.0,
  },
  instalacaoSanitaria: {
    caixaInspecao60x60: precosBase.sanitaria.caixaInspecao,
    tuboPVCEsgoto75mm: precosBase.sanitaria.tuboPVC75mm,
    tuboPVCEsgoto50mm: precosBase.sanitaria.tuboPVC50mm,
    raloSifonado: precosBase.sanitaria.raloSifonado,
  },
  instalacaoEletrica: {
    quadroDistribuicao12: precosBase.eletrica.quadroDistribuicao,
    eletrodutoRigido32mm: precosBase.eletrica.eletrodutoRigido,
    eletrodutoFlexivel: precosBase.eletrica.eletrodutoFlexivel,
    caixaLigacaoPVC4x4: precosBase.eletrica.caixaPVC,
    caboIsoladoPVC1_5mm: precosBase.eletrica.caboPVC1_5mm,
    caboIsoladoPVC2_5mm: precosBase.eletrica.caboPVC2_5mm,
    caboIsoladoPVC4mm: precosBase.eletrica.caboPVC4mm,
    caboIsoladoPVC10mm: precosBase.eletrica.caboPVC10mm,
    disjuntor15A: precosBase.eletrica.disjuntor,
    disjuntor20A: precosBase.eletrica.disjuntor,
    disjuntor32A: precosBase.eletrica.disjuntor,
    disjuntor50A: precosBase.eletrica.disjuntor,
    hasteCobre: precosBase.eletrica.hasteCobre,
    interruptorTriplo: precosBase.eletrica.interruptor,
    interruptorDuplo: precosBase.eletrica.interruptor,
    interruptorCampainha: precosBase.eletrica.interruptor,
    tomadaTripla: precosBase.eletrica.tomada,
    pontoLogica: precosBase.eletrica.pontoLogica,
    pontoTV: precosBase.eletrica.pontoTV,
    luminariaLED: precosBase.eletrica.luminaria,
  },
  gasGlp: {
    tuboCobre15mm: precosBase.gasGLP.tuboCobre,
    testeEstanqueidade: precosBase.gasGLP.testeEstanqueidade,
  },
  pintura: {
    texturaExterna: precosBase.pintura.texturaExterna,
    emassamento: precosBase.pintura.emassamento,
    pinturaLatexPVA: precosBase.pintura.latexInterno,
    seladorMadeira: precosBase.pintura.seladorMadeira,
    esmalteSintetico: precosBase.pintura.esmalteSintetico,
  },
  churrasqueira: {
    churrasqueiraMediaPorte: precosBase.churrasqueira.churrasqueiraMediaPorte,
  },
  limpezaObra: {
    transporteHorizontal: precosBase.limpeza.transporteHorizontal,
    limpezaGeral: precosBase.limpeza.limpezaGeral,
  },
};

// Exporta tipos
export * from './types';
