import { NextRequest, NextResponse } from 'next/server';
import { calcularOrcamentoCompleto } from '@/lib/calculations';
import { DadosSimulacao } from '@/types';
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
