import { NextRequest, NextResponse } from 'next/server';
import { DadosSimulacao } from '@/types';
import { RelatorioCompleto } from '@/types/relatorios';
import { calcularOrcamentoCasaDetalhado } from '@/lib/calculations/orcamento-detalhado-casa';
import { calcularMaoObraCasaDetalhada } from '@/lib/calculations/mao-de-obra-casa';
import {
  calcularOrcamentoMuroDetalhado,
  calcularMaoObraMuroDetalhada,
} from '@/lib/calculations/orcamento-detalhado-muro';
import {
  calcularOrcamentoPiscinaDetalhado,
  calcularMaoObraPiscinaDetalhada,
} from '@/lib/calculations/orcamento-detalhado-piscina';
import { calcularMemorialEstrutural } from '@/lib/calculations/memorial-calculo-estrutural';
import { areaTotalConstruida, areaTotalParedes, areaTelhado, dimensoesExternas } from '@/lib/calculations';
import {
  getEstadoById,
  getTipoTelhadoById,
  getTipoTijoloById,
  getPadraoAcabamentoById,
} from '@/lib/static-data';

export async function POST(request: NextRequest) {
  try {
    const dados: DadosSimulacao = await request.json();

    // Buscar dados estaticos
    const estado = getEstadoById(dados.estadoId);
    const tipoTelhado = getTipoTelhadoById(dados.tipoTelhadoId);
    const tipoTijolo = getTipoTijoloById(dados.tipoTijoloId);
    const padraoAcabamento = getPadraoAcabamentoById(dados.padraoAcabamentoId);

    if (!estado || !tipoTelhado || !tipoTijolo || !padraoAcabamento) {
      return NextResponse.json(
        { success: false, error: 'Dados de referencia nao encontrados' },
        { status: 400 }
      );
    }

    if (!dados.comodos || dados.comodos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pelo menos um comodo e obrigatorio' },
        { status: 400 }
      );
    }

    // Cálculos base
    const areaTotal = areaTotalConstruida(dados.comodos);
    const areaParedes = areaTotalParedes(dados.comodos);
    const areaTelhadoCalc = areaTelhado(areaTotal);
    const dimensoes = dimensoesExternas(dados.comodos);
    const perimetro = dimensoes.perimetroExterno;

    // Contar cômodos
    const qtdBanheiros = dados.comodos.filter(c =>
      c.nome.toLowerCase().includes('banheiro') ||
      c.nome.toLowerCase().includes('wc') ||
      c.nome.toLowerCase().includes('lavabo')
    ).length || 1;

    const qtdQuartos = dados.comodos.filter(c =>
      c.nome.toLowerCase().includes('quarto') ||
      c.nome.toLowerCase().includes('suite') ||
      c.nome.toLowerCase().includes('dormitorio')
    ).length || 1;

    // Quantidade de pilares (1 a cada 12m²)
    const qtdPilares = Math.max(4, Math.ceil(areaTotal / 12));

    // Área do terreno (estimativa para muro)
    const areaTerreno = dados.muro.incluir
      ? (dados.muro.frente * dados.muro.direita) // Aproximação
      : 150; // Valor padrão

    // ========================================
    // ORÇAMENTO CASA - MATERIAIS
    // ========================================
    const orcamentoCasa = calcularOrcamentoCasaDetalhado({
      areaTotal,
      perimetroExterno: perimetro,
      areaParedes,
      areaTelhado: areaTelhadoCalc,
      qtdPilares,
      qtdBanheiros,
      qtdQuartos,
      tipoTelhado,
      tipoTijolo,
      padraoAcabamento,
      reboco: dados.reboco,
      incluirChurrasqueira: dados.incluirChurrasqueira ?? false,
    });

    // ========================================
    // MÃO DE OBRA CASA
    // ========================================
    const maoObraCasa = calcularMaoObraCasaDetalhada({
      areaTotal,
      perimetroExterno: perimetro,
      areaParedes,
      areaTelhado: areaTelhadoCalc,
      qtdPilares,
      qtdBanheiros,
      qtdQuartos,
      estado,
      padraoAcabamento,
      incluirChurrasqueira: dados.incluirChurrasqueira ?? false,
    });

    // ========================================
    // ORÇAMENTO MURO - MATERIAIS
    // ========================================
    const orcamentoMuro = calcularOrcamentoMuroDetalhado({
      muro: dados.muro,
      areaTerreno,
      incluirPortao: true,
      larguraPortao: 3, // 3 metros padrão
    });

    // ========================================
    // MÃO DE OBRA MURO
    // ========================================
    const maoObraMuro = calcularMaoObraMuroDetalhada(
      {
        muro: dados.muro,
        areaTerreno,
        incluirPortao: true,
        larguraPortao: 3,
      },
      estado
    );

    // ========================================
    // ORÇAMENTO PISCINA - MATERIAIS
    // ========================================
    const orcamentoPiscina = calcularOrcamentoPiscinaDetalhado(dados.piscina);

    // ========================================
    // MÃO DE OBRA PISCINA
    // ========================================
    const maoObraPiscina = calcularMaoObraPiscinaDetalhada(dados.piscina, estado);

    // ========================================
    // MEMORIAL DE CÁLCULO ESTRUTURAL
    // ========================================
    const memorialEstrutural = calcularMemorialEstrutural({
      comodos: dados.comodos,
      tipoTijolo,
    });

    // ========================================
    // RESUMO
    // ========================================
    const totalMateriaisCasa = orcamentoCasa.totalGeral;
    const totalMaoObraCasa = maoObraCasa.totalGeral;
    const totalMateriaisMuro = orcamentoMuro.totalGeral;
    const totalMaoObraMuro = maoObraMuro.totalGeral;
    const totalMateriaisPiscina = orcamentoPiscina.totalGeral;
    const totalMaoObraPiscina = maoObraPiscina.totalGeral;

    const totalGeralMateriais = totalMateriaisCasa + totalMateriaisMuro + totalMateriaisPiscina;
    const totalGeralMaoObra = totalMaoObraCasa + totalMaoObraMuro + totalMaoObraPiscina;
    const totalGeral = totalGeralMateriais + totalGeralMaoObra;

    const relatorio: RelatorioCompleto = {
      resumo: {
        areaTotalConstruida: Math.round(areaTotal * 100) / 100,
        areaParedes: Math.round(areaParedes * 100) / 100,
        areaTelhado: Math.round(areaTelhadoCalc * 100) / 100,
        totalMateriaisCasa: Math.round(totalMateriaisCasa * 100) / 100,
        totalMaoObraCasa: Math.round(totalMaoObraCasa * 100) / 100,
        totalMateriaisMuro: Math.round(totalMateriaisMuro * 100) / 100,
        totalMaoObraMuro: Math.round(totalMaoObraMuro * 100) / 100,
        totalMateriaisPiscina: Math.round(totalMateriaisPiscina * 100) / 100,
        totalMaoObraPiscina: Math.round(totalMaoObraPiscina * 100) / 100,
        totalGeralMateriais: Math.round(totalGeralMateriais * 100) / 100,
        totalGeralMaoObra: Math.round(totalGeralMaoObra * 100) / 100,
        totalGeral: Math.round(totalGeral * 100) / 100,
      },
      orcamentoCasa,
      maoObraCasa,
      orcamentoMuro,
      maoObraMuro,
      orcamentoPiscina,
      maoObraPiscina,
      memorialEstrutural,
    };

    return NextResponse.json({
      success: true,
      data: relatorio,
    });
  } catch (error) {
    console.error('Erro ao gerar relatorio completo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar relatorio completo' },
      { status: 500 }
    );
  }
}
