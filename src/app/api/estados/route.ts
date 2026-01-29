import { NextResponse } from 'next/server';
import { estados } from '@/lib/static-data';

export async function GET() {
  try {
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
