import { promises as fs } from 'fs';
import path from 'path';

// Caminho base para os arquivos de dados
const DATA_DIR = path.join(process.cwd(), 'data');

// Tipos
export interface ItemPreco {
  descricao: string;
  unidade: string;
  preco: number;
}

export interface SecaoPrecos {
  nome: string;
  itens?: Record<string, ItemPreco>;
  subSecoes?: Record<string, { nome: string; itens: Record<string, ItemPreco> }>;
}

export interface ArquivoPrecos {
  versao: string;
  tipo: string;
  fatorAjuste?: number;
  bdiPercentual?: number;
  secoes: Record<string, SecaoPrecos>;
}

export interface ConfiguracaoGeral {
  versao: string;
  ultimaAtualizacao: string;
  fonte: string;
  configuracoes: {
    fatorAjusteMateriais: number;
    bdiPercentual: number;
    moeda: string;
    locale: string;
  };
  importacoes: Array<{
    data: string;
    arquivo: string;
    tipo: string;
    itensAtualizados: number;
  }>;
}

// Mapeia tipos de arquivo para nomes de arquivo JSON
const ARQUIVO_MAP: Record<string, string> = {
  'materiais-casa': 'precos-materiais-casa.json',
  'mao-obra-casa': 'precos-mao-obra-casa.json',
  'materiais-muro': 'precos-materiais-muro.json',
  'mao-obra-muro': 'precos-mao-obra-muro.json',
  'materiais-piscina': 'precos-materiais-piscina.json',
  'mao-obra-piscina': 'precos-mao-obra-piscina.json',
};

/**
 * Garante que o diretório de dados existe
 */
