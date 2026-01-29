import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const estados = await prisma.estado.findMany({
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: estados,
    });
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar estados' },
      { status: 500 }
    );
  }
}
