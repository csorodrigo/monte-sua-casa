// Orçamento detalhado da Casa - Baseado na planilha original

import { Comodo, TipoTelhado, TipoTijolo, PadraoAcabamento, Estado, ConfiguracaoReboco } from '@/types';
import { ALVENARIA } from './constants';

// Preços unitários baseados na planilha (SINAPI/mercado)
export const PRECOS_CASA = {
  // 3.1 MOVIMENTO DE TERRA
  escavacaoValasBaldrame: 37.51,      // m³
  escavacaoFundacao60x60: 37.51,      // m³
  reterroCompactacao: 25.46,          // m³
  espalhamentoBase: 23.91,            // m³
  apiloamentoFundoVala: 27.51,        // m²

  // 3.2 BALDRAME E ALVENARIA DE ELEVAÇÃO
  alvenariaPedraArgamassada: 311.51,  // m³
  cintaConcretoArmado: 635.45,        // m³
  impermeabilizacaoBaldrame: 8.81,    // m²
  alvenariaTijoloFurado: 41.51,       // m²

  // 3.3 FUNDAÇÕES E ESTRUTURAS
  concretoPilaresVigas: 205.51,       // m³ - Fck 20 MPA
  formaDesforma: 11.21,               // m²
  armaduraCA50: 4.11,                 // kg
  lancamentoConcreto: 159.09,         // m³
  lajePrefabricada: 14.92,            // m²

  // 3.4 ESQUADRIAS E FERRAGENS
  portaEntradaDecorativa: 550.01,     // unid
  portaMadeiraLei: 130.01,            // unid
  portaAluminio: 280.01,              // unid
  janelaAluminio: 350.01,             // m²
  fechaduraInterna: 45.01,            // unid
  dobradica: 12.01,                   // unid

  // 3.5 COBERTURA
  madeiraTesoura: 85.01,              // m²
  telha: 0,                           // Varia por tipo
  cumeeira: 15.01,                    // m
  rufoPingadeira: 35.01,              // m
  calha: 45.01,                       // m

  // 3.6 REVESTIMENTOS
  chapiscoParede: 7.34,               // m²
  rebocoParede: 35.80,                // m²
  contrapisoArgamassa: 42.51,         // m²
  ceramicaPiso: 55.01,                // m²
  ceramicaParede: 65.01,              // m²
  rejunte: 8.51,                      // m²

  // 3.7 INSTALAÇÃO HIDRÁULICA
  tuboPVC25mm: 12.51,                 // m
  tuboPVC32mm: 15.51,                 // m
  tuboPVC50mm: 18.51,                 // m
  registroGaveta: 167.27,             // unid
  registroGavetaCanopla: 100.65,      // unid
  registroPressaoChuveiro: 105.54,    // unid
  boiaMecanica: 55.89,                // unid
  torneiraMetal: 57.61,               // unid
  bancadaGranitoLavatorio: 1300.01,   // cj
  baciaSanitaria: 661.68,             // unid
  chuveiroArticulado: 195.01,         // unid
  bancadaGranitoCozinha: 1500.01,     // cj
  tanqueInox: 744.51,                 // cj

  // 3.8 INSTALAÇÃO SANITÁRIA
  caixaInspecao60x60: 399.01,         // unid
  tuboPVCEsgoto100mm: 52.15,          // m
  tuboPVCEsgoto75mm: 42.38,           // m
  tuboPVCEsgoto50mm: 29.91,           // m
  raloSifonado: 75.01,                // unid

  // 3.9 INSTALAÇÃO ELÉTRICA
  quadroDistribuicao12: 415.01,       // unid
  eletrodutoRigido32mm: 27.63,        // m
  eletrodutoFlexivel: 26.41,          // m
  caixaLigacaoPVC4x4: 11.19,          // unid
  caixaLigacaoPVC4x2: 8.86,           // unid
  caboIsoladoPVC1_5mm: 4.00,          // m
  caboIsoladoPVC2_5mm: 7.18,          // m
  caboIsoladoPVC4mm: 8.00,            // m
  caboIsoladoPVC10mm: 15.81,          // m
  tomada2P: 25.01,                    // unid
  interruptor: 22.01,                 // unid
  luminaria: 85.01,                   // unid

  // 3.10 PINTURA
  massaCorrePVA: 12.51,               // m²
  lixamento: 3.51,                    // m²
  pinturaLatexPVA: 18.51,             // m²
  pinturaAcrilica: 22.51,             // m²
};

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

