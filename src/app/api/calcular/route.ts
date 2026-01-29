import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calcularOrcamentoCompleto } from '@/lib/calculations';
import { DadosSimulacao } from '@/types';

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

    // Validar comodos
    if (!dados.comodos || dados.comodos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pelo menos um comodo e obrigatorio' },
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

    return NextResponse.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error('Erro ao calcular orcamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao calcular orcamento' },
      { status: 500 }
    );
  }
}
