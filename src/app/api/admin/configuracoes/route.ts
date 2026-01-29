import { NextRequest, NextResponse } from 'next/server';
import { protegerRotaAdmin } from '@/lib/admin/auth';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'configuracoes.json');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function lerConfiguracoes(): Promise<any> {
  try {
    const conteudo = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(conteudo);
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function salvarConfiguracoes(dados: any): Promise<void> {
  dados.ultimaAtualizacao = new Date().toISOString();
  dados.versao = new Date().toISOString().split('T')[0];
  await fs.writeFile(CONFIG_PATH, JSON.stringify(dados, null, 2), 'utf-8');
}

/**
 * GET /api/admin/configuracoes
 * Retorna todas as configurações ou uma seção específica
 * Query: ?secao=estados|tiposTelhado|tiposTijolo|tiposJanela|padroesAcabamento|precosBaseMateriais|precosBaseMaoObra
 */
export async function GET(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const config = await lerConfiguracoes();
    if (!config) {
      return NextResponse.json({ error: 'Configurações não encontradas' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const secao = searchParams.get('secao');

    if (secao && config[secao] !== undefined) {
      return NextResponse.json({
        secao,
        dados: config[secao],
        ultimaAtualizacao: config.ultimaAtualizacao
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao ler configurações:', error);
    return NextResponse.json({ error: 'Erro ao ler configurações' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/configuracoes
 * Atualiza uma seção específica das configurações
 * Body: { secao: string, dados: any }
 */
export async function PUT(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const body = await request.json();
    const { secao, dados } = body;

    if (!secao || dados === undefined) {
      return NextResponse.json({ error: 'secao e dados são obrigatórios' }, { status: 400 });
    }

    const config = await lerConfiguracoes();
    if (!config) {
      return NextResponse.json({ error: 'Configurações não encontradas' }, { status: 404 });
    }

    // Validações específicas por seção
    if (secao === 'fatorINCC' && (typeof dados !== 'number' || dados < 0)) {
      return NextResponse.json({ error: 'fatorINCC deve ser um número positivo' }, { status: 400 });
    }

    config[secao] = dados;
    await salvarConfiguracoes(config);

    return NextResponse.json({
      success: true,
      message: `Seção ${secao} atualizada com sucesso`
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/configuracoes
 * Atualiza um item específico dentro de uma seção (para arrays)
 * Body: { secao: string, itemId: number, dados: any } ou { secao: string, chave: string, valor: any }
 */
export async function PATCH(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const body = await request.json();
    const { secao, itemId, dados, chave, valor, subSecao } = body;

    if (!secao) {
      return NextResponse.json({ error: 'secao é obrigatório' }, { status: 400 });
    }

    const config = await lerConfiguracoes();
    if (!config) {
      return NextResponse.json({ error: 'Configurações não encontradas' }, { status: 404 });
    }

    // Atualização de item em array (estados, tipos, etc.)
    if (itemId !== undefined && dados !== undefined) {
      if (!Array.isArray(config[secao])) {
        return NextResponse.json({ error: `${secao} não é um array` }, { status: 400 });
      }

      const index = config[secao].findIndex((item: { id: number }) => item.id === itemId);
      if (index === -1) {
        return NextResponse.json({ error: `Item ${itemId} não encontrado` }, { status: 404 });
      }

      config[secao][index] = { ...config[secao][index], ...dados };
    }
    // Atualização de chave em objeto (preços base)
    else if (chave !== undefined && valor !== undefined) {
      if (subSecao) {
        if (!config[secao]?.[subSecao]) {
          return NextResponse.json({ error: `Subseção ${subSecao} não encontrada` }, { status: 404 });
        }
        config[secao][subSecao][chave] = valor;
      } else {
        if (typeof config[secao] !== 'object' || Array.isArray(config[secao])) {
          return NextResponse.json({ error: `${secao} não é um objeto` }, { status: 400 });
        }
        config[secao][chave] = valor;
      }
    } else {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    await salvarConfiguracoes(config);

    return NextResponse.json({
      success: true,
      message: 'Configuração atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 });
  }
}

/**
 * POST /api/admin/configuracoes
 * Adiciona um novo item a uma seção (para arrays)
 * Body: { secao: string, dados: any }
 */
export async function POST(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const body = await request.json();
    const { secao, dados } = body;

    if (!secao || !dados) {
      return NextResponse.json({ error: 'secao e dados são obrigatórios' }, { status: 400 });
    }

    const config = await lerConfiguracoes();
    if (!config) {
      return NextResponse.json({ error: 'Configurações não encontradas' }, { status: 404 });
    }

    if (!Array.isArray(config[secao])) {
      return NextResponse.json({ error: `${secao} não é um array` }, { status: 400 });
    }

    // Gera novo ID
    const maxId = config[secao].reduce((max: number, item: { id: number }) => Math.max(max, item.id || 0), 0);
    const novoItem = { ...dados, id: maxId + 1 };

    config[secao].push(novoItem);
    await salvarConfiguracoes(config);

    return NextResponse.json({
      success: true,
      message: 'Item adicionado com sucesso',
      item: novoItem
    });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    return NextResponse.json({ error: 'Erro ao adicionar item' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/configuracoes
 * Remove um item de uma seção (para arrays)
 * Body: { secao: string, itemId: number }
 */
export async function DELETE(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const body = await request.json();
    const { secao, itemId } = body;

    if (!secao || itemId === undefined) {
      return NextResponse.json({ error: 'secao e itemId são obrigatórios' }, { status: 400 });
    }

    const config = await lerConfiguracoes();
    if (!config) {
      return NextResponse.json({ error: 'Configurações não encontradas' }, { status: 404 });
    }

    if (!Array.isArray(config[secao])) {
      return NextResponse.json({ error: `${secao} não é um array` }, { status: 400 });
    }

    const index = config[secao].findIndex((item: { id: number }) => item.id === itemId);
    if (index === -1) {
      return NextResponse.json({ error: `Item ${itemId} não encontrado` }, { status: 404 });
    }

    config[secao].splice(index, 1);
    await salvarConfiguracoes(config);

    return NextResponse.json({
      success: true,
      message: 'Item removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return NextResponse.json({ error: 'Erro ao remover item' }, { status: 500 });
  }
}
