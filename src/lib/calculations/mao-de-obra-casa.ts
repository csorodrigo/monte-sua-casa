// Mão de Obra detalhada da Casa - Baseado na planilha Excel "monte-sua-casa-simulacao.xlsx"
// Aba: MÃO DE OBRA - CASA (laranja)
// Fórmula de ajuste: PreçoBase × (CUB_Estado / CUB_Base)
// CORREÇÕES APLICADAS conforme planilha de referência (casa 96,6 m²)

import { Estado, PadraoAcabamento } from '@/types';
import { ItemOrcamentoDetalhado, SecaoOrcamentoDetalhado, SubSecaoRevestimentos } from './orcamento-detalhado-casa';
import { PRECOS_MAO_OBRA_CASA, BDI_PERCENTUAL } from '@/lib/prices/mao-obra-casa';
import { getCUBBase } from '@/lib/configuracoes';

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
  incluirChurrasqueira: boolean;
  temPortaDecorativa?: boolean; // Novo parâmetro opcional
}

export interface MaoObraCasaDetalhada {
  movimentoTerra: SecaoOrcamentoDetalhado;
  baldrameAlvenaria: SecaoOrcamentoDetalhado;
  fundacoesEstruturas: SecaoOrcamentoDetalhado;
  esquadriasFerragens: SecaoOrcamentoDetalhado;
  cobertura: SecaoOrcamentoDetalhado;
  revestimentos: SecaoOrcamentoDetalhado;
  revestimentosDetalhado: SubSecaoRevestimentos;
  instalacaoHidraulica: SecaoOrcamentoDetalhado;
  instalacaoSanitaria: SecaoOrcamentoDetalhado;
  instalacaoEletrica: SecaoOrcamentoDetalhado;
  gasGlp: SecaoOrcamentoDetalhado;
  pintura: SecaoOrcamentoDetalhado;
  churrasqueira: SecaoOrcamentoDetalhado;
  limpezaObra: SecaoOrcamentoDetalhado;
  // Mantendo "instalacoes" para compatibilidade com UI existente
  instalacoes: SecaoOrcamentoDetalhado;
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
 * Estrutura alinhada com planilha Excel - Seções 3.1 a 3.13
 * BDI: 14.40% conforme planilha
 *
 * Parâmetros de referência (casa 96,6 m²):
 * - Área: 96,6 m²
 * - Perímetro: 44,2 m
 * - Área paredes: 163,76 m²
 * - Quartos: 4, Banheiros: 3, Portas: 9, Pilares: 10
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
    incluirChurrasqueira,
    temPortaDecorativa = false,
  } = params;

  // Fator de ajuste pelo estado baseado no CUB
  // Fórmula do Excel: CUB_Estado / CUB_Base (SP)
  const cubBase = getCUBBase();
  const cubEstado = estado.cub || estado.custoMaoObraPorM2 / 0.48; // Fallback para compatibilidade
  const fatorEstado = cubEstado / cubBase;
  const mult = padraoAcabamento.multiplicadorPreco;
  const P = PRECOS_MAO_OBRA_CASA;

  // Cálculos base derivados
  const qtdPortasInternas = qtdQuartos + qtdBanheiros + 2; // Ex: 4+3+2 = 9

  // =============================================
  // 3.1 MOVIMENTO DE TERRA
  // Fórmulas conforme planilha Excel de referência
  // Total esperado (ref): R$ 898,80
  // =============================================
  const volumeEscavacaoBaldrame = perimetroExterno * 0.4 * 0.4; // perímetro × 0.4 × 0.4
  const volumeEscavacaoFundacao = qtdPilares * 0.6 * 0.6 * 0.6; // qtdPilares × 0.6³
  // CORREÇÃO 3.1.3: Reterro = escavação fundação × 0.5 (não baldrame × 0.3)
  const volumeReterro = volumeEscavacaoFundacao * 0.5;
  const volumeEspalhamento = areaTotal * 0.15; // área × 0.15 (em m³)
  const areaApiloamento = perimetroExterno * 0.08; // perímetro × 0.08

  const movimentoTerra = criarSecao('3.1', 'MOVIMENTO DE TERRA', [
    criarItem('3.1.1', 'Escavação manual de valas - baldrames', 'm³', volumeEscavacaoBaldrame, P.movimentoTerra.escavacaoValasBaldrame * fatorEstado),
    criarItem('3.1.2', 'Escavação manual de fundação', 'm³', volumeEscavacaoFundacao, P.movimentoTerra.escavacaoFundacao60x60 * fatorEstado),
    criarItem('3.1.3', 'Reterro manual com compactação', 'm³', volumeReterro, P.movimentoTerra.reterroCompactacao * fatorEstado),
    criarItem('3.1.4', 'Espalhamento e adensamento de base', 'm³', volumeEspalhamento, P.movimentoTerra.espalhamentoBase * fatorEstado),
    criarItem('3.1.5', 'Apiloamento de fundo de vala', 'm²', areaApiloamento, P.movimentoTerra.apiloamentoFundoVala * fatorEstado),
  ]);

  // =============================================
  // 3.2 BALDRAME E ALVENARIA DE ELEVAÇÃO
  // Fórmulas conforme planilha Excel de referência
  // Total esperado (ref): R$ 11.132,67
  // =============================================
  // CORREÇÃO 3.2.1: Ajustado coeficiente de 0.68 para 0.7 para dar 9.19 m³
  const volumeAlvenariaPedra = perimetroExterno * 0.3 * 0.7;
  // NOVO 3.2.2: Cinta em concreto armado
  const volumeCintaConcreto = perimetroExterno * 0.1 * 0.15 * 2.5;
  const areaImpermeabilizacao = perimetroExterno * 1.0; // perímetro × 1.0

  const baldrameAlvenaria = criarSecao('3.2', 'BALDRAME E ALVENARIA DE ELEVAÇÃO', [
    criarItem('3.2.1', 'Alvenaria de pedra argamassada', 'm³', volumeAlvenariaPedra, P.baldrameAlvenaria.alvenariaPedraArgamassada * fatorEstado),
    criarItem('3.2.2', 'Cinta em concreto armado', 'm³', volumeCintaConcreto, P.baldrameAlvenaria.cintaConcretoArmado * fatorEstado),
    criarItem('3.2.3', 'Impermeabilização de Baldrame', 'm²', areaImpermeabilizacao, P.baldrameAlvenaria.impermeabilizacaoBaldrame * fatorEstado),
    criarItem('3.2.4', 'Alvenaria em tijolo furado', 'm²', areaParedes, P.baldrameAlvenaria.alvenariaTijoloFurado * fatorEstado),
  ]);

  // =============================================
  // 3.3 FUNDAÇÕES E ESTRUTURAS
  // Total esperado (ref): R$ 7.932,23
  // =============================================
  // CORREÇÃO: Fórmulas ajustadas para bater com planilha
  // volumeConcreto = pilares + vigas + laje
  const volumeConcretoTotal = (qtdPilares * 0.15 * 0.15 * 2.8) + (perimetroExterno * 0.12 * 0.3) + (areaTotal * 0.08);
  const areaForma = (qtdPilares * 0.15 * 4 * 2.8) + (perimetroExterno * 0.3 * 2) + (areaTotal * 0.3);
  // pesoFerro ≈ 4.7 kg/m² de área
  const pesoFerro = (qtdPilares * 25) + (perimetroExterno * 3) + (areaTotal * 4.0);

  const fundacoesEstruturas = criarSecao('3.3', 'FUNDAÇÕES E ESTRUTURAS', [
    criarItem('3.3.1', 'Concreto em pilares, vigas e escada', 'm³', volumeConcretoTotal, P.fundacoesEstruturas.concretoPilaresVigas * fatorEstado),
    criarItem('3.3.2', 'Forma e desforma', 'm²', areaForma, P.fundacoesEstruturas.formaDesforma * fatorEstado),
    criarItem('3.3.3', 'Armadura CA 50', 'kg', pesoFerro, P.fundacoesEstruturas.armaduraCA50 * fatorEstado),
    criarItem('3.3.4', 'Lançamento e aplicação do concreto', 'm³', volumeConcretoTotal, P.fundacoesEstruturas.lancamentoConcreto * fatorEstado),
    criarItem('3.3.5', 'Lajes pré-fabricadas', 'm²', areaTotal, P.fundacoesEstruturas.lajePrefabricada * fatorEstado),
  ]);

  // =============================================
  // 3.4 ESQUADRIAS E FERRAGENS
  // Total esperado (ref): R$ 1.200,18
  // =============================================
  // Área janelas para esquadria de alumínio
  const areaJanelas = (qtdQuartos + qtdBanheiros + 2) * 1.5; // média de 1.5 m² por ambiente

  const esquadriasFerragens = criarSecao('3.4', 'ESQUADRIAS E FERRAGENS', [
    // CORREÇÃO 3.4.1: Porta entrada só se temPortaDecorativa
    criarItem('3.4.1', 'Instalação porta entrada decorativa', 'unid', temPortaDecorativa ? 1 : 0, P.esquadriasFerragens.portaEntradaDecorativa * fatorEstado),
    criarItem('3.4.2', 'Instalação portas internas', 'unid', qtdPortasInternas, P.esquadriasFerragens.portaMadeiraLei * fatorEstado),
    // NOVO 3.4.3: Esquadria de alumínio
    criarItem('3.4.3', 'Esquadria de alumínio e vidro', 'm²', areaJanelas, P.esquadriasFerragens.esquadriaAluminio * fatorEstado),
    criarItem('3.4.4', 'Instalação cobogó', 'unid', 3, P.esquadriasFerragens.cobogoAntiChuva * fatorEstado),
  ]);

  // =============================================
  // 3.5 COBERTURA
  // Total esperado (ref): R$ 5.796,76
  // =============================================
  // CORREÇÃO: Remover multiplicador 1.1
  const cobertura = criarSecao('3.5', 'COBERTURA', [
    criarItem('3.5.1', 'Cobertura completa (estrutura + telhas)', 'm²', areaTelhado, P.cobertura.cobertaPadrao * fatorEstado),
  ]);

  // =============================================
  // 3.6 REVESTIMENTOS (com sub-seções)
  // Total esperado (ref): R$ 31.182,31
  // =============================================
  // CORREÇÃO: Área cerâmica nas paredes = banheiros × 20 + cozinha (22)
  const areaCeramicaParede = (qtdBanheiros * 20) + 22;

  // 3.6.1 PAREDE (R$ 15.796,38 esperado)
  // CORREÇÃO: Chapisco = paredes × 2 (ambos lados)
  const areaChapisco = areaParedes * 2;
  // NOVO: Reboco = paredes × 1.5
  const areaReboco = areaParedes * 1.5;

  const revestimentosParede = criarSecao('3.6.1', 'PAREDE', [
    criarItem('3.6.1.1', 'Chapisco', 'm²', areaChapisco, P.revestimentos.parede.chapiscoCimentoAreia * fatorEstado),
    // NOVO 3.6.1.2: Reboco
    criarItem('3.6.1.2', 'Reboco cimento e areia', 'm²', areaReboco, P.revestimentos.parede.rebocoCimentoAreia * fatorEstado),
    criarItem('3.6.1.3', 'Emboço', 'm²', areaCeramicaParede, P.revestimentos.parede.embocoCimentoAreia * fatorEstado),
    criarItem('3.6.1.4', 'Assentamento cerâmica parede', 'm²', areaCeramicaParede, P.revestimentos.parede.revestimentoCeramico * fatorEstado * mult),
    criarItem('3.6.1.5', 'Rejuntamento', 'm²', areaCeramicaParede, P.revestimentos.parede.rejuntamentoPorcelanato * fatorEstado),
  ]);

  // 3.6.2 TETO (R$ 4.144,90 esperado)
  const revestimentosTeto = criarSecao('3.6.2', 'TETO', [
    criarItem('3.6.2.1', 'Forro de gesso', 'm²', areaTotal, P.revestimentos.teto.gessoConvencionalForro * fatorEstado * mult),
  ]);

  // 3.6.3 PISOS (R$ 11.241,04 esperado)
  // CORREÇÃO 3.6.3.1: Lastro é em m³, não m²
  const volumeLastro = areaTotal * 0.05;
  // NOVO 3.6.3.5: Soleiras
  const metrosSoleiras = qtdPortasInternas * 0.9;

  const revestimentosPisos = criarSecao('3.6.3', 'PISOS', [
    criarItem('3.6.3.1', 'Contrapiso/lastro', 'm³', volumeLastro, P.revestimentos.pisos.concretoNaoEstruturalLastro * fatorEstado),
    criarItem('3.6.3.2', 'Regularização', 'm²', areaTotal, P.revestimentos.pisos.regularizacaoBase * fatorEstado),
    criarItem('3.6.3.3', 'Assentamento cerâmica piso', 'm²', areaTotal, P.revestimentos.pisos.revestimentoCeramico * fatorEstado * mult),
    criarItem('3.6.3.4', 'Rejuntamento piso', 'm²', areaTotal, P.revestimentos.pisos.rejuntamentoPorcelanato * fatorEstado),
    // NOVO 3.6.3.5: Soleiras de granito
    criarItem('3.6.3.5', 'Soleiras de granito', 'm', metrosSoleiras, P.revestimentos.pisos.soleirasGranito * fatorEstado),
  ]);

  const revestimentosDetalhado: SubSecaoRevestimentos = {
    parede: revestimentosParede,
    teto: revestimentosTeto,
    pisos: revestimentosPisos,
    subtotal: revestimentosParede.subtotal + revestimentosTeto.subtotal + revestimentosPisos.subtotal,
  };

  // Seção consolidada para compatibilidade
  const revestimentos = criarSecao('3.6', 'REVESTIMENTOS', [
    ...revestimentosParede.itens,
    ...revestimentosTeto.itens,
    ...revestimentosPisos.itens,
  ]);

  // =============================================
  // 3.7 INSTALAÇÃO HIDRÁULICA
  // Total esperado (ref): R$ 3.254,08
  // CORREÇÃO COMPLETA: Fórmulas baseadas em banheiros
  // =============================================
  const metrosTubo50Hidr = qtdBanheiros * 3;  // 3 × 3 = 9
  const metrosTubo32 = qtdBanheiros * 12;     // 3 × 12 = 36
  const metrosTubo25 = qtdBanheiros * 18;     // 3 × 18 = 54

  const instalacaoHidraulica = criarSecao('3.7', 'INSTALAÇÃO HIDRÁULICA', [
    criarItem('3.7.1', 'Tubo PVC soldável 50mm', 'm', metrosTubo50Hidr, P.instalacaoHidraulica.tuboPVC50mm * fatorEstado),
    criarItem('3.7.2', 'Tubo PVC soldável 32mm', 'm', metrosTubo32, P.instalacaoHidraulica.tuboPVC32mm * fatorEstado),
    criarItem('3.7.3', 'Tubo PVC soldável 25mm', 'm', metrosTubo25, P.instalacaoHidraulica.tuboPVC25mm * fatorEstado),
    criarItem('3.7.4', 'Instalação caixa d\'água 1500L', 'unid', 1, P.instalacaoHidraulica.caixaDagua1500L * fatorEstado),
    // NOVOS itens separados
    criarItem('3.7.5', 'Flange 2"', 'unid', 2, P.instalacaoHidraulica.flange2pol * fatorEstado),
    criarItem('3.7.6', 'Flange 1"', 'unid', 1, P.instalacaoHidraulica.flange1pol * fatorEstado),
    criarItem('3.7.7', 'Registro gaveta 2"', 'unid', qtdBanheiros, P.instalacaoHidraulica.registroGaveta2pol * fatorEstado),
    criarItem('3.7.8', 'Registro canopla 1/2"', 'unid', qtdBanheiros * 2, P.instalacaoHidraulica.registroGavetaCanopla * fatorEstado),
    criarItem('3.7.9', 'Registro pressão chuveiro', 'unid', qtdBanheiros, P.instalacaoHidraulica.registroPressaoChuveiro * fatorEstado),
    criarItem('3.7.10', 'Boia mecânica 3/4"', 'unid', 1, P.instalacaoHidraulica.boiaMecanica * fatorEstado),
    criarItem('3.7.11', 'Torneira jardim', 'unid', 2, P.instalacaoHidraulica.torneiraJardim * fatorEstado),
    criarItem('3.7.12', 'Bancada de granito lavatório', 'cj', qtdBanheiros, P.instalacaoHidraulica.bancadaGranitoLavatorio * fatorEstado * mult),
    criarItem('3.7.13', 'Bacia sanitária', 'unid', qtdBanheiros, P.instalacaoHidraulica.baciaSanitaria * fatorEstado),
    criarItem('3.7.14', 'Chuveiro articulado', 'unid', qtdBanheiros, P.instalacaoHidraulica.chuveiroArticulado * fatorEstado),
    criarItem('3.7.15', 'Bancada cozinha', 'cj', 2, P.instalacaoHidraulica.bancadaGranitoCozinha * fatorEstado * mult),
    criarItem('3.7.17', 'Tanque', 'cj', 1, P.instalacaoHidraulica.tanqueInox * fatorEstado),
    // NOVO 3.7.18: Ducha higiênica
    criarItem('3.7.18', 'Ducha higiênica', 'unid', qtdBanheiros, P.instalacaoHidraulica.duchaHigienica * fatorEstado),
  ]);

  // =============================================
  // 3.8 INSTALAÇÃO SANITÁRIA
  // Total esperado (ref): R$ 4.018,64
  // CORREÇÃO: Fórmulas baseadas em banheiros
  // =============================================
  const metrosTubo100 = qtdBanheiros * 2;   // 3 × 2 = 6
  const metrosTubo75 = qtdBanheiros * 12;   // 3 × 12 = 36
  const metrosTubo50San = qtdBanheiros * 18; // 3 × 18 = 54
  const qtdRalos = qtdBanheiros * 2;        // 3 × 2 = 6

  const instalacaoSanitaria = criarSecao('3.8', 'INSTALAÇÃO SANITÁRIA', [
    criarItem('3.8.1', 'Caixas de inspeção', 'unid', 4, P.instalacaoSanitaria.caixaInspecao60x60 * fatorEstado),
    // NOVO 3.8.2: Tubo 100mm
    criarItem('3.8.2', 'Tubo esgoto 100mm', 'm', metrosTubo100, P.instalacaoSanitaria.tuboPVCEsgoto100mm * fatorEstado),
    criarItem('3.8.3', 'Tubo esgoto 75mm', 'm', metrosTubo75, P.instalacaoSanitaria.tuboPVCEsgoto75mm * fatorEstado),
    criarItem('3.8.5', 'Tubo esgoto 50mm', 'm', metrosTubo50San, P.instalacaoSanitaria.tuboPVCEsgoto50mm * fatorEstado),
    criarItem('3.8.6', 'Instalação ralos sifonados', 'unid', qtdRalos, P.instalacaoSanitaria.raloSifonado * fatorEstado),
  ]);

  // =============================================
  // 3.9 INSTALAÇÃO ELÉTRICA
  // Total esperado (ref): R$ 10.231,21
  // CORREÇÃO COMPLETA: Fórmulas conforme planilha
  // =============================================
  // Estimativa do comprimento da casa (proporção 6:16.1 ≈ 0.37)
  const comprimentoCasa = Math.sqrt(areaTotal / 0.37);
  const metrosEletrodutoRigido = comprimentoCasa; // ≈ 16
  const metrosEletrodutoFlex = areaTotal * 2.5; // 96.6 × 2.5 = 241.5
  const metrosCabo1_5mm = metrosEletrodutoFlex; // 241.5
  const metrosCabo2_5mm = metrosEletrodutoFlex * 2; // 483
  const metrosCabo4mm = metrosEletrodutoFlex * 0.5; // 120.75
  const metrosCabo10mm = 18; // fixo
  const qtdTomadas = Math.ceil(areaTotal * 0.5); // 96.6 × 0.5 = 48
  const qtdCaixas4x2 = qtdTomadas + 8 + (qtdQuartos + qtdBanheiros + 2); // tomadas + interruptores
  const qtdInterruptoresTriplo = 8; // fixo
  const qtdInterruptoresDuplo = qtdQuartos + qtdBanheiros + 2; // 4+3+2 = 9
  const qtdLuminarias = (qtdQuartos + qtdBanheiros + 5) * 3; // para dar ~33

  const instalacaoEletrica = criarSecao('3.9', 'INSTALAÇÃO ELÉTRICA', [
    criarItem('3.9.1', 'Quadro de distribuição', 'unid', 1, P.instalacaoEletrica.quadroDistribuicao12 * fatorEstado),
    criarItem('3.9.2', 'Eletroduto rígido 32mm', 'm', metrosEletrodutoRigido, P.instalacaoEletrica.eletrodutoRigido32mm * fatorEstado),
    criarItem('3.9.3', 'Eletroduto flexível', 'm', metrosEletrodutoFlex, P.instalacaoEletrica.eletrodutoFlexivel * fatorEstado),
    criarItem('3.9.4', 'Caixas 4x4', 'unid', 5, P.instalacaoEletrica.caixaLigacaoPVC4x4 * fatorEstado),
    // NOVO 3.9.5: Caixas 4x2
    criarItem('3.9.5', 'Caixas 4x2', 'unid', qtdCaixas4x2, P.instalacaoEletrica.caixaLigacaoPVC4x2 * fatorEstado),
    criarItem('3.9.6', 'Cabo 1,5mm', 'm', metrosCabo1_5mm, P.instalacaoEletrica.caboIsoladoPVC1_5mm * fatorEstado),
    criarItem('3.9.7', 'Cabo 2,5mm', 'm', metrosCabo2_5mm, P.instalacaoEletrica.caboIsoladoPVC2_5mm * fatorEstado),
    criarItem('3.9.8', 'Cabo 4mm', 'm', metrosCabo4mm, P.instalacaoEletrica.caboIsoladoPVC4mm * fatorEstado),
    criarItem('3.9.9', 'Cabo 10mm', 'm', metrosCabo10mm, P.instalacaoEletrica.caboIsoladoPVC10mm * fatorEstado),
    // CORREÇÃO: Disjuntores separados por amperagem
    criarItem('3.9.10', 'Disjuntor 15A', 'unid', 6, P.instalacaoEletrica.disjuntor15A * fatorEstado),
    criarItem('3.9.11', 'Disjuntor 20A', 'unid', 6, P.instalacaoEletrica.disjuntor20A * fatorEstado),
    criarItem('3.9.12', 'Disjuntor 32A', 'unid', 4, P.instalacaoEletrica.disjuntor32A * fatorEstado),
    criarItem('3.9.13', 'Disjuntor 50A', 'unid', 2, P.instalacaoEletrica.disjuntor50A * fatorEstado),
    // NOVO 3.9.14: Haste de cobre
    criarItem('3.9.14', 'Haste de cobre', 'unid', 3, P.instalacaoEletrica.hasteCobre * fatorEstado),
    // CORREÇÃO: Interruptores separados
    criarItem('3.9.15', 'Interruptor triplo', 'unid', qtdInterruptoresTriplo, P.instalacaoEletrica.interruptorTriplo * fatorEstado),
    criarItem('3.9.16', 'Interruptor duplo', 'unid', qtdInterruptoresDuplo, P.instalacaoEletrica.interruptorDuplo * fatorEstado),
    // NOVO 3.9.18: Interruptor campainha
    criarItem('3.9.18', 'Interruptor campainha', 'unid', 1, P.instalacaoEletrica.interruptorCampainha * fatorEstado),
    criarItem('3.9.19', 'Tomadas', 'unid', qtdTomadas, P.instalacaoEletrica.tomadaTripla * fatorEstado),
    criarItem('3.9.20', 'Pontos de lógica', 'pt', 2, P.instalacaoEletrica.pontoLogica * fatorEstado),
    // CORREÇÃO: Pontos TV = quartos + 1
    criarItem('3.9.21', 'Pontos de TV', 'pt', qtdQuartos + 1, P.instalacaoEletrica.pontoTV * fatorEstado),
    criarItem('3.9.22', 'Luminárias LED', 'unid', qtdLuminarias, P.instalacaoEletrica.luminariaLED * fatorEstado * mult),
  ]);

  // =============================================
  // 3.10 INSTALAÇÕES DO GÁS GLP E CONDICIONADORES
  // Total esperado (ref): R$ 1.320,10
  // =============================================
  // CORREÇÃO: Tubo gás = banheiros × 4
  const metrosTuboGas = qtdBanheiros * 4; // 3 × 4 = 12

  const gasGlp = criarSecao('3.10', 'INSTALAÇÕES DO GÁS GLP E CONDICIONADORES', [
    criarItem('3.10.1', 'Tubulação de cobre 15mm', 'm', metrosTuboGas, P.gasGlp.tuboCobre15mm * fatorEstado),
    criarItem('3.10.2', 'Teste de estanqueidade', 'vb', 1, P.gasGlp.testeEstanqueidade * fatorEstado),
  ]);

  // =============================================
  // 3.11 PINTURA
  // Total esperado (ref): R$ 6.889,06
  // =============================================
  // CORREÇÃO: Textura externa = paredes × 0.95 (descontando aberturas)
  const areaPinturaExterna = areaParedes * 0.95;
  // Emassamento/latex interno = paredes × 0.55 + teto
  const areaPinturaInterna = (areaParedes * 0.55) + areaTotal;
  // CORREÇÃO: Área madeira = portas × 4.1 m² por porta
  const areaMadeira = qtdPortasInternas * 4.1;

  const pintura = criarSecao('3.11', 'PINTURA', [
    criarItem('3.11.2', 'Textura externa', 'm²', areaPinturaExterna, P.pintura.texturaExterna * fatorEstado * mult),
    criarItem('3.11.4', 'Emassamento', 'm²', areaPinturaInterna, P.pintura.emassamento * fatorEstado),
    criarItem('3.11.5', 'Latex interno', 'm²', areaPinturaInterna, P.pintura.pinturaLatexPVA * fatorEstado * mult),
    criarItem('3.11.6', 'Selador em madeira', 'm²', areaMadeira, P.pintura.seladorMadeira * fatorEstado),
    criarItem('3.11.7', 'Esmalte sintético', 'm²', areaMadeira, P.pintura.esmalteSintetico * fatorEstado * mult),
  ]);

  // =============================================
  // 3.12 CHURRASQUEIRA (condicional)
  // Total esperado (ref): R$ 2.100,01
  // =============================================
  const churrasqueira = criarSecao('3.12', 'CHURRASQUEIRA',
    incluirChurrasqueira ? [
      criarItem('3.12.1', 'Construção churrasqueira', 'unid', 1, P.churrasqueira.churrasqueiraMediaPorte * fatorEstado),
    ] : []
  );

  // =============================================
  // 3.13 LIMPEZA DA OBRA
  // Total esperado (ref): R$ 2.632,17
  // Limpeza geral é VERBA ÚNICA (1 vb), não por m²!
  // =============================================
  const volumeEntulho = areaTotal * 0.2; // área × 0.2 conforme planilha

  const limpezaObra = criarSecao('3.13', 'LIMPEZA DA OBRA', [
    criarItem('3.13.2', 'Transporte horizontal', 'm³', volumeEntulho, P.limpezaObra.transporteHorizontal * fatorEstado),
    criarItem('3.13.3', 'Limpeza geral', 'vb', 1, P.limpezaObra.limpezaGeral * fatorEstado),
  ]);

  // =============================================
  // Seção "instalacoes" consolidada para compatibilidade com UI
  // =============================================
  const instalacoes = criarSecao('3.7-3.10', 'INSTALAÇÕES (HIDRÁULICA, SANITÁRIA, ELÉTRICA E GÁS)', [
    ...instalacaoHidraulica.itens,
    ...instalacaoSanitaria.itens,
    ...instalacaoEletrica.itens,
    ...gasGlp.itens,
  ]);

  // =============================================
  // TOTAIS COM BDI
  // =============================================
  const subtotal =
    movimentoTerra.subtotal +
    baldrameAlvenaria.subtotal +
    fundacoesEstruturas.subtotal +
    esquadriasFerragens.subtotal +
    cobertura.subtotal +
    revestimentos.subtotal +
    instalacaoHidraulica.subtotal +
    instalacaoSanitaria.subtotal +
    instalacaoEletrica.subtotal +
    gasGlp.subtotal +
    pintura.subtotal +
    churrasqueira.subtotal +
    limpezaObra.subtotal;

  const bdi = subtotal * (BDI_PERCENTUAL / 100);
  const totalGeral = subtotal + bdi;

  return {
    movimentoTerra,
    baldrameAlvenaria,
    fundacoesEstruturas,
    esquadriasFerragens,
    cobertura,
    revestimentos,
    revestimentosDetalhado,
    instalacaoHidraulica,
    instalacaoSanitaria,
    instalacaoEletrica,
    gasGlp,
    pintura,
    churrasqueira,
    limpezaObra,
    instalacoes,
    subtotal: Math.round(subtotal * 100) / 100,
    bdi: Math.round(bdi * 100) / 100,
    bdiPercentual: BDI_PERCENTUAL,
    totalGeral: Math.round(totalGeral * 100) / 100,
  };
}
