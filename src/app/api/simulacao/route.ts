import { NextRequest, NextResponse } from 'next/server';
import { calcularOrcamentoCompleto } from '@/lib/calculations';
import { DadosSimulacao } from '@/types';
import {
  getEstadoById,
  getTipoTelhadoById,
  getTipoTijoloById,
  getPadraoAcabamentoById,
} from '@/lib/static-data';

export async function GET() {
  try {
    // Return empty list since we don't have persistent storage
    return NextResponse.json({
      success: true,
      data: [],
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

    // Calcular orcamento
    const resultado = calcularOrcamentoCompleto({
      dados,
      tipoTelhado,
      tipoTijolo,
      padraoAcabamento,
      estado,
    });

    // Return result without persisting (no database in serverless)
    return NextResponse.json({
      success: true,
      data: {
        simulacaoId: Date.now(), // Mock ID
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
