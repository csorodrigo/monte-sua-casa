// Precos de mao de obra da Casa - Extraido automaticamente do Excel
// Data de geracao: 2026-01-29 08:40:26
// Fonte: monte-sua-casa-simulacao.xlsx - Aba "MAO DE OBRA - CASA"
//
// IMPORTANTE: Este arquivo e gerado automaticamente pelo script extract-excel.py
// Nao edite manualmente. Para atualizar, modifique o Excel e execute o script.

import { PrecosMaoObra } from './types';

/**
 * BDI (Beneficios e Despesas Indiretas) percentual
 * Conforme planilha: 14.40%
 */
export const BDI_PERCENTUAL = 14.4;

/**
 * Precos de mao de obra da casa
 */
export const PRECOS_MAO_OBRA_CASA: PrecosMaoObra = {
  movimentoTerra: {
    escavacaoValasBaldrame: 37.5,
    escavacaoFundacao60x60: 37.5,
    reterroCompactacao: 25.45,
    espalhamentoBase: 23.9,
    apiloamentoFundoVala: 27.5,
  },
  baldrameAlvenaria: {
    alvenariaPedraArgamassada: 311.5,
    impermeabilizacaoBaldrame: 8.8,
    alvenariaTijoloFurado: 41.5,
  },
  fundacoesEstruturas: {
    concretoPilaresVigas: 205.5,
    formaDesforma: 11.2,
    armaduraCA50: 4.1,
    lancamentoConcreto: 159.08,
    lajePrefabricada: 14.91,
  },
  esquadriasFerragens: {
    portaEntradaDecorativa: 550.0,
    portaMadeiraLei: 130.0,
    cobogoAntiChuva: 10.0,
  },
  cobertura: {
    cobertaPadrao: 60.0,
  },
  revestimentos: {
    parede: {
      chapiscoCimentoAreia: 5.58,
      embocoCimentoAreia: 15.9,
      revestimentoCeramico: 80.0,
      rejuntamentoPorcelanato: 8.8,
    },
    teto: {
      gessoConvencionalForro: 42.9,
    },
    pisos: {
      concretoNaoEstruturalLastro: 205.5,
      regularizacaoBase: 14.5,
      revestimentoCeramico: 80.0,
      rejuntamentoPorcelanato: 8.8,
    },
  },
  instalacaoHidraulica: {
    tuboPVC50mm: 22.59,
    tuboPVC32mm: 15.93,
    tuboPVC25mm: 14.56,
    caixaDagua1500L: 220.0,
    flange2pol: 30.0,
    flange1pol: 30.0,
    registroGaveta: 30.0,
    registroGavetaCanopla: 30.0,
    registroPressaoChuveiro: 30.0,
    boiaMecanica: 30.0,
    bancadaGranitoLavatorio: 110.0,
    baciaSanitaria: 60.0,
    chuveiroArticulado: 10.0,
    bancadaGranitoCozinha: 110.0,
    tanqueInox: 110.0,
    duchaHigienica: 20.0,
  },
  instalacaoSanitaria: {
    caixaInspecao60x60: 255.5,
    tuboPVCEsgoto75mm: 26.5,
    tuboPVCEsgoto50mm: 29.9,
    raloSifonado: 40.0,
  },
  instalacaoEletrica: {
    quadroDistribuicao12: 90.0,
    eletrodutoRigido32mm: 14.89,
    eletrodutoFlexivel: 13.45,
    caixaLigacaoPVC4x4: 4.5,
    caboIsoladoPVC1_5mm: 3.0,
    caboIsoladoPVC2_5mm: 4.5,
    caboIsoladoPVC4mm: 4.5,
    caboIsoladoPVC10mm: 5.0,
    disjuntor15A: 20.0,
    disjuntor20A: 20.0,
    disjuntor32A: 20.0,
    disjuntor50A: 20.0,
    hasteCobre: 30.0,
    interruptorTriplo: 12.0,
    interruptorDuplo: 12.0,
    interruptorCampainha: 12.0,
    tomadaTripla: 12.0,
    pontoLogica: 80.0,
    pontoTV: 80.0,
    luminariaLED: 30.0,
  },
  gasGlp: {
    tuboCobre15mm: 35.0,
    testeEstanqueidade: 1200.0,
  },
  pintura: {
    texturaExterna: 15.5,
    emassamento: 10.0,
    pinturaLatexPVA: 10.0,
    seladorMadeira: 10.0,
    esmalteSintetico: 10.0,
  },
  churrasqueira: {
    churrasqueiraMediaPorte: 2100.0,
  },
  limpezaObra: {
    transporteHorizontal: 56.6,
    limpezaGeral: 1500.0,
  },
};

// Exporta tipos
export * from './types';
