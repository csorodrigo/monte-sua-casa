// Mão de Obra detalhada da Casa - Baseado na planilha Excel "monte-sua-casa-simulacao.xlsx"
// Aba: MÃO DE OBRA - CASA (laranja)

import { Estado, PadraoAcabamento } from '@/types';
import { ItemOrcamentoDetalhado, SecaoOrcamentoDetalhado, SubSecaoRevestimentos } from './orcamento-detalhado-casa';
import { PRECOS_MAO_OBRA_CASA, BDI_PERCENTUAL } from '@/lib/prices/mao-obra-casa';

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
  } = params;

  // Fator de ajuste pelo estado (base SP = 98)
  const fatorEstado = estado.custoMaoObraPorM2 / 98;
  const mult = padraoAcabamento.multiplicadorPreco;
  const P = PRECOS_MAO_OBRA_CASA;

  // =============================================
  // 3.1 MOVIMENTO DE TERRA
  // =============================================
  const volumeEscavacaoBaldrame = perimetroExterno * 0.4 * 0.4;
  const volumeEscavacaoFundacao = qtdPilares * 0.6 * 0.6 * 0.6;
  const volumeReterro = volumeEscavacaoBaldrame * 0.3;
  const areaEspalhamento = areaTotal * 0.5;
  const areaApiloamento = perimetroExterno * 0.4;

  const movimentoTerra = criarSecao('3.1', 'MOVIMENTO DE TERRA', [
    criarItem('3.1.1', 'Escavação manual de valas - baldrames', 'm³', volumeEscavacaoBaldrame, P.movimentoTerra.escavacaoValasBaldrame * fatorEstado),
    criarItem('3.1.2', 'Escavação manual de fundação', 'm³', volumeEscavacaoFundacao, P.movimentoTerra.escavacaoFundacao60x60 * fatorEstado),
    criarItem('3.1.3', 'Reterro manual com compactação', 'm³', volumeReterro, P.movimentoTerra.reterroCompactacao * fatorEstado),
    criarItem('3.1.4', 'Espalhamento e adensamento de base', 'm³', areaEspalhamento, P.movimentoTerra.espalhamentoBase * fatorEstado),
    criarItem('3.1.5', 'Apiloamento de fundo de vala', 'm²', areaApiloamento, P.movimentoTerra.apiloamentoFundoVala * fatorEstado),
  ]);

  // =============================================
  // 3.2 BALDRAME E ALVENARIA DE ELEVAÇÃO
  // =============================================
  const volumeAlvenariaPedra = perimetroExterno * 0.3 * 0.3;
  const volumeCinta = perimetroExterno * 0.1 * 0.1;
  const areaImpermeabilizacao = perimetroExterno * 0.5;

  const baldrameAlvenaria = criarSecao('3.2', 'BALDRAME E ALVENARIA DE ELEVAÇÃO', [
    criarItem('3.2.1', 'Alvenaria de pedra argamassada', 'm³', volumeAlvenariaPedra, P.baldrameAlvenaria.alvenariaPedraArgamassada * fatorEstado),
    criarItem('3.2.3', 'Impermeabilização de Baldrame', 'm²', areaImpermeabilizacao, P.baldrameAlvenaria.impermeabilizacaoBaldrame * fatorEstado),
    criarItem('3.2.4', 'Alvenaria em tijolo furado', 'm²', areaParedes, P.baldrameAlvenaria.alvenariaTijoloFurado * fatorEstado),
  ]);

  // =============================================
  // 3.3 FUNDAÇÕES E ESTRUTURAS
  // =============================================
  const volumeConcretoTotal = (qtdPilares * 0.15 * 0.15 * 2.8) + (perimetroExterno * 0.15 * 0.3) + (areaTotal * 0.1);
  const areaForma = (qtdPilares * 0.15 * 4 * 2.8) + (perimetroExterno * 0.3 * 2);
  const pesoFerro = (qtdPilares * 35) + (perimetroExterno * 4) + (areaTotal * 4.5);

  const fundacoesEstruturas = criarSecao('3.3', 'FUNDAÇÕES E ESTRUTURAS', [
    criarItem('3.3.1', 'Concreto em pilares, vigas e escada', 'm³', volumeConcretoTotal, P.fundacoesEstruturas.concretoPilaresVigas * fatorEstado),
    criarItem('3.3.2', 'Forma e desforma', 'm²', areaForma, P.fundacoesEstruturas.formaDesforma * fatorEstado),
    criarItem('3.3.3', 'Armadura CA 50', 'kg', pesoFerro, P.fundacoesEstruturas.armaduraCA50 * fatorEstado),
    criarItem('3.3.4', 'Lançamento e aplicação do concreto', 'm³', volumeConcretoTotal, P.fundacoesEstruturas.lancamentoConcreto * fatorEstado),
    criarItem('3.3.5', 'Lajes pré-fabricadas', 'm²', areaTotal, P.fundacoesEstruturas.lajePrefabricada * fatorEstado),
  ]);

  // =============================================
  // 3.4 ESQUADRIAS E FERRAGENS
  // =============================================
  const qtdPortasInternas = qtdQuartos + qtdBanheiros + 2;
  const areaJanelas = (qtdQuartos + qtdBanheiros + 2) * 1.5;

  const esquadriasFerragens = criarSecao('3.4', 'ESQUADRIAS E FERRAGENS', [
    criarItem('3.4.1', 'Instalação porta entrada', 'unid', 1, P.esquadriasFerragens.portaEntradaDecorativa * fatorEstado),
    criarItem('3.4.2', 'Instalação portas internas', 'unid', qtdPortasInternas, P.esquadriasFerragens.portaMadeiraLei * fatorEstado),
    criarItem('3.4.4', 'Instalação cobogó', 'unid', 3, P.esquadriasFerragens.cobogoAntiChuva * fatorEstado),
  ]);

  // =============================================
  // 3.5 COBERTURA
  // =============================================
  const cobertura = criarSecao('3.5', 'COBERTURA', [
    criarItem('3.5.1', 'Cobertura completa (estrutura + telhas)', 'm²', areaTelhado * 1.1, P.cobertura.cobertaPadrao * fatorEstado),
  ]);

  // =============================================
  // 3.6 REVESTIMENTOS (com sub-seções)
  // =============================================
  const areaCeramicaParede = (qtdBanheiros * 12) + 8;
  const qtdSoleiras = qtdQuartos + qtdBanheiros + 3;

  // 3.6.1 PAREDE
  const revestimentosParede = criarSecao('3.6.1', 'PAREDE', [
    criarItem('3.6.1.1', 'Chapisco', 'm²', areaParedes, P.revestimentos.parede.chapiscoCimentoAreia * fatorEstado),
    criarItem('3.6.1.3', 'Emboço', 'm²', areaCeramicaParede, P.revestimentos.parede.embocoCimentoAreia * fatorEstado),
    criarItem('3.6.1.4', 'Assentamento cerâmica parede', 'm²', areaCeramicaParede, P.revestimentos.parede.revestimentoCeramico * fatorEstado * mult),
    criarItem('3.6.1.5', 'Rejuntamento', 'm²', areaCeramicaParede, P.revestimentos.parede.rejuntamentoPorcelanato * fatorEstado),
  ]);

  // 3.6.2 TETO
  const revestimentosTeto = criarSecao('3.6.2', 'TETO', [
    criarItem('3.6.2.1', 'Forro de gesso', 'm²', areaTotal, P.revestimentos.teto.gessoConvencionalForro * fatorEstado * mult),
  ]);

  // 3.6.3 PISOS
  const revestimentosPisos = criarSecao('3.6.3', 'PISOS', [
    criarItem('3.6.3.1', 'Contrapiso/lastro', 'm²', areaTotal, P.revestimentos.pisos.concretoNaoEstruturalLastro * fatorEstado),
    criarItem('3.6.3.2', 'Regularização', 'm²', areaTotal, P.revestimentos.pisos.regularizacaoBase * fatorEstado),
    criarItem('3.6.3.3', 'Assentamento cerâmica piso', 'm²', areaTotal, P.revestimentos.pisos.revestimentoCeramico * fatorEstado * mult),
    criarItem('3.6.3.4', 'Rejuntamento piso', 'm²', areaTotal, P.revestimentos.pisos.rejuntamentoPorcelanato * fatorEstado),
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

  const instalacaoHidraulica = criarSecao('3.7', 'INSTALAÇÃO HIDRÁULICA', [
    criarItem('3.7.1', 'Tubo PVC soldável 50mm', 'm', metrosTubo50, P.instalacaoHidraulica.tuboPVC50mm * fatorEstado),
    criarItem('3.7.2', 'Tubo PVC soldável 32mm', 'm', metrosTubo32, P.instalacaoHidraulica.tuboPVC32mm * fatorEstado),
    criarItem('3.7.3', 'Tubo PVC soldável 25mm', 'm', metrosTubo25, P.instalacaoHidraulica.tuboPVC25mm * fatorEstado),
    criarItem('3.7.4', 'Instalação caixa d\'água', 'unid', 1, P.instalacaoHidraulica.caixaDagua1500L * fatorEstado),
    criarItem('3.7.5', 'Instalação flanges e registros', 'unid', 6 + (qtdBanheiros * 3), P.instalacaoHidraulica.registroGaveta * fatorEstado),
    criarItem('3.7.12', 'Bancada de granito lavatório', 'cj', qtdBanheiros, P.instalacaoHidraulica.bancadaGranitoLavatorio * fatorEstado * mult),
    criarItem('3.7.13', 'Bacia sanitária', 'unid', qtdBanheiros, P.instalacaoHidraulica.baciaSanitaria * fatorEstado),
    criarItem('3.7.14', 'Chuveiro articulado', 'unid', qtdBanheiros, P.instalacaoHidraulica.chuveiroArticulado * fatorEstado),
    criarItem('3.7.15', 'Bancada cozinha', 'cj', 1, P.instalacaoHidraulica.bancadaGranitoCozinha * fatorEstado * mult),
    criarItem('3.7.17', 'Tanque', 'cj', 1, P.instalacaoHidraulica.tanqueInox * fatorEstado),
  ]);

  // =============================================
  // 3.8 INSTALAÇÃO SANITÁRIA
  // =============================================
  const metrosEsgoto = areaTotal * 1.5;
  const qtdRalos = qtdBanheiros * 2 + 2;

  const instalacaoSanitaria = criarSecao('3.8', 'INSTALAÇÃO SANITÁRIA', [
    criarItem('3.8.1', 'Caixas de inspeção', 'unid', 4, P.instalacaoSanitaria.caixaInspecao60x60 * fatorEstado),
    criarItem('3.8.3', 'Tubo esgoto 75mm', 'm', metrosEsgoto * 0.3, P.instalacaoSanitaria.tuboPVCEsgoto75mm * fatorEstado),
    criarItem('3.8.5', 'Tubo esgoto 50mm', 'm', metrosEsgoto * 0.7, P.instalacaoSanitaria.tuboPVCEsgoto50mm * fatorEstado),
    criarItem('3.8.6', 'Instalação ralos', 'unid', qtdRalos, P.instalacaoSanitaria.raloSifonado * fatorEstado),
  ]);

  // =============================================
  // 3.9 INSTALAÇÃO ELÉTRICA
  // =============================================
  const metrosEletroduto = areaTotal * 4.35;
  const metrosCabo = areaTotal * 12.4;
  const qtdTomadas = Math.ceil(areaTotal * 0.8);
  const qtdInterruptores = qtdQuartos + qtdBanheiros + 4;
  const qtdLuminarias = qtdQuartos + qtdBanheiros + 4;

  const instalacaoEletrica = criarSecao('3.9', 'INSTALAÇÃO ELÉTRICA', [
    criarItem('3.9.1', 'Quadro de distribuição', 'unid', 1, P.instalacaoEletrica.quadroDistribuicao12 * fatorEstado),
    criarItem('3.9.2', 'Eletroduto rígido', 'm', metrosEletroduto * 0.08, P.instalacaoEletrica.eletrodutoRigido32mm * fatorEstado),
    criarItem('3.9.3', 'Eletroduto flexível', 'm', metrosEletroduto * 0.92, P.instalacaoEletrica.eletrodutoFlexivel * fatorEstado),
    criarItem('3.9.4', 'Caixas de ligação', 'unid', Math.ceil(areaTotal / 5), P.instalacaoEletrica.caixaLigacaoPVC4x4 * fatorEstado),
    criarItem('3.9.6', 'Cabo 1,5mm', 'm', metrosCabo * 0.32, P.instalacaoEletrica.caboIsoladoPVC1_5mm * fatorEstado),
    criarItem('3.9.7', 'Cabo 2,5mm', 'm', metrosCabo * 0.48, P.instalacaoEletrica.caboIsoladoPVC2_5mm * fatorEstado),
    criarItem('3.9.8', 'Cabo 4mm', 'm', metrosCabo * 0.16, P.instalacaoEletrica.caboIsoladoPVC4mm * fatorEstado),
    criarItem('3.9.9', 'Cabo 10mm', 'm', metrosCabo * 0.04, P.instalacaoEletrica.caboIsoladoPVC10mm * fatorEstado),
    criarItem('3.9.10', 'Disjuntores', 'unid', Math.ceil(areaTotal / 15), P.instalacaoEletrica.disjuntor20A * fatorEstado),
    criarItem('3.9.15', 'Interruptores', 'unid', qtdInterruptores, P.instalacaoEletrica.interruptorDuplo * fatorEstado),
    criarItem('3.9.19', 'Tomadas', 'unid', qtdTomadas, P.instalacaoEletrica.tomadaTripla * fatorEstado),
    criarItem('3.9.20', 'Pontos de lógica', 'pt', Math.max(2, Math.ceil(areaTotal / 30)), P.instalacaoEletrica.pontoLogica * fatorEstado),
    criarItem('3.9.21', 'Pontos de TV', 'pt', Math.max(2, Math.ceil(areaTotal / 40)), P.instalacaoEletrica.pontoTV * fatorEstado),
    criarItem('3.9.22', 'Luminárias LED', 'unid', qtdLuminarias, P.instalacaoEletrica.luminariaLED * fatorEstado * mult),
  ]);

  // =============================================
  // 3.10 INSTALAÇÕES DO GÁS GLP E CONDICIONADORES
  // =============================================
  const metrosTuboGas = 8 + (qtdBanheiros * 2);

  const gasGlp = criarSecao('3.10', 'INSTALAÇÕES DO GÁS GLP E CONDICIONADORES', [
    criarItem('3.10.1', 'Tubulação de gás', 'm', metrosTuboGas, P.gasGlp.tuboCobre15mm * fatorEstado),
    criarItem('3.10.2', 'Teste de estanqueidade', 'vb', 1, P.gasGlp.testeEstanqueidade * fatorEstado),
  ]);

  // =============================================
  // 3.11 PINTURA
  // =============================================
  const areaPinturaInterna = areaParedes * 0.6 + areaTotal;
  const areaPinturaExterna = areaParedes * 0.4;
  const areaPinturaTotal = areaPinturaInterna + areaPinturaExterna;

  const pintura = criarSecao('3.11', 'PINTURA', [
    criarItem('3.11.2', 'Textura externa', 'm²', areaPinturaExterna, P.pintura.texturaExterna * fatorEstado * mult),
    criarItem('3.11.4', 'Emassamento', 'm²', areaPinturaInterna, P.pintura.emassamento * fatorEstado),
    criarItem('3.11.5', 'Latex interno', 'm²', areaPinturaInterna, P.pintura.pinturaLatexPVA * fatorEstado * mult),
    criarItem('3.11.6', 'Selador em madeira', 'm²', areaTotal * 0.05, P.pintura.seladorMadeira * fatorEstado),
    criarItem('3.11.7', 'Esmalte sintético', 'm²', areaTotal * 0.05, P.pintura.esmalteSintetico * fatorEstado * mult),
  ]);

  // =============================================
  // 3.12 CHURRASQUEIRA (condicional)
  // =============================================
  const churrasqueira = criarSecao('3.12', 'CHURRASQUEIRA',
    incluirChurrasqueira ? [
      criarItem('3.12.1', 'Construção churrasqueira', 'unid', 1, P.churrasqueira.churrasqueiraMediaPorte * fatorEstado),
    ] : []
  );

  // =============================================
  // 3.13 LIMPEZA DA OBRA
  // =============================================
  const volumeEntulho = areaTotal * 0.15;

  const limpezaObra = criarSecao('3.13', 'LIMPEZA DA OBRA', [
    criarItem('3.13.2', 'Transporte horizontal', 'm³', volumeEntulho, P.limpezaObra.transporteHorizontal * fatorEstado),
    criarItem('3.13.3', 'Limpeza geral', 'm²', areaTotal, P.limpezaObra.limpezaGeral * fatorEstado),
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
