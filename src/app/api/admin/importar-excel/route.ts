import { NextRequest, NextResponse } from 'next/server';
import { protegerRotaAdmin } from '@/lib/admin/auth';
import {
  salvarPrecos,
  lerConfiguracao,
  salvarConfiguracao,
  ArquivoPrecos,
  ConfiguracaoGeral
} from '@/lib/admin/precos-json';
import * as XLSX from 'xlsx';

// Mapeamento das abas do Excel para tipos de arquivo
const ABA_PARA_TIPO: Record<string, string> = {
  'ORÇAMENTO - CASA': 'materiais-casa',
  'ORCAMENTO - CASA': 'materiais-casa',
  'MÃO DE OBRA - CASA': 'mao-obra-casa',
  'MAO DE OBRA - CASA': 'mao-obra-casa',
  'ORÇAMENTO MURO': 'materiais-muro',
  'ORCAMENTO MURO': 'materiais-muro',
  'MÃO DE OBRA MURO': 'mao-obra-muro',
  'MAO DE OBRA MURO': 'mao-obra-muro',
  'PISCINA': 'materiais-piscina',
  'MÃO DE OBRA - PISCINA': 'mao-obra-piscina',
  'MAO DE OBRA - PISCINA': 'mao-obra-piscina',
};

// Seções esperadas por tipo de arquivo
const SECOES_POR_TIPO: Record<string, string[]> = {
  'materiais-casa': [
    'movimentoTerra', 'baldrameAlvenaria', 'fundacoesEstruturas',
    'esquadriasFerragens', 'cobertura', 'revestimentos',
    'instalacaoHidraulica', 'instalacaoSanitaria', 'instalacaoEletrica',
    'gasGlp', 'pintura', 'churrasqueira', 'limpezaObra'
  ],
  'mao-obra-casa': [
    'movimentoTerra', 'baldrameAlvenaria', 'fundacoesEstruturas',
    'esquadriasFerragens', 'cobertura', 'revestimentos',
    'instalacaoHidraulica', 'instalacaoSanitaria', 'instalacaoEletrica',
    'gasGlp', 'pintura', 'churrasqueira', 'limpezaObra'
  ]
};

interface ResultadoParsing {
  tipo: string;
  dados: ArquivoPrecos;
  itensEncontrados: number;
}

interface ResultadoImportacao {
  success: boolean;
  arquivosProcessados: string[];
  erros: string[];
  preview?: ResultadoParsing[];
}

/**
 * Converte nome de seção do Excel para chave do JSON
 */
