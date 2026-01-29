// Precos de materiais da Casa - Extraido automaticamente do Excel
// Data de geracao: 2026-01-29 08:40:26
// Fonte: monte-sua-casa-simulacao.xlsx - Aba "ORCAMENTO - CASA"
//
// IMPORTANTE: Este arquivo e gerado automaticamente pelo script extract-excel.py
// Nao edite manualmente. Para atualizar, modifique o Excel e execute o script.

import { PrecosMateriais } from './types';

/**
 * Precos base de materiais da casa (sem ajuste)
 * O fator de ajuste (0.79%) deve ser aplicado ao usar estes precos
 */
export const PRECOS_MATERIAIS_CASA: PrecosMateriais = {
  movimentoTerra: {
    escavacaoValasBaldrame: 37.5079,
    escavacaoFundacao60x60: 37.5079,
    reterroCompactacao: 25.4579,
    espalhamentoBase: 23.9079,
    apiloamentoFundoVala: 27.5079,
  },
  baldrameAlvenaria: {
    alvenariaPedraArgamassada: 543.9179,
    cintaConcretoArmado: 1250.5079,
    impermeabilizacaoBaldrame: 19.9079,
    alvenariaTijoloFurado: 62.9879,
  },
  fundacoesEstruturas: {
    concretoPilaresVigas: 595.5079,
    formaDesforma: 159.0879,
    armaduraCA50: 16.9079,
    lancamentoConcreto: 159.0879,
    lajePrefabricada: 130.0179,
  },
  esquadriasFerragens: {
    portaEntradaDecorativa: 1500.0079,
    portaMadeiraLei: 1094.6579,
    janelaAluminio: 530.0079,
    cobogoAntiChuva: 20.0079,
  },
  cobertura: {
    cobertaPadrao: 175.0079,
  },
  revestimentos: {
    parede: {
      chapiscoCimentoAreia: 7.9779,
      rebocoCimentoAreia: 38.9079,
      embocoCimentoAreia: 34.7579,
      revestimentoCeramico: 95.0079,
      rejuntamentoPorcelanato: 10.0079,
      bancadaCozinhaPorcelanato: 800.0079,
    },
    teto: {
      gessoConvencionalForro: 59.9079,
    },
    pisos: {
      concretoNaoEstruturalLastro: 299.0079,
      regularizacaoBase: 21.9079,
      revestimentoCeramico: 90.0079,
      rejuntamentoPorcelanato: 10.0079,
      soleirasGranito: 150.0079,
    },
  },
  instalacaoHidraulica: {
    tuboPVC50mm: 39.9079,
    tuboPVC32mm: 28.9079,
    tuboPVC25mm: 24.0379,
    caixaDagua1500L: 1350.0079,
    flange2pol: 100.0079,
    flange1pol: 85.0079,
    registroGaveta: 167.2679,
    registroGavetaCanopla: 100.6479,
    registroPressaoChuveiro: 105.5379,
    boiaMecanica: 55.8979,
    torneiraMetal: 57.6079,
    bancadaGranitoLavatorio: 1300.0079,
    baciaSanitaria: 661.6779,
    chuveiroArticulado: 195.0079,
    bancadaGranitoCozinha: 1500.0079,
    tanqueInox: 744.5079,
  },
  instalacaoSanitaria: {
    caixaInspecao60x60: 399.0079,
    tuboPVCEsgoto100mm: 52.1479,
    tuboPVCEsgoto75mm: 42.3779,
    tuboPVCEsgoto50mm: 29.9079,
    raloSifonado: 75.0079,
  },
  instalacaoEletrica: {
    quadroDistribuicao12: 415.0079,
    eletrodutoRigido32mm: 27.6279,
    eletrodutoFlexivel: 26.4079,
    caixaLigacaoPVC4x4: 11.1879,
    caixaLigacaoPVC4x2: 8.8579,
    caboIsoladoPVC1_5mm: 3.9979,
    caboIsoladoPVC2_5mm: 7.1779,
    caboIsoladoPVC4mm: 7.9979,
    caboIsoladoPVC10mm: 15.8079,
    disjuntor15A: 75.0079,
    disjuntor20A: 75.0079,
    disjuntor32A: 75.0079,
    disjuntor50A: 75.0079,
    hasteCobre: 180.0079,
    interruptorTriplo: 48.0079,
    interruptorDuplo: 31.2379,
    interruptorCampainha: 25.6779,
    tomadaTripla: 35.7879,
    pontoLogica: 215.5079,
    pontoTV: 215.5079,
    luminariaLED: 105.5079,
  },
  gasGlp: {
    tuboCobre15mm: 180.0079,
    testeEstanqueidade: 900.0079,
  },
  pintura: {
    texturaExterna: 27.6079,
    emassamento: 15.5579,
    pinturaLatexPVA: 18.8079,
    seladorMadeira: 15.7579,
    esmalteSintetico: 17.6779,
  },
  churrasqueira: {
    churrasqueiraMediaPorte: 3650.0079,
  },
  limpezaObra: {
    containers: 360.0079,
    transporteHorizontal: 56.6079,
    limpezaGeral: 14.5079,
  },
};

// Exporta tipos
export * from './types';
