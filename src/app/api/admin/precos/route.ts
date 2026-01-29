import { NextRequest, NextResponse } from 'next/server';
import { protegerRotaAdmin } from '@/lib/admin/auth';
import {
  lerPrecos,
  salvarPrecos,
  atualizarPrecoItem,
  adicionarPrecoItem,
  removerPrecoItem,
  listarTiposArquivo,
  ArquivoPrecos
} from '@/lib/admin/precos-json';

/**
 * GET /api/admin/precos
 * Lista preços por tipo
 * Query params: tipo (materiais-casa, mao-obra-casa, etc.)
 */
export async function GET(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    if (!tipo) {
      // Retorna lista de tipos disponíveis
      const tipos = listarTiposArquivo();
      return NextResponse.json({ tipos });
    }

    const dados = await lerPrecos(tipo);

    if (!dados) {
      return NextResponse.json(
        { error: `Arquivo de preços não encontrado: ${tipo}` },
        { status: 404 }
      );
    }

    return NextResponse.json(dados);
  } catch (error) {
    console.error('Erro ao ler preços:', error);
    return NextResponse.json(
      { error: 'Erro ao ler preços' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/precos
 * Adiciona ou substitui arquivo de preços completo
 * Body: { tipo: string, dados: ArquivoPrecos }
 */
export async function POST(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const body = await request.json();
    const { tipo, dados } = body as { tipo: string; dados: ArquivoPrecos };

    if (!tipo || !dados) {
      return NextResponse.json(
        { error: 'Tipo e dados são obrigatórios' },
        { status: 400 }
      );
    }

    await salvarPrecos(tipo, dados);

    return NextResponse.json({
      success: true,
      message: `Preços do tipo ${tipo} salvos com sucesso`
    });
  } catch (error) {
    console.error('Erro ao salvar preços:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar preços' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/precos
 * Atualiza um item específico de preço
 * Body: { tipo, secao, itemKey, novoPreco, subSecao? }
 */
export async function PUT(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const body = await request.json();
    const { tipo, secao, itemKey, novoPreco, subSecao } = body;

    if (!tipo || !secao || !itemKey || novoPreco === undefined) {
      return NextResponse.json(
        { error: 'tipo, secao, itemKey e novoPreco são obrigatórios' },
        { status: 400 }
      );
    }

    if (typeof novoPreco !== 'number' || novoPreco < 0) {
      return NextResponse.json(
        { error: 'novoPreco deve ser um número não negativo' },
        { status: 400 }
      );
    }

    await atualizarPrecoItem(tipo, secao, itemKey, novoPreco, subSecao);

    return NextResponse.json({
      success: true,
      message: `Preço do item ${itemKey} atualizado para ${novoPreco}`
    });
  } catch (error) {
    console.error('Erro ao atualizar preço:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro ao atualizar preço';
    return NextResponse.json(
      { error: mensagem },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/precos
 * Remove um item de preço
 * Body: { tipo, secao, itemKey, subSecao? }
 */
export async function DELETE(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const body = await request.json();
    const { tipo, secao, itemKey, subSecao } = body;

    if (!tipo || !secao || !itemKey) {
      return NextResponse.json(
        { error: 'tipo, secao e itemKey são obrigatórios' },
        { status: 400 }
      );
    }

    await removerPrecoItem(tipo, secao, itemKey, subSecao);

    return NextResponse.json({
      success: true,
      message: `Item ${itemKey} removido com sucesso`
    });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro ao remover item';
    return NextResponse.json(
      { error: mensagem },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/precos
 * Adiciona um novo item de preço
 * Body: { tipo, secao, itemKey, item: { descricao, unidade, preco }, subSecao? }
 */
export async function PATCH(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const body = await request.json();
    const { tipo, secao, itemKey, item, subSecao } = body;

    if (!tipo || !secao || !itemKey || !item) {
      return NextResponse.json(
        { error: 'tipo, secao, itemKey e item são obrigatórios' },
        { status: 400 }
      );
    }

    if (!item.descricao || !item.unidade || item.preco === undefined) {
      return NextResponse.json(
        { error: 'item deve conter descricao, unidade e preco' },
        { status: 400 }
      );
    }

    await adicionarPrecoItem(tipo, secao, itemKey, item, subSecao);

    return NextResponse.json({
      success: true,
      message: `Item ${itemKey} adicionado com sucesso`
    });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro ao adicionar item';
    return NextResponse.json(
      { error: mensagem },
      { status: 500 }
    );
  }
}