async function garantirDiretorio(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Lê um arquivo de preços
 */
export async function lerPrecos(tipo: string): Promise<ArquivoPrecos | null> {
  const arquivo = ARQUIVO_MAP[tipo];
  if (!arquivo) {
    throw new Error(`Tipo de arquivo desconhecido: ${tipo}`);
  }

  const caminhoCompleto = path.join(DATA_DIR, arquivo);

  try {
    const conteudo = await fs.readFile(caminhoCompleto, 'utf-8');
    return JSON.parse(conteudo) as ArquivoPrecos;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Escreve um arquivo de preços
 */
export async function salvarPrecos(tipo: string, dados: ArquivoPrecos): Promise<void> {
  const arquivo = ARQUIVO_MAP[tipo];
  if (!arquivo) {
    throw new Error(`Tipo de arquivo desconhecido: ${tipo}`);
  }

  await garantirDiretorio();

  const caminhoCompleto = path.join(DATA_DIR, arquivo);
  const conteudo = JSON.stringify(dados, null, 2);
  await fs.writeFile(caminhoCompleto, conteudo, 'utf-8');
}

/**
 * Lê a configuração geral
 */
export async function lerConfiguracao(): Promise<ConfiguracaoGeral | null> {
  const caminhoCompleto = path.join(DATA_DIR, 'config.json');

  try {
    const conteudo = await fs.readFile(caminhoCompleto, 'utf-8');
    return JSON.parse(conteudo) as ConfiguracaoGeral;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Salva a configuração geral
 */
export async function salvarConfiguracao(dados: ConfiguracaoGeral): Promise<void> {
  await garantirDiretorio();

  const caminhoCompleto = path.join(DATA_DIR, 'config.json');
  const conteudo = JSON.stringify(dados, null, 2);
  await fs.writeFile(caminhoCompleto, conteudo, 'utf-8');
}

/**
 * Atualiza um item específico de preço
 */
export async function atualizarPrecoItem(
  tipo: string,
  secao: string,
  itemKey: string,
  novoPreco: number,
  subSecao?: string
): Promise<void> {
  const dados = await lerPrecos(tipo);
  if (!dados) {
    throw new Error(`Arquivo de preços não encontrado: ${tipo}`);
  }

  const secaoObj = dados.secoes[secao];
  if (!secaoObj) {
    throw new Error(`Seção não encontrada: ${secao}`);
  }

  if (subSecao) {
    // É uma subseção (ex: revestimentos.parede)
    const subSecaoObj = secaoObj.subSecoes?.[subSecao];
    if (!subSecaoObj) {
      throw new Error(`Subseção não encontrada: ${subSecao}`);
    }
    const item = subSecaoObj.itens[itemKey];
    if (!item) {
      throw new Error(`Item não encontrado: ${itemKey}`);
    }
    subSecaoObj.itens[itemKey].preco = novoPreco;
  } else {
    // É um item direto
    const item = secaoObj.itens?.[itemKey];
    if (!item) {
      throw new Error(`Item não encontrado: ${itemKey}`);
    }
    secaoObj.itens![itemKey].preco = novoPreco;
  }

  // Atualiza versão
  dados.versao = new Date().toISOString().split('T')[0];

  await salvarPrecos(tipo, dados);
}

/**
 * Adiciona um novo item de preço
 */
export async function adicionarPrecoItem(
  tipo: string,
  secao: string,
  itemKey: string,
  item: ItemPreco,
  subSecao?: string
): Promise<void> {
  const dados = await lerPrecos(tipo);
  if (!dados) {
    throw new Error(`Arquivo de preços não encontrado: ${tipo}`);
  }

  const secaoObj = dados.secoes[secao];
  if (!secaoObj) {
    throw new Error(`Seção não encontrada: ${secao}`);
  }

  if (subSecao) {
    const subSecaoObj = secaoObj.subSecoes?.[subSecao];
    if (!subSecaoObj) {
      throw new Error(`Subseção não encontrada: ${subSecao}`);
    }
    subSecaoObj.itens[itemKey] = item;
  } else {
    if (!secaoObj.itens) {
      secaoObj.itens = {};
    }
    secaoObj.itens[itemKey] = item;
  }

  dados.versao = new Date().toISOString().split('T')[0];
  await salvarPrecos(tipo, dados);
}

/**
 * Remove um item de preço
 */
export async function removerPrecoItem(
  tipo: string,
  secao: string,
  itemKey: string,
  subSecao?: string
): Promise<void> {
  const dados = await lerPrecos(tipo);
  if (!dados) {
    throw new Error(`Arquivo de preços não encontrado: ${tipo}`);
  }

  const secaoObj = dados.secoes[secao];
  if (!secaoObj) {
    throw new Error(`Seção não encontrada: ${secao}`);
  }

  if (subSecao) {
    const subSecaoObj = secaoObj.subSecoes?.[subSecao];
    if (subSecaoObj?.itens[itemKey]) {
      delete subSecaoObj.itens[itemKey];
    }
  } else {
    if (secaoObj.itens?.[itemKey]) {
      delete secaoObj.itens[itemKey];
    }
  }

  dados.versao = new Date().toISOString().split('T')[0];
  await salvarPrecos(tipo, dados);
}

/**
 * Lista todos os tipos de arquivos disponíveis
 */
export function listarTiposArquivo(): string[] {
  return Object.keys(ARQUIVO_MAP);
}

/**
 * Verifica se um arquivo de preços existe
 */
export async function arquivoExiste(tipo: string): Promise<boolean> {
  const dados = await lerPrecos(tipo);
  return dados !== null;
}

/**
 * Converte preços JSON para formato usado nos cálculos (TypeScript)
 */
export function converterParaFormatoCalculo(dados: ArquivoPrecos): Record<string, Record<string, number>> {
  const resultado: Record<string, Record<string, number>> = {};

  for (const [secaoKey, secao] of Object.entries(dados.secoes)) {
    if (secao.itens) {
      resultado[secaoKey] = {};
      for (const [itemKey, item] of Object.entries(secao.itens)) {
        resultado[secaoKey][itemKey] = item.preco;
      }
    }

    if (secao.subSecoes) {
      resultado[secaoKey] = {};
      for (const [subKey, subSecao] of Object.entries(secao.subSecoes)) {
        resultado[secaoKey][subKey] = {};
        for (const [itemKey, item] of Object.entries(subSecao.itens)) {
          (resultado[secaoKey] as Record<string, Record<string, number>>)[subKey] =
            (resultado[secaoKey] as Record<string, Record<string, number>>)[subKey] || {};
          (resultado[secaoKey] as Record<string, Record<string, number>>)[subKey][itemKey] = item.preco;
        }
      }
    }
  }

  return resultado;
}
