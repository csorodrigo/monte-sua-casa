import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifica se a senha de admin é válida
 */
export function verificarSenhaAdmin(request: NextRequest): boolean {
  const senha = request.headers.get('x-admin-password');
  const senhaCorreta = process.env.ADMIN_PASSWORD;

  if (!senhaCorreta) {
    console.warn('ADMIN_PASSWORD não configurada no ambiente');
    return false;
  }

  return senha === senhaCorreta;
}

/**
 * Middleware para proteger rotas admin
 * Retorna NextResponse com erro se não autorizado, ou null se autorizado
 */
export function protegerRotaAdmin(request: NextRequest): NextResponse | null {
  if (!verificarSenhaAdmin(request)) {
    return NextResponse.json(
      { error: 'Não autorizado. Senha de administrador inválida.' },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Gera um token de sessão simples (para uso em localStorage no cliente)
 * Não é um sistema de autenticação robusto, apenas para MVP
 */
export function gerarTokenSessao(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Valida o formato da senha (mínimo 6 caracteres)
 */
export function validarFormatoSenha(senha: string): boolean {
  return typeof senha === 'string' && senha.length >= 6;
}