function normalizarNomeSecao(nome: string): string {
  const mapa: Record<string, string> = {
    'MOVIMENTO DE TERRA': 'movimentoTerra',
    '01. MOVIMENTO DE TERRA': 'movimentoTerra',
    'BALDRAME E ALVENARIA': 'baldrameAlvenaria',
    '02. BALDRAME E ALVENARIA': 'baldrameAlvenaria',
    'FUNDAÇÕES E ESTRUTURAS': 'fundacoesEstruturas',
    '03. FUNDAÇÕES E ESTRUTURAS': 'fundacoesEstruturas',
    'ESQUADRIAS E FERRAGENS': 'esquadriasFerragens',
    '04. ESQUADRIAS E FERRAGENS': 'esquadriasFerragens',
    'COBERTURA': 'cobertura',
    '05. COBERTURA': 'cobertura',
    'REVESTIMENTOS': 'revestimentos',
    '06. REVESTIMENTOS': 'revestimentos',
    'INSTALAÇÃO HIDRÁULICA': 'instalacaoHidraulica',
    '07. INSTALAÇÃO HIDRÁULICA': 'instalacaoHidraulica',
    'INSTALACAO HIDRAULICA': 'instalacaoHidraulica',
    'INSTALAÇÃO SANITÁRIA': 'instalacaoSanitaria',
    '08. INSTALAÇÃO SANITÁRIA': 'instalacaoSanitaria',
    'INSTALACAO SANITARIA': 'instalacaoSanitaria',
    'INSTALAÇÃO ELÉTRICA': 'instalacaoEletrica',
    '09. INSTALAÇÃO ELÉTRICA': 'instalacaoEletrica',
    'INSTALACAO ELETRICA': 'instalacaoEletrica',
    'GÁS GLP': 'gasGlp',
    '10. GÁS GLP': 'gasGlp',
    'GAS GLP': 'gasGlp',
    'PINTURA': 'pintura',
    '11. PINTURA': 'pintura',
    'CHURRASQUEIRA': 'churrasqueira',
    '12. CHURRASQUEIRA': 'churrasqueira',
    'LIMPEZA DA OBRA': 'limpezaObra',
    '13. LIMPEZA DA OBRA': 'limpezaObra',
  };

  const nomeUpper = nome.toUpperCase().trim();
  for (const [padrao, chave] of Object.entries(mapa)) {
    if (nomeUpper.includes(padrao.toUpperCase())) {
      return chave;
    }
  }

  // Gera chave camelCase do nome
  return nome
    .toLowerCase()
    .replace(/[áàâã]/g, 'a')
    .replace(/[éèê]/g, 'e')
    .replace(/[íìî]/g, 'i')
    .replace(/[óòôõ]/g, 'o')
    .replace(/[úùû]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .map((palavra, index) =>
      index === 0 ? palavra : palavra.charAt(0).toUpperCase() + palavra.slice(1)
    )
    .join('');
}

/**
 * Converte descrição do item para chave do JSON
 */
function gerarChaveItem(descricao: string): string {
  return descricao
    .toLowerCase()
    .replace(/[áàâã]/g, 'a')
    .replace(/[éèê]/g, 'e')
    .replace(/[íìî]/g, 'i')
    .replace(/[óòôõ]/g, 'o')
    .replace(/[úùû]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(p => p.length > 2) // Remove palavras muito curtas
    .slice(0, 4) // Máximo 4 palavras
    .map((palavra, index) =>
      index === 0 ? palavra : palavra.charAt(0).toUpperCase() + palavra.slice(1)
    )
    .join('');
}

/**
 * Parseia uma aba do Excel
 */
function parsearAba(
  worksheet: XLSX.WorkSheet,
  nomeAba: string,
  tipo: string
): ResultadoParsing {
  const dados: ArquivoPrecos = {
    versao: new Date().toISOString().split('T')[0],
    tipo,
    fatorAjuste: tipo.includes('materiais') ? 0.0079 : undefined,
    bdiPercentual: tipo.includes('mao-obra') ? 14.4 : undefined,
    secoes: {}
  };

  // Converte para array de arrays
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const linhas: (string | number | null)[][] = [];

  for (let r = range.s.r; r <= range.e.r; r++) {
    const linha: (string | number | null)[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const celula = worksheet[XLSX.utils.encode_cell({ r, c })];
      linha.push(celula ? celula.v : null);
    }
    linhas.push(linha);
  }

  let secaoAtual: string | null = null;
  let subSecaoAtual: string | null = null;
  let itensEncontrados = 0;

  // Encontra as colunas de descrição, unidade e preço
  let colDescricao = 1;
  let colUnidade = 2;
  let colPreco = 4; // Normalmente coluna E (índice 4)

  // Procura pelo cabeçalho para identificar colunas
  for (let i = 0; i < Math.min(20, linhas.length); i++) {
    const linha = linhas[i];
    for (let j = 0; j < linha.length; j++) {
      const valor = String(linha[j] || '').toUpperCase();
      if (valor.includes('DESCRIÇÃO') || valor.includes('DESCRICAO')) {
        colDescricao = j;
      }
      if (valor === 'UN' || valor === 'UNIDADE' || valor === 'UN.') {
        colUnidade = j;
      }
      if (valor.includes('PREÇO') || valor.includes('PRECO') || valor.includes('UNITÁRIO')) {
        colPreco = j;
      }
    }
  }

  // Processa cada linha
  for (const linha of linhas) {
    const primeiraCol = String(linha[0] || '').trim();
    const segundaCol = String(linha[1] || '').trim();

    // Detecta seção principal (ex: "01. MOVIMENTO DE TERRA")
    if (/^\d{2}\./.test(primeiraCol) || primeiraCol.toUpperCase() === segundaCol.toUpperCase() && segundaCol.length > 5) {
      const nomeSecao = primeiraCol || segundaCol;
      secaoAtual = normalizarNomeSecao(nomeSecao);
      subSecaoAtual = null;

      if (!dados.secoes[secaoAtual]) {
        dados.secoes[secaoAtual] = {
          nome: nomeSecao,
          itens: {}
        };
      }
      continue;
    }

    // Detecta subseção (ex: "6.1 PAREDE")
    if (/^\d+\.\d+\s/.test(primeiraCol) && !linha[colPreco]) {
      if (secaoAtual && secaoAtual === 'revestimentos') {
        const nomeSubSecao = primeiraCol.replace(/^\d+\.\d+\s*/, '').toLowerCase();
        subSecaoAtual = nomeSubSecao.includes('parede') ? 'parede'
          : nomeSubSecao.includes('teto') ? 'teto'
            : nomeSubSecao.includes('piso') ? 'pisos'
              : normalizarNomeSecao(nomeSubSecao);

        if (!dados.secoes[secaoAtual].subSecoes) {
          dados.secoes[secaoAtual].subSecoes = {};
          delete dados.secoes[secaoAtual].itens;
        }
        if (!dados.secoes[secaoAtual].subSecoes![subSecaoAtual]) {
          dados.secoes[secaoAtual].subSecoes![subSecaoAtual] = {
            nome: primeiraCol,
            itens: {}
          };
        }
      }
      continue;
    }

    // Detecta item (tem código numérico e preço)
    const codigo = String(linha[0] || '');
    const descricao = String(linha[colDescricao] || '').trim();
    const unidade = String(linha[colUnidade] || '').trim();
    const precoRaw = linha[colPreco];

    // Verifica se é uma linha de item válida
    if (descricao && unidade && precoRaw !== null && precoRaw !== undefined) {
      const preco = typeof precoRaw === 'number' ? precoRaw : parseFloat(String(precoRaw).replace(',', '.'));

      if (!isNaN(preco) && preco > 0 && secaoAtual) {
        const chaveItem = gerarChaveItem(descricao);

        const item = {
          descricao,
          unidade,
          preco
        };

        if (subSecaoAtual && dados.secoes[secaoAtual].subSecoes?.[subSecaoAtual]) {
          dados.secoes[secaoAtual].subSecoes![subSecaoAtual].itens[chaveItem] = item;
        } else if (dados.secoes[secaoAtual].itens) {
          dados.secoes[secaoAtual].itens![chaveItem] = item;
        }

        itensEncontrados++;
      }
    }
  }

  return {
    tipo,
    dados,
    itensEncontrados
  };
}

/**
 * POST /api/admin/importar-excel
 * Importa preços de um arquivo Excel
 */
export async function POST(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File | null;
    const modo = formData.get('modo') as string || 'preview';
    const apenasPreview = modo === 'preview';

    if (!arquivo) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Lê o arquivo
    const buffer = await arquivo.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const resultado: ResultadoImportacao = {
      success: true,
      arquivosProcessados: [],
      erros: [],
      preview: []
    };

    // Processa cada aba relevante
    for (const nomeAba of workbook.SheetNames) {
      const tipo = ABA_PARA_TIPO[nomeAba];

      if (tipo) {
        try {
          const worksheet = workbook.Sheets[nomeAba];
          const parseado = parsearAba(worksheet, nomeAba, tipo);

          if (parseado.itensEncontrados > 0) {
            resultado.preview!.push(parseado);

            if (!apenasPreview) {
              await salvarPrecos(tipo, parseado.dados);
              resultado.arquivosProcessados.push(tipo);
            }
          } else {
            resultado.erros.push(`Aba "${nomeAba}": Nenhum item encontrado`);
          }
        } catch (e) {
          resultado.erros.push(`Erro ao processar aba "${nomeAba}": ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
        }
      }
    }

    // Atualiza configuração se não for preview
    if (!apenasPreview && resultado.arquivosProcessados.length > 0) {
      let config = await lerConfiguracao();

      if (!config) {
        config = {
          versao: new Date().toISOString().split('T')[0],
          ultimaAtualizacao: new Date().toISOString(),
          fonte: arquivo.name,
          configuracoes: {
            fatorAjusteMateriais: 0.0079,
            bdiPercentual: 14.4,
            moeda: 'BRL',
            locale: 'pt-BR'
          },
          importacoes: []
        };
      }

      config.ultimaAtualizacao = new Date().toISOString();
      config.fonte = arquivo.name;
      config.importacoes.push({
        data: new Date().toISOString(),
        arquivo: arquivo.name,
        tipo: 'completa',
        itensAtualizados: resultado.preview!.reduce((acc, p) => acc + p.itensEncontrados, 0)
      });

      await salvarConfiguracao(config);
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao importar Excel:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo Excel' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/importar-excel
 * Retorna informações sobre as abas esperadas
 */
export async function GET(request: NextRequest) {
  const erro = protegerRotaAdmin(request);
  if (erro) return erro;

  return NextResponse.json({
    abasSuportadas: Object.entries(ABA_PARA_TIPO).map(([aba, tipo]) => ({
      nomeAba: aba,
      tipoArquivo: tipo
    })),
    secoesPorTipo: SECOES_POR_TIPO
  });
}
