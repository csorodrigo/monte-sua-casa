import { NextResponse } from 'next/server';
import { tiposTelhado, tiposTijolo, padroesAcabamento } from '@/lib/static-data';

export async function GET() {
  try {
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