export interface OrcamentoCasaDetalhado {
  movimentoTerra: SecaoOrcamentoDetalhado;
  baldrameAlvenaria: SecaoOrcamentoDetalhado;
  fundacoesEstruturas: SecaoOrcamentoDetalhado;
  esquadriasFerragens: SecaoOrcamentoDetalhado;
  cobertura: SecaoOrcamentoDetalhado;
  revestimentos: SecaoOrcamentoDetalhado;
  instalacaoHidraulica: SecaoOrcamentoDetalhado;
  instalacaoSanitaria: SecaoOrcamentoDetalhado;
  instalacaoEletrica: SecaoOrcamentoDetalhado;
  pintura: SecaoOrcamentoDetalhado;
  totalGeral: number;
}

// Funções auxiliares
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

// Cálculos baseados na planilha
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
}

/**
 * Calcula o orçamento detalhado de materiais da casa
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
  } = params;

  const mult = padraoAcabamento.multiplicadorPreco;

  // 3.1 MOVIMENTO DE TERRA
  const volumeEscavacaoBaldrame = perimetroExterno * 0.4 * 0.4;
  const volumeEscavacaoFundacao = qtdPilares * 0.6 * 0.6 * 0.6;
  const volumeReterro = volumeEscavacaoBaldrame * 0.3;
  const areaEspalhamento = areaTotal * 0.5;
  const areaApiloamento = perimetroExterno * 0.4;

  const movimentoTerra = criarSecao('3.1', 'MOVIMENTO DE TERRA', [
    criarItem('3.1.1', 'Escavação manual de valas - baldrames (40 X 40) cm', 'm³', volumeEscavacaoBaldrame, PRECOS_CASA.escavacaoValasBaldrame),
    criarItem('3.1.2', 'Escavação manual de fundação - 60X60', 'm³', volumeEscavacaoFundacao, PRECOS_CASA.escavacaoFundacao60x60),
    criarItem('3.1.3', 'Reterro manual com compactação', 'm³', volumeReterro, PRECOS_CASA.reterroCompactacao),
    criarItem('3.1.4', 'Espalhamento e adensamento de mat.de base, e=0,20m', 'm³', areaEspalhamento, PRECOS_CASA.espalhamentoBase),
    criarItem('3.1.5', 'Apiloamento de fundo de vala/fundação', 'm²', areaApiloamento, PRECOS_CASA.apiloamentoFundoVala),
  ]);

  // 3.2 BALDRAME E ALVENARIA DE ELEVAÇÃO
  const volumeAlvenariaPedra = perimetroExterno * 0.3 * 0.3;
  const volumeCinta = perimetroExterno * 0.1 * 0.1;
  const areaImpermeabilizacao = perimetroExterno * 0.5;
  const areaAlvenaria = areaParedes;

  const baldrameAlvenaria = criarSecao('3.2', 'BALDRAME E ALVENARIA DE ELEVAÇÃO', [
    criarItem('3.2.1', 'Alvenaria de pedra argamassada, traço 1:6, c/ agregado adiquirido', 'm³', volumeAlvenariaPedra, PRECOS_CASA.alvenariaPedraArgamassada),
    criarItem('3.2.2', 'Cinta em concreto armado - 10x10cm', 'm³', volumeCinta, PRECOS_CASA.cintaConcretoArmado),
    criarItem('3.2.3', 'Impermeabilização de Baldrame', 'm²', areaImpermeabilizacao, PRECOS_CASA.impermeabilizacaoBaldrame),
    criarItem('3.2.4', `Alvenaria em ${tipoTijolo.nome}, traço 1:2:8`, 'm²', areaAlvenaria, tipoTijolo.precoUnidade * tipoTijolo.tijolosPorM2),
  ]);

  // 3.3 FUNDAÇÕES E ESTRUTURAS
  const volumeConcretoPilares = qtdPilares * 0.15 * 0.15 * ALVENARIA.alturaParede;
  const volumeConcretoVigas = perimetroExterno * 0.15 * 0.3;
  const volumeConcretoLaje = areaTotal * 0.1;
  const volumeConcretoTotal = volumeConcretoPilares + volumeConcretoVigas + volumeConcretoLaje;
  const areaForma = (qtdPilares * 0.15 * 4 * ALVENARIA.alturaParede) + (perimetroExterno * 0.3 * 2);
  const pesoFerro = (qtdPilares * 35) + (perimetroExterno * 4) + (areaTotal * 4.5);

  const fundacoesEstruturas = criarSecao('3.3', 'FUNDAÇÕES E ESTRUTURAS', [
    criarItem('3.3.1', 'Concreto em pilares, vigas e escada, Fck 20 MPA', 'm³', volumeConcretoTotal, PRECOS_CASA.concretoPilaresVigas),
    criarItem('3.3.2', 'Forma e desforma em madeira compensada', 'm²', areaForma, PRECOS_CASA.formaDesforma),
    criarItem('3.3.3', 'Armadura CA 50 média', 'kg', pesoFerro, PRECOS_CASA.armaduraCA50),
    criarItem('3.3.4', 'Lançamento e aplicação do concreto', 'm³', volumeConcretoTotal, PRECOS_CASA.lancamentoConcreto),
    criarItem('3.3.5', 'Lajes pré-fabricadas para piso, com regularização', 'm²', areaTotal, PRECOS_CASA.lajePrefabricada),
  ]);

  // 3.4 ESQUADRIAS E FERRAGENS
  const qtdPortasInternas = qtdQuartos + qtdBanheiros + 2; // quartos + banheiros + cozinha + area serviço
  const qtdJanelas = qtdQuartos + qtdBanheiros + 2;
  const areaJanelas = qtdJanelas * 1.5; // média 1.5m² por janela

  const esquadriasFerragens = criarSecao('3.4', 'ESQUADRIAS E FERRAGENS', [
    criarItem('3.4.1', 'Porta de Entrada DECORATIVA', 'unid', 1, PRECOS_CASA.portaEntradaDecorativa * mult),
    criarItem('3.4.2', 'Porta de madeira de Lei - completa', 'unid', qtdPortasInternas, PRECOS_CASA.portaMadeiraLei * mult),
    criarItem('3.4.3', 'Porta de alumínio anodizado branco', 'unid', 1, PRECOS_CASA.portaAluminio * mult),
    criarItem('3.4.4', 'Janela de alumínio anodizado com vidro', 'm²', areaJanelas, PRECOS_CASA.janelaAluminio * mult),
    criarItem('3.4.5', 'Fechadura interna completa', 'unid', qtdPortasInternas + 1, PRECOS_CASA.fechaduraInterna),
    criarItem('3.4.6', 'Dobradiça 3"', 'unid', (qtdPortasInternas + 2) * 3, PRECOS_CASA.dobradica),
  ]);

  // 3.5 COBERTURA
  const comprimentoCumeeira = Math.sqrt(areaTotal) * 0.5;
  const comprimentoRufo = perimetroExterno * 0.3;
  const comprimentoCalha = perimetroExterno * 0.4;

  const cobertura = criarSecao('3.5', 'COBERTURA', [
    criarItem('3.5.1', 'Estrutura de madeira para telhado', 'm²', areaTelhado, PRECOS_CASA.madeiraTesoura),
    criarItem('3.5.2', `Telha ${tipoTelhado.nome}`, 'm²', areaTelhado * 1.1, tipoTelhado.precoPorM2),
    criarItem('3.5.3', 'Cumeeira', 'm', comprimentoCumeeira, PRECOS_CASA.cumeeira),
    criarItem('3.5.4', 'Rufo e pingadeira', 'm', comprimentoRufo, PRECOS_CASA.rufoPingadeira),
    criarItem('3.5.5', 'Calha em chapa galvanizada', 'm', comprimentoCalha, PRECOS_CASA.calha),
  ]);

  // 3.6 REVESTIMENTOS
  const areaRebocoExterno = reboco.externo ? areaParedes * 0.4 : 0;
  const areaRebocoInterno = reboco.interno ? areaParedes * 0.6 : 0;
  const areaPiso = areaTotal;
  const areaCeramicaParede = (qtdBanheiros * 12) + 8; // banheiros + cozinha

  const revestimentos = criarSecao('3.6', 'REVESTIMENTOS', [
    criarItem('3.6.1', 'Chapisco traço 1:4 (cimento e areia s/penerar)', 'm²', areaRebocoExterno + areaRebocoInterno, PRECOS_CASA.chapiscoParede),
    criarItem('3.6.2', 'Reboco traço 1:5 (cimento e areia s/ penerar)', 'm²', areaRebocoExterno + areaRebocoInterno, PRECOS_CASA.rebocoParede),
    criarItem('3.6.3', 'Contrapiso em argamassa traço 1:4', 'm²', areaPiso, PRECOS_CASA.contrapisoArgamassa),
    criarItem('3.6.4', 'Cerâmica para piso', 'm²', areaPiso, PRECOS_CASA.ceramicaPiso * mult),
    criarItem('3.6.5', 'Cerâmica para parede (banheiros/cozinha)', 'm²', areaCeramicaParede, PRECOS_CASA.ceramicaParede * mult),
    criarItem('3.6.6', 'Rejunte', 'm²', areaPiso + areaCeramicaParede, PRECOS_CASA.rejunte),
  ]);

  // 3.7 INSTALAÇÃO HIDRÁULICA
  const metrosTubo25 = areaTotal * 0.3;
  const metrosTubo32 = areaTotal * 0.2;
  const metrosTubo50 = areaTotal * 0.15;

  const instalacaoHidraulica = criarSecao('3.7', 'INSTALAÇÃO HIDRÁULICA', [
    criarItem('3.7.1', 'Tubo PVC soldável 25mm (água fria)', 'm', metrosTubo25, PRECOS_CASA.tuboPVC25mm),
    criarItem('3.7.2', 'Tubo PVC soldável 32mm (água fria)', 'm', metrosTubo32, PRECOS_CASA.tuboPVC32mm),
    criarItem('3.7.3', 'Tubo PVC soldável 50mm (água fria)', 'm', metrosTubo50, PRECOS_CASA.tuboPVC50mm),
    criarItem('3.7.4', 'Registro Bruto de gaveta D= 2"', 'unid', 3, PRECOS_CASA.registroGaveta),
    criarItem('3.7.5', 'Registro de gaveta c/ canopla cromada D= 1/2"', 'unid', qtdBanheiros * 2, PRECOS_CASA.registroGavetaCanopla),
    criarItem('3.7.6', 'Registro de pressão para chuveiro, 20mm', 'unid', qtdBanheiros, PRECOS_CASA.registroPressaoChuveiro),
    criarItem('3.7.7', 'Boia mecanica 3/4"', 'unid', 1, PRECOS_CASA.boiaMecanica),
    criarItem('3.7.8', 'Torneira para jardim em metal', 'unid', 2, PRECOS_CASA.torneiraMetal),
    criarItem('3.7.9', 'Bancada de granito para lavatório, incluindo louça branca e acessórios', 'cj', qtdBanheiros, PRECOS_CASA.bancadaGranitoLavatorio * mult),
    criarItem('3.7.10', 'Bacia sanitária em louça branca, com caixa acoplada', 'unid', qtdBanheiros, PRECOS_CASA.baciaSanitaria * mult),
    criarItem('3.7.11', 'Chuveiro articulado cromado', 'unid', qtdBanheiros, PRECOS_CASA.chuveiroArticulado * mult),
    criarItem('3.7.12', 'Bancada em granito p/ pia de cozinha, incluindo cuba de aço inox e acessórios', 'cj', 1, PRECOS_CASA.bancadaGranitoCozinha * mult),
    criarItem('3.7.13', 'Tanque de Inox com acessórios', 'cj', 1, PRECOS_CASA.tanqueInox * mult),
  ]);

  // 3.8 INSTALAÇÃO SANITÁRIA
  const metrosEsgoto100 = areaTotal * 0.5;
  const metrosEsgoto75 = areaTotal * 0.4;
  const metrosEsgoto50 = areaTotal * 0.6;
  const qtdRalos = qtdBanheiros * 2 + 2;

  const instalacaoSanitaria = criarSecao('3.8', 'INSTALAÇÃO SANITÁRIA', [
    criarItem('3.8.1', 'Caixa de inspeção em alvenaria 60x60x60 e tampa de concreto (sabão e gordura)', 'unid', 4, PRECOS_CASA.caixaInspecao60x60),
    criarItem('3.8.2', 'Tubo e conexão em PVC para esgoto 100mm', 'm', metrosEsgoto100, PRECOS_CASA.tuboPVCEsgoto100mm),
    criarItem('3.8.3', 'Tubo e conexão em PVC para esgoto 75mm', 'm', metrosEsgoto75, PRECOS_CASA.tuboPVCEsgoto75mm),
    criarItem('3.8.4', 'Tubo e conexão em PVC para esgoto 50mm', 'm', metrosEsgoto50, PRECOS_CASA.tuboPVCEsgoto50mm),
    criarItem('3.8.5', 'Ralo sifonado 150x150cm', 'unid', qtdRalos, PRECOS_CASA.raloSifonado),
  ]);

  // 3.9 INSTALAÇÃO ELÉTRICA
  const metrosEletrodutoRigido = areaTotal * 0.35;
  const metrosEletrodutoFlexivel = areaTotal * 4;
  const qtdCaixas4x4 = Math.ceil(areaTotal / 10);
  const qtdCaixas4x2 = areaTotal * 1.5;
  const metrosCabo1_5mm = areaTotal * 4;
  const metrosCabo2_5mm = areaTotal * 6;
  const metrosCabo4mm = areaTotal * 2;
  const metrosCabo10mm = areaTotal * 0.4;
  const qtdTomadas = areaTotal * 0.8;
  const qtdInterruptores = qtdQuartos + qtdBanheiros + 4;
  const qtdLuminarias = qtdQuartos + qtdBanheiros + 4;

  const instalacaoEletrica = criarSecao('3.9', 'INSTALAÇÃO ELÉTRICA', [
    criarItem('3.9.1', 'Quadro de distribuição interno até 12 circuitos, c/ barramento', 'unid', 1, PRECOS_CASA.quadroDistribuicao12),
    criarItem('3.9.2', 'Eletroduto rígido, roscavel D= 32mm, inc conexões', 'm', metrosEletrodutoRigido, PRECOS_CASA.eletrodutoRigido32mm),
    criarItem('3.9.3', 'Eletroduto flexível 3/4", tipo garganta', 'm', metrosEletrodutoFlexivel, PRECOS_CASA.eletrodutoFlexivel),
    criarItem('3.9.4', 'Caixa de ligação em PVC rígido 4x4', 'unid', qtdCaixas4x4, PRECOS_CASA.caixaLigacaoPVC4x4),
    criarItem('3.9.5', 'Caixa de ligação em PVC rígido 4x2', 'unid', qtdCaixas4x2, PRECOS_CASA.caixaLigacaoPVC4x2),
    criarItem('3.9.6', 'Cabo isolado PVC, 750 V, - 1,5mm', 'm', metrosCabo1_5mm, PRECOS_CASA.caboIsoladoPVC1_5mm),
    criarItem('3.9.7', 'Cabo isolado PVC, 750 V, - 2,5mm', 'm', metrosCabo2_5mm, PRECOS_CASA.caboIsoladoPVC2_5mm),
    criarItem('3.9.8', 'Cabo isolado PVC, 750 V, - 4,0mm', 'm', metrosCabo4mm, PRECOS_CASA.caboIsoladoPVC4mm),
    criarItem('3.9.9', 'Cabo isolado PVC, 750 V, - 10,0mm', 'm', metrosCabo10mm, PRECOS_CASA.caboIsoladoPVC10mm),
    criarItem('3.9.10', 'Tomada 2P+T 10A - 250V', 'unid', qtdTomadas, PRECOS_CASA.tomada2P),
    criarItem('3.9.11', 'Interruptor simples', 'unid', qtdInterruptores, PRECOS_CASA.interruptor),
    criarItem('3.9.12', 'Luminária completa', 'unid', qtdLuminarias, PRECOS_CASA.luminaria * mult),
  ]);

  // 3.10 PINTURA
  const areaPintura = areaParedes + (areaTotal * 2); // paredes + teto

  const pintura = criarSecao('3.10', 'PINTURA', [
    criarItem('3.10.1', 'Massa corrida PVA', 'm²', areaPintura, PRECOS_CASA.massaCorrePVA),
    criarItem('3.10.2', 'Lixamento de paredes', 'm²', areaPintura, PRECOS_CASA.lixamento),
    criarItem('3.10.3', 'Pintura látex PVA interna', 'm²', areaParedes * 0.6 + areaTotal, PRECOS_CASA.pinturaLatexPVA * mult),
    criarItem('3.10.4', 'Pintura acrílica externa', 'm²', areaParedes * 0.4, PRECOS_CASA.pinturaAcrilica * mult),
  ]);

  // Total geral
  const totalGeral =
    movimentoTerra.subtotal +
    baldrameAlvenaria.subtotal +
    fundacoesEstruturas.subtotal +
    esquadriasFerragens.subtotal +
    cobertura.subtotal +
    revestimentos.subtotal +
    instalacaoHidraulica.subtotal +
    instalacaoSanitaria.subtotal +
    instalacaoEletrica.subtotal +
    pintura.subtotal;

  return {
    movimentoTerra,
    baldrameAlvenaria,
    fundacoesEstruturas,
    esquadriasFerragens,
    cobertura,
    revestimentos,
    instalacaoHidraulica,
    instalacaoSanitaria,
    instalacaoEletrica,
    pintura,
    totalGeral: Math.round(totalGeral * 100) / 100,
  };
}
