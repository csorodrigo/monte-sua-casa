// Orçamento detalhado da Casa - Baseado na planilha Excel "monte-sua-casa-simulacao.xlsx"
// Aba: ORÇAMENTO - CASA (verde)

import { TipoTelhado, TipoTijolo, PadraoAcabamento, ConfiguracaoReboco } from '@/types';
import { PRECOS_MATERIAIS_CASA } from '@/lib/prices/orcamento-casa';
import { FATOR_AJUSTE_MATERIAIS, aplicarAjuste } from '@/lib/prices/types';
import { ALVENARIA } from './constants';

// Interface para item detalhado
export interface ItemOrcamentoDetalhado {
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
}

export interface SecaoOrcamentoDetalhado {
  codigo: string;
  nome: string;
  itens: ItemOrcamentoDetalhado[];
  subtotal: number;
}

// Interface para sub-seções de Revestimentos
export interface SubSecaoRevestimentos {
  parede: SecaoOrcamentoDetalhado;
  teto: SecaoOrcamentoDetalhado;
  pisos: SecaoOrcamentoDetalhado;
  subtotal: number;
}

export interface OrcamentoCasaDetalhado {
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
  subtotal: number;
  totalGeral: number;
}

// Funções auxiliares
function criarItem(
  codigo: string,
  descricao: string,
  unidade: string,
  quantidade: number,
  precoBase: number,
  aplicarFatorAjuste: boolean = true
): ItemOrcamentoDetalhado {
  const precoUnitario = aplicarFatorAjuste ? aplicarAjuste(precoBase) : precoBase;
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

// Parâmetros de cálculo
interface ParametrosCalculo {
  areaTotal: number;           // m²
  perimetroExterno: number;    // m
  areaParedes: number;         // m²
  areaTelhado: number;         // m²
  qtdPilares: number;
  qtdBanheiros: number;
  qtdQuartos: number;
  tipoTelhado: TipoTelhado;
  tipoTijolo: TipoTijolo;
  padraoAcabamento: PadraoAcabamento;
  reboco: ConfiguracaoReboco;
  incluirChurrasqueira: boolean;
}

/**
 * Calcula o orçamento detalhado de materiais da casa
 * Estrutura alinhada com planilha Excel - Seções 3.1 a 3.13
 */
export function calcularOrcamentoCasaDetalhado(params: ParametrosCalculo): OrcamentoCasaDetalhado {
  const {
    areaTotal,
    perimetroExterno,
    areaParedes,
    areaTelhado,
    qtdPilares,
    qtdBanheiros,
    qtdQuartos,
    tipoTelhado,
    tipoTijolo,
    padraoAcabamento,
    reboco,
    incluirChurrasqueira,
  } = params;

  const mult = padraoAcabamento.multiplicadorPreco;
  const P = PRECOS_MATERIAIS_CASA;

  // =============================================
  // 3.1 MOVIMENTO DE TERRA
  // =============================================
  const volumeEscavacaoBaldrame = perimetroExterno * 0.4 * 0.4;
  const volumeEscavacaoFundacao = qtdPilares * 0.6 * 0.6 * 0.6;
  const volumeReterro = volumeEscavacaoBaldrame * 0.3;
  const areaEspalhamento = areaTotal * 0.5;
  const areaApiloamento = perimetroExterno * 0.4;

  const movimentoTerra = criarSecao('3.1', 'MOVIMENTO DE TERRA', [
    criarItem('3.1.1', 'Escavação manual de valas - baldrames (40 X 40) cm', 'm³', volumeEscavacaoBaldrame, P.movimentoTerra.escavacaoValasBaldrame),
    criarItem('3.1.2', 'Escavação manual de fundação - 60X60', 'm³', volumeEscavacaoFundacao, P.movimentoTerra.escavacaoFundacao60x60),
    criarItem('3.1.3', 'Reterro manual com compactação', 'm³', volumeReterro, P.movimentoTerra.reterroCompactacao),
    criarItem('3.1.4', 'Espalhamento e adensamento de mat.de base, e=0,20m', 'm³', areaEspalhamento, P.movimentoTerra.espalhamentoBase),
    criarItem('3.1.5', 'Apiloamento de fundo de vala/fundação', 'm²', areaApiloamento, P.movimentoTerra.apiloamentoFundoVala),
  ]);

  // =============================================
  // 3.2 BALDRAME E ALVENARIA DE ELEVAÇÃO
  // =============================================
  const volumeAlvenariaPedra = perimetroExterno * 0.3 * 0.3;
  const volumeCinta = perimetroExterno * 0.1 * 0.1;
  const areaImpermeabilizacao = perimetroExterno * 0.5;
  const areaAlvenaria = areaParedes;

  const baldrameAlvenaria = criarSecao('3.2', 'BALDRAME E ALVENARIA DE ELEVAÇÃO', [
    criarItem('3.2.1', 'Alvenaria de pedra argamassada, traço 1:6, c/ agregado adquirido', 'm³', volumeAlvenariaPedra, P.baldrameAlvenaria.alvenariaPedraArgamassada),
    criarItem('3.2.2', 'Cinta em concreto armado - 10x10cm', 'm³', volumeCinta, P.baldrameAlvenaria.cintaConcretoArmado),
    criarItem('3.2.3', 'Impermeabilização de Baldrame', 'm²', areaImpermeabilizacao, P.baldrameAlvenaria.impermeabilizacaoBaldrame),
    criarItem('3.2.4', `Alvenaria em ${tipoTijolo.nome}, traço 1:2:8`, 'm²', areaAlvenaria, tipoTijolo.precoUnidade * tipoTijolo.tijolosPorM2, false),
  ]);

  // =============================================
  // 3.3 FUNDAÇÕES E ESTRUTURAS
  // =============================================
  const volumeConcretoPilares = qtdPilares * 0.15 * 0.15 * ALVENARIA.alturaParede;
  const volumeConcretoVigas = perimetroExterno * 0.15 * 0.3;
  const volumeConcretoLaje = areaTotal * 0.1;
  const volumeConcretoTotal = volumeConcretoPilares + volumeConcretoVigas + volumeConcretoLaje;
  const areaForma = (qtdPilares * 0.15 * 4 * ALVENARIA.alturaParede) + (perimetroExterno * 0.3 * 2);
  const pesoFerro = (qtdPilares * 35) + (perimetroExterno * 4) + (areaTotal * 4.5);

  const fundacoesEstruturas = criarSecao('3.3', 'FUNDAÇÕES E ESTRUTURAS', [
    criarItem('3.3.1', 'Concreto em pilares, vigas e escada, Fck 20 MPA', 'm³', volumeConcretoTotal, P.fundacoesEstruturas.concretoPilaresVigas),
    criarItem('3.3.2', 'Forma e desforma em madeira compensada', 'm²', areaForma, P.fundacoesEstruturas.formaDesforma),
    criarItem('3.3.3', 'Armadura CA 50 média', 'kg', pesoFerro, P.fundacoesEstruturas.armaduraCA50),
    criarItem('3.3.4', 'Lançamento e aplicação do concreto', 'm³', volumeConcretoTotal, P.fundacoesEstruturas.lancamentoConcreto),
    criarItem('3.3.5', 'Lajes pré-fabricadas para piso, com regularização', 'm²', areaTotal, P.fundacoesEstruturas.lajePrefabricada),
  ]);

  // =============================================
  // 3.4 ESQUADRIAS E FERRAGENS
  // =============================================
  const qtdPortasInternas = qtdQuartos + qtdBanheiros + 2; // quartos + banheiros + cozinha + area serviço
  const qtdJanelas = qtdQuartos + qtdBanheiros + 2;
  const areaJanelas = qtdJanelas * 1.5; // média 1.5m² por janela

  const esquadriasFerragens = criarSecao('3.4', 'ESQUADRIAS E FERRAGENS', [
    criarItem('3.4.1', 'Porta de Entrada DECORATIVA', 'unid', 1, P.esquadriasFerragens.portaEntradaDecorativa * mult),
    criarItem('3.4.2', 'Porta de madeira de Lei - completa', 'unid', qtdPortasInternas, P.esquadriasFerragens.portaMadeiraLei * mult),
    criarItem('3.4.3', 'Alumínio e vidro (janelas)', 'm²', areaJanelas, P.esquadriasFerragens.janelaAluminio * mult),
    criarItem('3.4.4', 'Cobogó 50x50, anti chuva (casa do gás)', 'unid', 3, P.esquadriasFerragens.cobogoAntiChuva),
  ]);

  // =============================================
  // 3.5 COBERTURA
  // =============================================
  const cobertura = criarSecao('3.5', 'COBERTURA', [
    criarItem('3.5.1', `Cobertura com ${tipoTelhado.nome}`, 'm²', areaTelhado * 1.1, tipoTelhado.precoPorM2, false),
  ]);

  // =============================================
  // 3.6 REVESTIMENTOS (com sub-seções)
  // =============================================
  const areaRebocoExterno = reboco.externo ? areaParedes * 0.4 : 0;
  const areaRebocoInterno = reboco.interno ? areaParedes * 0.6 : 0;
  const areaRebocoTotal = areaRebocoExterno + areaRebocoInterno;
  const areaPiso = areaTotal;
  const areaCeramicaParede = (qtdBanheiros * 12) + 8; // banheiros + cozinha
  const qtdSoleiras = qtdQuartos + qtdBanheiros + 3; // portas internas + externa

  // 3.6.1 PAREDE
  const revestimentosParede = criarSecao('3.6.1', 'PAREDE', [
    criarItem('3.6.1.1', 'Chapisco traço cimento e areia grossa, traço 1:3', 'm²', areaRebocoTotal, P.revestimentos.parede.chapiscoCimentoAreia),
    criarItem('3.6.1.2', 'Reboco cimento e areia peneirada, traço 1:5', 'm²', areaRebocoTotal, P.revestimentos.parede.rebocoCimentoAreia),
    criarItem('3.6.1.3', 'Emboço cimento e areia peneirada', 'm²', areaCeramicaParede, P.revestimentos.parede.embocoCimentoAreia),
    criarItem('3.6.1.4', 'Revestimento Cerâmico (De acordo com Briefing)', 'm²', areaCeramicaParede, P.revestimentos.parede.revestimentoCeramico * mult),
    criarItem('3.6.1.5', 'Rejuntamento para porcelanato, até 1,5mm', 'm²', areaCeramicaParede, P.revestimentos.parede.rejuntamentoPorcelanato),
    criarItem('3.6.1.6', 'Bancada da cozinha com acabamento de porcelanato', 'unid', 1, P.revestimentos.parede.bancadaCozinhaPorcelanato * mult),
  ]);

  // 3.6.2 TETO
  const revestimentosTeto = criarSecao('3.6.2', 'TETO', [
    criarItem('3.6.2.1', 'Gesso Convencional para Forro com tabica e detalhamentos', 'm²', areaTotal, P.revestimentos.teto.gessoConvencionalForro * mult),
  ]);

  // 3.6.3 PISOS
  const revestimentosPisos = criarSecao('3.6.3', 'PISOS', [
    criarItem('3.6.3.1', 'Concreto não estrutural, s/ betoneira, p/ lastro', 'm²', areaPiso, P.revestimentos.pisos.concretoNaoEstruturalLastro),
    criarItem('3.6.3.2', 'Regularização de base c/ argamassa 1:4 - ESP=3cm', 'm²', areaPiso, P.revestimentos.pisos.regularizacaoBase),
    criarItem('3.6.3.3', 'Revestimento Cerâmico (De acordo com Briefing)', 'm²', areaPiso, P.revestimentos.pisos.revestimentoCeramico * mult),
    criarItem('3.6.3.4', 'Rejuntamento para porcelanato, até 1,5mm', 'm²', areaPiso, P.revestimentos.pisos.rejuntamentoPorcelanato),
    criarItem('3.6.3.5', 'Soleiras de granito - L=15cm', 'm', qtdSoleiras * 0.9, P.revestimentos.pisos.soleirasGranito * mult), // 0.9m média por porta
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
  // =============================================
  const metrosTubo25 = areaTotal * 0.3;
  const metrosTubo32 = areaTotal * 0.2;
  const metrosTubo50 = areaTotal * 0.15;
  const qtdPontosHidraulicos = (qtdBanheiros * 4) + 4; // banheiros (vaso, pia, chuveiro, ducha) + cozinha + tanque

  const instalacaoHidraulica = criarSecao('3.7', 'INSTALAÇÃO HIDRÁULICA', [
    criarItem('3.7.1', 'Tubo PVC soldável 50mm (água fria)', 'm', metrosTubo50, P.instalacaoHidraulica.tuboPVC50mm),
    criarItem('3.7.2', 'Tubo PVC soldável 32mm (água fria)', 'm', metrosTubo32, P.instalacaoHidraulica.tuboPVC32mm),
    criarItem('3.7.3', 'Tubo PVC soldável 25mm (água fria)', 'm', metrosTubo25, P.instalacaoHidraulica.tuboPVC25mm),
    criarItem('3.7.4', 'Caixa d\'água capacidade 1500 L', 'unid', 1, P.instalacaoHidraulica.caixaDagua1500L),
    criarItem('3.7.5', 'Flange 2"', 'unid', 2, P.instalacaoHidraulica.flange2pol),
    criarItem('3.7.6', 'Flange de 1"', 'unid', 2, P.instalacaoHidraulica.flange1pol),
    criarItem('3.7.7', 'Registro Bruto de gaveta D= 2"', 'unid', 3, P.instalacaoHidraulica.registroGaveta),
    criarItem('3.7.8', 'Registro de gaveta c/ canopla cromada D= 1/2"', 'unid', qtdBanheiros * 2, P.instalacaoHidraulica.registroGavetaCanopla),
    criarItem('3.7.9', 'Registro de pressão para chuveiro, 20mm', 'unid', qtdBanheiros, P.instalacaoHidraulica.registroPressaoChuveiro),
    criarItem('3.7.10', 'Boia mecânica 3/4"', 'unid', 1, P.instalacaoHidraulica.boiaMecanica),
    criarItem('3.7.11', 'Torneira para jardim em metal', 'unid', 2, P.instalacaoHidraulica.torneiraMetal),
    criarItem('3.7.12', 'Bancada de granito para lavatório, incluindo louça branca e acessórios', 'cj', qtdBanheiros, P.instalacaoHidraulica.bancadaGranitoLavatorio * mult),
    criarItem('3.7.13', 'Bacia sanitária em louça branca, com caixa acoplada', 'unid', qtdBanheiros, P.instalacaoHidraulica.baciaSanitaria * mult),
    criarItem('3.7.14', 'Chuveiro articulado cromado', 'unid', qtdBanheiros, P.instalacaoHidraulica.chuveiroArticulado * mult),
    criarItem('3.7.15', 'Bancada em granito p/ pia de cozinha, incluindo cuba de aço inox e acessórios', 'cj', 1, P.instalacaoHidraulica.bancadaGranitoCozinha * mult),
    criarItem('3.7.17', 'Tanque de Inox com acessórios', 'cj', 1, P.instalacaoHidraulica.tanqueInox * mult),
  ]);

  // =============================================
  // 3.8 INSTALAÇÃO SANITÁRIA
  // =============================================
  const metrosEsgoto100 = areaTotal * 0.5;
  const metrosEsgoto75 = areaTotal * 0.4;
  const metrosEsgoto50 = areaTotal * 0.6;
  const qtdRalos = qtdBanheiros * 2 + 2;

  const instalacaoSanitaria = criarSecao('3.8', 'INSTALAÇÃO SANITÁRIA', [
    criarItem('3.8.1', 'Caixa de inspeção em alvenaria 60x60x60 e tampa de concreto', 'unid', 3, P.instalacaoSanitaria.caixaInspecao60x60),
    criarItem('3.8.2', 'Tubo e conexão em PVC para esgoto 100mm', 'm', metrosEsgoto100, P.instalacaoSanitaria.tuboPVCEsgoto100mm),
    criarItem('3.8.3', 'Tubo e conexão em PVC para esgoto 75mm', 'm', metrosEsgoto75, P.instalacaoSanitaria.tuboPVCEsgoto75mm),
    criarItem('3.8.5', 'Tubo e conexão em PVC para esgoto 50mm', 'm', metrosEsgoto50, P.instalacaoSanitaria.tuboPVCEsgoto50mm),
    criarItem('3.8.6', 'Ralo sifonado 150x150cm', 'unid', qtdRalos, P.instalacaoSanitaria.raloSifonado),
  ]);

  // =============================================
  // 3.9 INSTALAÇÃO ELÉTRICA
  // =============================================
  const metrosEletrodutoRigido = areaTotal * 0.35;
  const metrosEletrodutoFlexivel = areaTotal * 4;
  const qtdCaixas4x4 = Math.ceil(areaTotal / 10);
  const qtdCaixas4x2 = Math.ceil(areaTotal * 1.5);
  const metrosCabo1_5mm = areaTotal * 4;
  const metrosCabo2_5mm = areaTotal * 6;
  const metrosCabo4mm = areaTotal * 2;
  const metrosCabo10mm = areaTotal * 0.4;
  const qtdTomadas = Math.ceil(areaTotal * 0.8);
  const qtdInterruptores = qtdQuartos + qtdBanheiros + 4;
  const qtdLuminarias = qtdQuartos + qtdBanheiros + 4;
  const qtdCircuitos = Math.max(6, Math.ceil(areaTotal / 15));

  const instalacaoEletrica = criarSecao('3.9', 'INSTALAÇÃO ELÉTRICA', [
    criarItem('3.9.1', 'Quadro de distribuição interno até 12 circuitos, c/ barramento', 'unid', 1, P.instalacaoEletrica.quadroDistribuicao12),
    criarItem('3.9.2', 'Eletroduto rígido, roscável D= 32mm, inc conexões', 'm', metrosEletrodutoRigido, P.instalacaoEletrica.eletrodutoRigido32mm),
    criarItem('3.9.3', 'Eletroduto flexível 3/4", tipo garganta', 'm', metrosEletrodutoFlexivel, P.instalacaoEletrica.eletrodutoFlexivel),
    criarItem('3.9.4', 'Caixa de ligação em PVC rígido 4x4', 'unid', qtdCaixas4x4, P.instalacaoEletrica.caixaLigacaoPVC4x4),
    criarItem('3.9.5', 'Caixa de ligação em PVC rígido 4x2', 'unid', qtdCaixas4x2, P.instalacaoEletrica.caixaLigacaoPVC4x2),
    criarItem('3.9.6', 'Cabo isolado PVC, 750 V, - 1,5mm', 'm', metrosCabo1_5mm, P.instalacaoEletrica.caboIsoladoPVC1_5mm),
    criarItem('3.9.7', 'Cabo isolado PVC, 750 V, - 2,5mm', 'm', metrosCabo2_5mm, P.instalacaoEletrica.caboIsoladoPVC2_5mm),
    criarItem('3.9.8', 'Cabo isolado PVC, 750 V, - 4,0mm', 'm', metrosCabo4mm, P.instalacaoEletrica.caboIsoladoPVC4mm),
    criarItem('3.9.9', 'Cabo isolado PVC, 750 V, - 10,0mm', 'm', metrosCabo10mm, P.instalacaoEletrica.caboIsoladoPVC10mm),
    criarItem('3.9.10', 'Disjuntores 15A', 'unid', Math.ceil(qtdCircuitos * 0.3), P.instalacaoEletrica.disjuntor15A),
    criarItem('3.9.11', 'Disjuntor 20A', 'unid', Math.ceil(qtdCircuitos * 0.3), P.instalacaoEletrica.disjuntor20A),
    criarItem('3.9.12', 'Disjuntores 32A', 'unid', Math.ceil(qtdCircuitos * 0.2), P.instalacaoEletrica.disjuntor32A),
    criarItem('3.9.13', 'Disjuntor de 50A', 'unid', 1, P.instalacaoEletrica.disjuntor50A),
    criarItem('3.9.14', 'Haste de cobre 5/8" x 3,40m, completo, COPPERWELD', 'unid', 1, P.instalacaoEletrica.hasteCobre),
    criarItem('3.9.15', 'Interruptor triplo', 'unid', Math.ceil(qtdInterruptores * 0.3), P.instalacaoEletrica.interruptorTriplo),
    criarItem('3.9.16', 'Interruptor duplo', 'unid', Math.ceil(qtdInterruptores * 0.7), P.instalacaoEletrica.interruptorDuplo),
    criarItem('3.9.18', 'Interruptor para campainha', 'unid', 1, P.instalacaoEletrica.interruptorCampainha),
    criarItem('3.9.19', 'Tomada tripla', 'unid', qtdTomadas, P.instalacaoEletrica.tomadaTripla),
    criarItem('3.9.20', 'Ponto de lógica fornecimento e montagem', 'pt', Math.max(2, Math.ceil(areaTotal / 30)), P.instalacaoEletrica.pontoLogica),
    criarItem('3.9.21', 'Ponto de televisão fornecimento e montagem', 'pt', Math.max(2, Math.ceil(areaTotal / 40)), P.instalacaoEletrica.pontoTV),
    criarItem('3.9.22', 'Luminária de LED de embutir quadrada 20x20cm 25W', 'unid', qtdLuminarias, P.instalacaoEletrica.luminariaLED * mult),
  ]);

  // =============================================
  // 3.10 INSTALAÇÕES DO GÁS GLP E CONDICIONADORES
  // =============================================
  const metrosTuboGas = 8 + (qtdBanheiros * 2); // Fogão + aquecedores

  const gasGlp = criarSecao('3.10', 'INSTALAÇÕES DO GÁS GLP E CONDICIONADORES', [
    criarItem('3.10.1', 'Tubo de cobre D=15mm (1/2") Classe E, inclusive conexões', 'm', metrosTuboGas, P.gasGlp.tuboCobre15mm),
    criarItem('3.10.2', 'Teste de estanqueidade em tubulação de gás', 'vb', 1, P.gasGlp.testeEstanqueidade),
  ]);

  // =============================================
  // 3.11 PINTURA
  // =============================================
  const areaPinturaInterna = areaParedes * 0.6 + areaTotal; // paredes internas + teto
  const areaPinturaExterna = areaParedes * 0.4;
  const areaPinturaTotal = areaPinturaInterna + areaPinturaExterna;

  const pintura = criarSecao('3.11', 'PINTURA', [
    criarItem('3.11.2', 'Textura duas demãos externa do tipo grafiada', 'm²', areaPinturaExterna, P.pintura.texturaExterna * mult),
    criarItem('3.11.4', 'Emassamento duas demãos em paredes internas, incl. Forro', 'm²', areaPinturaInterna, P.pintura.emassamento),
    criarItem('3.11.5', 'Latex interno duas demãos, incl. Forro, s/ massa', 'm²', areaPinturaInterna, P.pintura.pinturaLatexPVA * mult),
    criarItem('3.11.6', 'Selador em madeira', 'm²', areaTotal * 0.05, P.pintura.seladorMadeira), // ~5% da área para esquadrias
    criarItem('3.11.7', 'Esmalte sintético duas demãos em esquadria de madeira', 'm²', areaTotal * 0.05, P.pintura.esmalteSintetico * mult),
  ]);

  // =============================================
  // 3.12 CHURRASQUEIRA (condicional)
  // =============================================
  const churrasqueira = criarSecao('3.12', 'CHURRASQUEIRA',
    incluirChurrasqueira ? [
      criarItem('3.12.1', 'Churrasqueira médio porte em tijolo refratário', 'unid', 1, P.churrasqueira.churrasqueiraMediaPorte),
    ] : []
  );

  // =============================================
  // 3.13 LIMPEZA DA OBRA
  // =============================================
  const volumeEntulho = areaTotal * 0.15; // Estimativa de entulho gerado

  const limpezaObra = criarSecao('3.13', 'LIMPEZA DA OBRA', [
    criarItem('3.13.1', 'Containers', 'unid', Math.max(2, Math.ceil(volumeEntulho / 5)), P.limpezaObra.containers),
    criarItem('3.13.2', 'Transporte horizontal', 'm³', volumeEntulho, P.limpezaObra.transporteHorizontal),
    criarItem('3.13.3', 'Limpeza geral', 'm²', areaTotal, P.limpezaObra.limpezaGeral),
  ]);

  // =============================================
  // TOTAIS
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
    subtotal: Math.round(subtotal * 100) / 100,
    totalGeral: Math.round(subtotal * 100) / 100,
  };
}
