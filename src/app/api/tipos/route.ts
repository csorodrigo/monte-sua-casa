import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [tiposTelhado, tiposTijolo, padroesAcabamento] = await Promise.all([
      prisma.tipoTelhado.findMany({ orderBy: { nome: 'asc' } }),
      prisma.tipoTijolo.findMany({ orderBy: { nome: 'asc' } }),
      prisma.padraoAcabamento.findMany({ orderBy: { multiplicadorPreco: 'asc' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tiposTelhado,
        tiposTijolo,
        padroesAcabamento,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar tipos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar tipos' },
      { status: 500 }
    );
  }
}
