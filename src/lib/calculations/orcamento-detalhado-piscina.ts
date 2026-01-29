// Orçamento detalhado da Piscina - Baseado na planilha original
// Fórmulas do Excel: Preços × (1 + INCC) para materiais
// Mão de obra: PreçoBase × (CUB_Estado / CUB_Base)

import { ConfiguracaoPiscina, Estado } from '@/types';
import { ItemOrcamentoDetalhado, SecaoOrcamentoDetalhado } from './orcamento-detalhado-casa';
import { getFatorINCC, getCUBBase, BDI } from '@/lib/configuracoes';

// Aplica INCC aos preços de materiais
const INCC = getFatorINCC();

function comINCC(preco: number): number {
  return preco * (1 + INCC);
}

export const PRECOS_PISCINA = {
  // Materiais - com INCC aplicado
  escavacaoManual: comINCC(37.50),             // m³
  reaterroCompactacao: comINCC(25.45),         // m³
  transporteHorizontal: comINCC(56.60),        // m³
  lastroConcreto10cm: comINCC(299.00),         // m³ (com tela metálica)
  fundacaoPilares: comINCC(595.50),            // m³
  concretoPilaresFck20: comINCC(595.50),       // m³
  concretoVigasFck20: comINCC(595.50),         // m³
  formaDesfomaMadeira: comINCC(159.08),        // m²
  armaduraCA50: comINCC(16.90),                // kg
  lancamentoConcreto: comINCC(159.08),         // m³
  alvenariaTijoloFurado: comINCC(62.98),       // m²
  regularizacaoSuperficies: comINCC(21.90),    // m²
  imprimacaoFrioAsfalto: comINCC(20.55),       // m²
  mantaAsfaltica3mm: comINCC(115.67),          // m²
  protecaoMecanicaManta: comINCC(28.50),       // m²
  argamassaImpermeabilizante: comINCC(35.50),  // m²
  ceramicaAzulPiscina: comINCC(125.00),        // m²
  rejunteEpoxi: comINCC(45.00),                // m²
  bordaPiscina: comINCC(85.00),                // m
  sistemaFiltragem: comINCC(2500.00),          // cj
  bombaRecirculacao: comINCC(1800.00),         // unid
  iluminacaoSubaquatica: comINCC(450.00),      // unid
  cascata: comINCC(1200.00),                   // unid
};

export const PRECOS_MAO_OBRA_PISCINA = {
  escavacaoManual: 37.51,
  reaterroCompactacao: 25.46,
  transporteHorizontal: 56.61,
  lastroConcreto10cm: 205.51,
  fundacaoPilares: 205.51,
  concretoPilaresFck20: 205.51,
  concretoVigasFck20: 205.51,
  formaDesfomaMadeira: 11.21,
  armaduraCA50: 4.11,
  lancamentoConcreto: 159.09,
  alvenariaTijoloFurado: 41.51,
  regularizacaoSuperficies: 14.51,
  imprimacaoFrioAsfalto: 10.00,
  mantaAsfaltica3mm: 26.88,
  protecaoMecanicaManta: 18.51,
  argamassaImpermeabilizante: 25.51,
  ceramicaAzulPiscina: 65.01,
  rejunteEpoxi: 25.01,
  bordaPiscina: 45.01,
  instalacaoSistemaFiltragem: 500.00,
  instalacaoBomba: 350.00,
  instalacaoIluminacao: 150.00,
};

export interface OrcamentoPiscinaDetalhado {
  estrutura: SecaoOrcamentoDetalhado;
  impermeabilizacao: SecaoOrcamentoDetalhado;
  revestimento: SecaoOrcamentoDetalhado;
  equipamentos: SecaoOrcamentoDetalhado;
  subtotal: number;
  totalGeral: number;
}

