// Preços de materiais da Casa - Carregados do configuracoes.json
// Fórmula aplicada: PreçoBase × (1 + FatorINCC)
//
// IMPORTANTE: Os preços base vêm do configuracoes.json
// O fator INCC (0.79%) é aplicado automaticamente pela função aplicarAjuste

import { getPrecosBaseMateriais, getFatorINCC } from '@/lib/configuracoes';
import { PrecosMateriais } from './types';

const precosBase = getPrecosBaseMateriais();
const INCC = getFatorINCC();

// Função para aplicar INCC ao preço
function comINCC(preco: number): number {
  return preco * (1 + INCC);
}

/**
 * Preços de materiais da casa com INCC aplicado
 * Fórmula do Excel: PreçoBase × (1 + 0.0079)
 */
export const PRECOS_MATERIAIS_CASA: PrecosMateriais = {
  movimentoTerra: {
    escavacaoValasBaldrame: comINCC(precosBase.movimentoTerra.escavacaoValas),
    escavacaoFundacao60x60: comINCC(precosBase.movimentoTerra.escavacaoFundacao),
    reterroCompactacao: comINCC(precosBase.movimentoTerra.reterroCompactacao),
    espalhamentoBase: comINCC(precosBase.movimentoTerra.espalhamentoBase),
    apiloamentoFundoVala: comINCC(precosBase.movimentoTerra.apiloamentoFundo),
  },
  baldrameAlvenaria: {
    alvenariaPedraArgamassada: comINCC(precosBase.baldrame.alvenariaPedra),
    cintaConcretoArmado: comINCC(precosBase.baldrame.cintaConcreto),
    impermeabilizacaoBaldrame: comINCC(precosBase.baldrame.impermeabilizacao),
    alvenariaTijoloFurado: 62.98, // Preço base tijolo cerâmico do configuracoes
  },
  fundacoesEstruturas: {
    concretoPilaresVigas: comINCC(precosBase.estrutura.concretoPilaresVigas),
    formaDesforma: comINCC(precosBase.estrutura.formaDesforma),
    armaduraCA50: comINCC(precosBase.estrutura.armaduraCA50),
    lancamentoConcreto: comINCC(precosBase.estrutura.lancamentoConcreto),
    lajePrefabricada: comINCC(precosBase.estrutura.lajePrefabricada),
  },
  esquadriasFerragens: {
    portaEntradaDecorativa: comINCC(precosBase.esquadrias.portaEntradaBase),
    portaMadeiraLei: comINCC(precosBase.esquadrias.portaMadeiraLei),
    janelaAluminio: 530.00, // Preço da janela alumínio e vidro do configuracoes
    cobogoAntiChuva: comINCC(precosBase.esquadrias.cobogoAntiChuva),
  },
  cobertura: {
    // Usa preço do tipo de telhado selecionado (será sobrescrito no cálculo)
    cobertaPadrao: 175.00,
  },
  revestimentos: {
    parede: {
      chapiscoCimentoAreia: comINCC(precosBase.revestimentos.chapisco),
      rebocoCimentoAreia: comINCC(precosBase.revestimentos.reboco),
      embocoCimentoAreia: comINCC(precosBase.revestimentos.emboco),
      revestimentoCeramico: 95.00, // Preço médio padrão
      rejuntamentoPorcelanato: comINCC(precosBase.revestimentos.rejuntamento),
      bancadaCozinhaPorcelanato: comINCC(precosBase.revestimentos.bancadaCozinha),
    },
    teto: {
      gessoConvencionalForro: comINCC(precosBase.revestimentos.gessoForro),
    },
    pisos: {
      concretoNaoEstruturalLastro: comINCC(precosBase.revestimentos.concretoLastro),
      regularizacaoBase: comINCC(precosBase.revestimentos.regularizacaoBase),
      revestimentoCeramico: 90.00, // Preço médio padrão
      rejuntamentoPorcelanato: comINCC(precosBase.revestimentos.rejuntamento),
      soleirasGranito: comINCC(precosBase.revestimentos.soleirasGranito),
    },
  },
  instalacaoHidraulica: {
    tuboPVC50mm: comINCC(precosBase.hidraulica.tuboPVC50mm),
    tuboPVC32mm: comINCC(precosBase.hidraulica.tuboPVC32mm),
    tuboPVC25mm: comINCC(precosBase.hidraulica.tuboPVC25mm),
    caixaDagua1500L: comINCC(precosBase.hidraulica.caixaDagua1500L),
    flange2pol: comINCC(precosBase.hidraulica.flange2pol),
    flange1pol: comINCC(precosBase.hidraulica.flange1pol),
    registroGaveta: comINCC(precosBase.hidraulica.registroGaveta2pol),
    registroGavetaCanopla: comINCC(precosBase.hidraulica.registroGavetaCanopla),
    registroPressaoChuveiro: comINCC(precosBase.hidraulica.registroPressaoChuveiro),
    boiaMecanica: comINCC(precosBase.hidraulica.boiaMecanica),
    torneiraMetal: comINCC(precosBase.hidraulica.torneiraJardim),
    bancadaGranitoLavatorio: comINCC(precosBase.hidraulica.bancadaGranitoLavatorio),
    baciaSanitaria: comINCC(precosBase.hidraulica.baciaSanitaria),
    chuveiroArticulado: comINCC(precosBase.hidraulica.chuveiroArticulado),
    bancadaGranitoCozinha: comINCC(precosBase.hidraulica.bancadaGranitoCozinha),
    tanqueInox: comINCC(precosBase.hidraulica.tanqueInox),
  },
  instalacaoSanitaria: {
    caixaInspecao60x60: comINCC(precosBase.sanitaria.caixaInspecao60x60),
    tuboPVCEsgoto100mm: comINCC(precosBase.sanitaria.tuboPVC100mm),
    tuboPVCEsgoto75mm: comINCC(precosBase.sanitaria.tuboPVC75mm),
    tuboPVCEsgoto50mm: comINCC(precosBase.sanitaria.tuboPVC50mm),
    raloSifonado: comINCC(precosBase.sanitaria.raloSifonado),
  },
  instalacaoEletrica: {
    quadroDistribuicao12: comINCC(precosBase.eletrica.quadroDistribuicao12),
    eletrodutoRigido32mm: comINCC(precosBase.eletrica.eletrodutoRigido32mm),
    eletrodutoFlexivel: comINCC(precosBase.eletrica.eletrodutoFlexivel),
    caixaLigacaoPVC4x4: comINCC(precosBase.eletrica.caixaPVC4x4),
    caixaLigacaoPVC4x2: comINCC(precosBase.eletrica.caixaPVC4x2),
    caboIsoladoPVC1_5mm: comINCC(precosBase.eletrica.caboPVC1_5mm),
    caboIsoladoPVC2_5mm: comINCC(precosBase.eletrica.caboPVC2_5mm),
    caboIsoladoPVC4mm: comINCC(precosBase.eletrica.caboPVC4mm),
    caboIsoladoPVC10mm: comINCC(precosBase.eletrica.caboPVC10mm),
    disjuntor15A: comINCC(precosBase.eletrica.disjuntor15A),
    disjuntor20A: comINCC(precosBase.eletrica.disjuntor20A),
    disjuntor32A: comINCC(precosBase.eletrica.disjuntor32A),
    disjuntor50A: comINCC(precosBase.eletrica.disjuntor50A),
    hasteCobre: comINCC(precosBase.eletrica.hasteCobre),
    interruptorTriplo: comINCC(precosBase.eletrica.interruptorTriplo),
    interruptorDuplo: comINCC(precosBase.eletrica.interruptorDuplo),
    interruptorCampainha: comINCC(precosBase.eletrica.interruptorCampainha),
    tomadaTripla: comINCC(precosBase.eletrica.tomadaTripla),
    pontoLogica: comINCC(precosBase.eletrica.pontoLogica),
    pontoTV: comINCC(precosBase.eletrica.pontoTV),
    luminariaLED: comINCC(precosBase.eletrica.luminariaLED),
  },
  gasGlp: {
    tuboCobre15mm: comINCC(precosBase.gasGLP.tuboCobre15mm),
    testeEstanqueidade: comINCC(precosBase.gasGLP.testeEstanqueidadeGrande),
  },
  pintura: {
    texturaExterna: comINCC(precosBase.pintura.texturaExterna),
    emassamento: comINCC(precosBase.pintura.emassamento),
    pinturaLatexPVA: comINCC(precosBase.pintura.latexInterno),
    seladorMadeira: comINCC(precosBase.pintura.seladorMadeira),
    esmalteSintetico: comINCC(precosBase.pintura.esmalteSintetico),
  },
  churrasqueira: {
    churrasqueiraMediaPorte: comINCC(precosBase.churrasqueira.churrasqueiraMediaPorte),
  },
  limpezaObra: {
    containers: comINCC(precosBase.limpeza.containers),
    transporteHorizontal: comINCC(precosBase.limpeza.transporteHorizontal),
    limpezaGeral: comINCC(precosBase.limpeza.limpezaGeral),
  },
};

// Exporta tipos
export * from './types';
