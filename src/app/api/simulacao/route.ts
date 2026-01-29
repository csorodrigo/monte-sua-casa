import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calcularOrcamentoCompleto } from '@/lib/calculations';
import { DadosSimulacao } from '@/types';

export async function GET() {
  try {
    const simulacoes = await prisma.simulacao.findMany({
      include: {
        estado: true,
        tipoTelhado: true,
        tipoTijolo: true,
        padraoAcabamento: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: simulacoes,
    });
  } catch (error) {
    console.error('Erro ao listar simulacoes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar simulacoes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const dados: DadosSimulacao = await request.json();

    // Buscar dados do banco
    const [estado, tipoTelhado, tipoTijolo, padraoAcabamento] = await Promise.all([
      prisma.estado.findUnique({ where: { id: dados.estadoId } }),
      prisma.tipoTelhado.findUnique({ where: { id: dados.tipoTelhadoId } }),
      prisma.tipoTijolo.findUnique({ where: { id: dados.tipoTijoloId } }),
      prisma.padraoAcabamento.findUnique({ where: { id: dados.padraoAcabamentoId } }),
    ]);

    if (!estado || !tipoTelhado || !tipoTijolo || !padraoAcabamento) {
      return NextResponse.json(
        { success: false, error: 'Dados de referencia nao encontrados' },
        { status: 400 }
      );
    }

    // Calcular orcamento
    const resultado = calcularOrcamentoCompleto({
      dados,
      tipoTelhado,
      tipoTijolo,
      padraoAcabamento,
      estado,
    });

    // Salvar simulacao
    const simulacao = await prisma.simulacao.create({
      data: {
        estadoId: dados.estadoId,
        tipoTelhadoId: dados.tipoTelhadoId,
        tipoTijoloId: dados.tipoTijoloId,
        padraoAcabamentoId: dados.padraoAcabamentoId,
        incluirRebocoExterno: dados.reboco.externo,
        incluirRebocoInterno: dados.reboco.interno,
        comodos: JSON.stringify(dados.comodos),
        incluirMuro: dados.muro.incluir,
        muroFrente: dados.muro.frente,
        muroFundo: dados.muro.fundo,
        muroDireita: dados.muro.direita,
        muroEsquerda: dados.muro.esquerda,
        muroAltura: dados.muro.altura,
        incluirPiscina: dados.piscina.incluir,
        piscinaLargura: dados.piscina.largura,
        piscinaComprimento: dados.piscina.comprimento,
        piscinaProfundidade: dados.piscina.profundidade,
        areaTotalConstruida: resultado.areaTotalConstruida,
        totalMateriais: resultado.totalMateriais,
        totalMaoObra: resultado.totalMaoObra,
        totalGeral: resultado.totalGeral,
        breakdown: JSON.stringify(resultado.breakdown),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        simulacaoId: simulacao.id,
        resultado,
      },
    });
  } catch (error) {
    console.error('Erro ao salvar simulacao:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar simulacao' },
      { status: 500 }
    );
  }
}