export interface MaoObraPiscinaDetalhada {
  estrutura: SecaoOrcamentoDetalhado;
  impermeabilizacao: SecaoOrcamentoDetalhado;
  revestimento: SecaoOrcamentoDetalhado;
  equipamentos: SecaoOrcamentoDetalhado;
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
 * Calcula o orçamento detalhado de materiais da piscina
 */
export function calcularOrcamentoPiscinaDetalhado(piscina: ConfiguracaoPiscina): OrcamentoPiscinaDetalhado {
  if (!piscina.incluir) {
    const secaoVazia = { codigo: '', nome: '', itens: [], subtotal: 0 };
    return {
      estrutura: secaoVazia,
      impermeabilizacao: secaoVazia,
      revestimento: secaoVazia,
      equipamentos: secaoVazia,
      subtotal: 0,
      totalGeral: 0,
    };
  }

  const volume = piscina.largura * piscina.comprimento * piscina.profundidade;
  const areaFundo = piscina.largura * piscina.comprimento;
  const areaParedes = 2 * (piscina.largura + piscina.comprimento) * piscina.profundidade;
  const areaTotal = areaFundo + areaParedes;
  const perimetro = 2 * (piscina.largura + piscina.comprimento);

  // Volumes de escavação (com folga de 0.5m em cada lado)
  const volumeEscavacao = (piscina.largura + 1) * (piscina.comprimento + 1) * (piscina.profundidade + 0.3);
  const volumeReaterro = volumeEscavacao * 0.15;
  const volumeTransporte = volumeEscavacao - volume;

  // 1.0 ESTRUTURA
  const volumeLastro = areaFundo * 0.1;
  const qtdPilaresPiscina = Math.ceil(perimetro / 2);
  const volumeFundacaoPilares = qtdPilaresPiscina * 0.3 * 0.3 * 0.4;
  const volumeConcretoPilares = qtdPilaresPiscina * 0.15 * 0.15 * piscina.profundidade;
  const volumeConcretoVigas = perimetro * 0.15 * 0.2;
  const areaForma = (qtdPilaresPiscina * 0.15 * 4 * piscina.profundidade) + (perimetro * 0.2 * 2);
  const pesoFerro = (qtdPilaresPiscina * 12) + (perimetro * 3) + (areaFundo * 3);
  const areaAlvenaria = areaParedes;

  const estrutura = criarSecao('1.0', 'PISCINA - ESTRUTURA', [
    criarItem('1.1', 'Escavação manual para piscina', 'm³', volumeEscavacao, PRECOS_PISCINA.escavacaoManual),
    criarItem('1.2', 'Reaterro com compactação', 'm³', volumeReaterro, PRECOS_PISCINA.reaterroCompactacao),
    criarItem('1.3', 'Transporte Horizontal até 30m de material à granel', 'm³', volumeTransporte, PRECOS_PISCINA.transporteHorizontal),
    criarItem('1.4', 'Lastro de concreto e=10cm com tela metálica', 'm³', volumeLastro, PRECOS_PISCINA.lastroConcreto10cm),
    criarItem('1.5', 'Fundação dos pilares', 'm³', volumeFundacaoPilares, PRECOS_PISCINA.fundacaoPilares),
    criarItem('1.6', 'Concreto em pilares, Fck 20 MPA', 'm³', volumeConcretoPilares, PRECOS_PISCINA.concretoPilaresFck20),
    criarItem('1.7', 'Concreto em viga, Fck 20 MPA', 'm³', volumeConcretoVigas, PRECOS_PISCINA.concretoVigasFck20),
    criarItem('1.8', 'Forma e desforma em madeira compensada', 'm²', areaForma, PRECOS_PISCINA.formaDesfomaMadeira),
    criarItem('1.9', 'Armadura CA50 média', 'kg', pesoFerro, PRECOS_PISCINA.armaduraCA50),
    criarItem('1.10', 'Lançamento e aplicação do concreto', 'm³', volumeConcretoPilares + volumeConcretoVigas, PRECOS_PISCINA.lancamentoConcreto),
    criarItem('1.11', 'Alvenaria em tijolo furado,esp 10cm, traço 1:2:8', 'm²', areaAlvenaria, PRECOS_PISCINA.alvenariaTijoloFurado),
    criarItem('1.12', 'Regularização de superfícies horizontais e verticais', 'm²', areaTotal, PRECOS_PISCINA.regularizacaoSuperficies),
  ]);

  // 2.0 IMPERMEABILIZAÇÃO
  const impermeabilizacao = criarSecao('2.0', 'IMPERMEABILIZAÇÃO', [
    criarItem('2.1', 'Imprimação com frio asfalto', 'm²', areaTotal, PRECOS_PISCINA.imprimacaoFrioAsfalto),
    criarItem('2.2', 'Manta asfáltica 3mm aluminizada', 'm²', areaTotal, PRECOS_PISCINA.mantaAsfaltica3mm),
    criarItem('2.3', 'Proteção mecânica da manta', 'm²', areaTotal, PRECOS_PISCINA.protecaoMecanicaManta),
    criarItem('2.4', 'Argamassa impermeabilizante', 'm²', areaTotal, PRECOS_PISCINA.argamassaImpermeabilizante),
  ]);

  // 3.0 REVESTIMENTO
  const revestimento = criarSecao('3.0', 'REVESTIMENTO', [
    criarItem('3.1', 'Cerâmica azul piscina', 'm²', areaTotal, PRECOS_PISCINA.ceramicaAzulPiscina),
    criarItem('3.2', 'Rejunte epóxi', 'm²', areaTotal, PRECOS_PISCINA.rejunteEpoxi),
    criarItem('3.3', 'Borda da piscina (pedra natural/cerâmica)', 'm', perimetro, PRECOS_PISCINA.bordaPiscina),
  ]);

  // 4.0 EQUIPAMENTOS
  const qtdIluminacao = Math.ceil(volume / 15);
  const equipamentos = criarSecao('4.0', 'EQUIPAMENTOS', [
    criarItem('4.1', 'Sistema de filtragem completo', 'cj', 1, PRECOS_PISCINA.sistemaFiltragem),
    criarItem('4.2', 'Bomba de recirculação', 'unid', 1, PRECOS_PISCINA.bombaRecirculacao),
    criarItem('4.3', 'Iluminação subaquática LED', 'unid', qtdIluminacao, PRECOS_PISCINA.iluminacaoSubaquatica),
    criarItem('4.4', 'Cascata decorativa', 'unid', volume > 30 ? 1 : 0, PRECOS_PISCINA.cascata),
  ]);

  const subtotal =
    estrutura.subtotal +
    impermeabilizacao.subtotal +
    revestimento.subtotal +
    equipamentos.subtotal;

  return {
    estrutura,
    impermeabilizacao,
    revestimento,
    equipamentos,
    subtotal: Math.round(subtotal * 100) / 100,
    totalGeral: Math.round(subtotal * 100) / 100,
  };
}

/**
 * Calcula a mão de obra detalhada da piscina
 */
export function calcularMaoObraPiscinaDetalhada(piscina: ConfiguracaoPiscina, estado: Estado): MaoObraPiscinaDetalhada {
  if (!piscina.incluir) {
    const secaoVazia = { codigo: '', nome: '', itens: [], subtotal: 0 };
    return {
      estrutura: secaoVazia,
      impermeabilizacao: secaoVazia,
      revestimento: secaoVazia,
      equipamentos: secaoVazia,
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

  const volume = piscina.largura * piscina.comprimento * piscina.profundidade;
  const areaFundo = piscina.largura * piscina.comprimento;
  const areaParedes = 2 * (piscina.largura + piscina.comprimento) * piscina.profundidade;
  const areaTotal = areaFundo + areaParedes;
  const perimetro = 2 * (piscina.largura + piscina.comprimento);

  const volumeEscavacao = (piscina.largura + 1) * (piscina.comprimento + 1) * (piscina.profundidade + 0.3);
  const volumeReaterro = volumeEscavacao * 0.15;
  const volumeLastro = areaFundo * 0.1;
  const qtdPilaresPiscina = Math.ceil(perimetro / 2);
  const volumeFundacaoPilares = qtdPilaresPiscina * 0.3 * 0.3 * 0.4;
  const volumeConcretoPilares = qtdPilaresPiscina * 0.15 * 0.15 * piscina.profundidade;
  const volumeConcretoVigas = perimetro * 0.15 * 0.2;
  const areaForma = (qtdPilaresPiscina * 0.15 * 4 * piscina.profundidade) + (perimetro * 0.2 * 2);
  const pesoFerro = (qtdPilaresPiscina * 12) + (perimetro * 3) + (areaFundo * 3);

  // 1.0 ESTRUTURA
  const estrutura = criarSecao('1.0', 'PISCINA - ESTRUTURA', [
    criarItem('1.1', 'Escavação manual para piscina', 'm³', volumeEscavacao, PRECOS_MAO_OBRA_PISCINA.escavacaoManual * fatorEstado),
    criarItem('1.2', 'Reaterro com compactação', 'm³', volumeReaterro, PRECOS_MAO_OBRA_PISCINA.reaterroCompactacao * fatorEstado),
    criarItem('1.4', 'Lastro de concreto', 'm³', volumeLastro, PRECOS_MAO_OBRA_PISCINA.lastroConcreto10cm * fatorEstado),
    criarItem('1.5', 'Fundação dos pilares', 'm³', volumeFundacaoPilares, PRECOS_MAO_OBRA_PISCINA.fundacaoPilares * fatorEstado),
    criarItem('1.6', 'Concreto em pilares', 'm³', volumeConcretoPilares, PRECOS_MAO_OBRA_PISCINA.concretoPilaresFck20 * fatorEstado),
    criarItem('1.7', 'Concreto em viga', 'm³', volumeConcretoVigas, PRECOS_MAO_OBRA_PISCINA.concretoVigasFck20 * fatorEstado),
    criarItem('1.8', 'Forma e desforma', 'm²', areaForma, PRECOS_MAO_OBRA_PISCINA.formaDesfomaMadeira * fatorEstado),
    criarItem('1.9', 'Armadura CA50', 'kg', pesoFerro, PRECOS_MAO_OBRA_PISCINA.armaduraCA50 * fatorEstado),
    criarItem('1.11', 'Alvenaria', 'm²', areaParedes, PRECOS_MAO_OBRA_PISCINA.alvenariaTijoloFurado * fatorEstado),
    criarItem('1.12', 'Regularização', 'm²', areaTotal, PRECOS_MAO_OBRA_PISCINA.regularizacaoSuperficies * fatorEstado),
  ]);

  // 2.0 IMPERMEABILIZAÇÃO
  const impermeabilizacao = criarSecao('2.0', 'IMPERMEABILIZAÇÃO', [
    criarItem('2.1', 'Imprimação com frio asfalto', 'm²', areaTotal, PRECOS_MAO_OBRA_PISCINA.imprimacaoFrioAsfalto * fatorEstado),
    criarItem('2.2', 'Manta asfáltica', 'm²', areaTotal, PRECOS_MAO_OBRA_PISCINA.mantaAsfaltica3mm * fatorEstado),
    criarItem('2.3', 'Proteção mecânica', 'm²', areaTotal, PRECOS_MAO_OBRA_PISCINA.protecaoMecanicaManta * fatorEstado),
    criarItem('2.4', 'Argamassa impermeabilizante', 'm²', areaTotal, PRECOS_MAO_OBRA_PISCINA.argamassaImpermeabilizante * fatorEstado),
  ]);

  // 3.0 REVESTIMENTO
  const revestimento = criarSecao('3.0', 'REVESTIMENTO', [
    criarItem('3.1', 'Assentamento cerâmica', 'm²', areaTotal, PRECOS_MAO_OBRA_PISCINA.ceramicaAzulPiscina * fatorEstado),
    criarItem('3.2', 'Rejuntamento epóxi', 'm²', areaTotal, PRECOS_MAO_OBRA_PISCINA.rejunteEpoxi * fatorEstado),
    criarItem('3.3', 'Instalação borda', 'm', perimetro, PRECOS_MAO_OBRA_PISCINA.bordaPiscina * fatorEstado),
  ]);

  // 4.0 EQUIPAMENTOS
  const qtdIluminacao = Math.ceil(volume / 15);
  const equipamentos = criarSecao('4.0', 'EQUIPAMENTOS', [
    criarItem('4.1', 'Instalação sistema filtragem', 'cj', 1, PRECOS_MAO_OBRA_PISCINA.instalacaoSistemaFiltragem * fatorEstado),
    criarItem('4.2', 'Instalação bomba', 'unid', 1, PRECOS_MAO_OBRA_PISCINA.instalacaoBomba * fatorEstado),
    criarItem('4.3', 'Instalação iluminação', 'unid', qtdIluminacao, PRECOS_MAO_OBRA_PISCINA.instalacaoIluminacao * fatorEstado),
  ]);

  const subtotal =
    estrutura.subtotal +
    impermeabilizacao.subtotal +
    revestimento.subtotal +
    equipamentos.subtotal;

  // BDI para piscina: 15% conforme planilha
  const bdiPercentual = BDI.PISCINA;
  const bdi = subtotal * (bdiPercentual / 100);
  const totalGeral = subtotal + bdi;

  return {
    estrutura,
    impermeabilizacao,
    revestimento,
    equipamentos,
    subtotal: Math.round(subtotal * 100) / 100,
    bdi: Math.round(bdi * 100) / 100,
    bdiPercentual,
    totalGeral: Math.round(totalGeral * 100) / 100,
  };
}
