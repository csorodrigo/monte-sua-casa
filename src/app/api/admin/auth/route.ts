import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/auth
 * Verifica a senha de administrador
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senha } = body;

    if (!senha) {
      return NextResponse.json(
        { error: 'Senha não fornecida' },
        { status: 400 }
      );
    }

    const senhaCorreta = process.env.ADMIN_PASSWORD;

    if (!senhaCorreta) {
      return NextResponse.json(
        { error: 'Sistema não configurado. ADMIN_PASSWORD não definida.' },
        { status: 500 }
      );
    }

    if (senha === senhaCorreta) {
      return NextResponse.json({
        success: true,
        message: 'Autenticado com sucesso'
      });
    }

    return NextResponse.json(
      { error: 'Senha incorreta' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar autenticação' },
      { status: 500 }
    );
  }
}
