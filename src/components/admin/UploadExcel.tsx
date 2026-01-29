'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';

// Interface for future use when displaying detailed preview
// interface ItemPreview {
//   secaoKey: string;
//   itemKey: string;
//   descricao: string;
//   unidade: string;
//   preco: number;
// }

interface ResultadoParsing {
  tipo: string;
  dados: {
    versao: string;
    secoes: Record<string, {
      nome: string;
      itens?: Record<string, { descricao: string; unidade: string; preco: number }>;
      subSecoes?: Record<string, { nome: string; itens: Record<string, { descricao: string; unidade: string; preco: number }> }>;
    }>;
  };
  itensEncontrados: number;
}

interface ResultadoImportacao {
  success: boolean;
  arquivosProcessados: string[];
  erros: string[];
  preview?: ResultadoParsing[];
}

interface UploadExcelProps {
  senha: string;
}

export function UploadExcel({ senha }: UploadExcelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [preview, setPreview] = useState<ResultadoImportacao | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSelecionarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setErro('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
        return;
      }
      setArquivo(file);
      setErro('');
      setPreview(null);
      setSucesso(false);
    }
  };

  const handlePreview = async () => {
    if (!arquivo) return;

    setCarregando(true);
    setProgresso(10);
    setErro('');

    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      formData.append('modo', 'preview');

      setProgresso(30);

      const response = await fetch('/api/admin/importar-excel', {
        method: 'POST',
        headers: {
          'x-admin-password': senha
        },
        body: formData
      });

      setProgresso(70);

      const resultado: ResultadoImportacao = await response.json();

      if (!response.ok) {
        throw new Error((resultado as { error?: string }).error || 'Erro ao processar arquivo');
      }

      setPreview(resultado);
      setProgresso(100);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar arquivo');
    } finally {
      setCarregando(false);
    }
  };

  const handleImportar = async () => {
    if (!arquivo) return;

    setCarregando(true);
    setProgresso(10);
    setErro('');

    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      formData.append('modo', 'importar');

      setProgresso(30);

      const response = await fetch('/api/admin/importar-excel', {
        method: 'POST',
        headers: {
          'x-admin-password': senha
        },
        body: formData
      });

      setProgresso(70);

      const resultado: ResultadoImportacao = await response.json();

      if (!response.ok) {
        throw new Error((resultado as { error?: string }).error || 'Erro ao importar');
      }

      setProgresso(100);
      setSucesso(true);
      setPreview(resultado);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao importar arquivo');
    } finally {
      setCarregando(false);
    }
  };

  const resetar = () => {
    setArquivo(null);
    setPreview(null);
    setErro('');
    setSucesso(false);
    setProgresso(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const tipoParaLabel = (tipo: string) => {
    const map: Record<string, string> = {
      'materiais-casa': 'Materiais Casa',
      'mao-obra-casa': 'Mão de Obra Casa',
      'materiais-muro': 'Materiais Muro',
      'mao-obra-muro': 'Mão de Obra Muro',
      'materiais-piscina': 'Materiais Piscina',
      'mao-obra-piscina': 'Mão de Obra Piscina'
    };
    return map[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Planilha Excel
          </CardTitle>
          <CardDescription>
            Selecione o arquivo Excel com os preços para importar. O sistema irá
            processar as abas reconhecidas e atualizar os preços.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onClick={() => inputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors hover:border-primary hover:bg-primary/5
              ${arquivo ? 'border-green-500 bg-green-500/5' : 'border-muted-foreground/25'}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleSelecionarArquivo}
              className="hidden"
            />
            {arquivo ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="w-12 h-12 text-green-500" />
                <p className="font-medium">{arquivo.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(arquivo.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-12 h-12 text-muted-foreground" />
                <p className="font-medium">Clique para selecionar um arquivo</p>
                <p className="text-sm text-muted-foreground">
                  Formatos aceitos: .xlsx, .xls
                </p>
              </div>
            )}
          </div>

          {carregando && (
            <div className="space-y-2">
              <Progress value={progresso} />
              <p className="text-sm text-center text-muted-foreground">
                Processando arquivo...
              </p>
            </div>
          )}

          {erro && (
            <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{erro}</p>
            </div>
          )}

          {sucesso && (
            <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Arquivo importado com sucesso!</p>
            </div>
          )}

          <div className="flex gap-2">
            {arquivo && !sucesso && (
              <>
                <Button
                  onClick={handlePreview}
                  disabled={carregando}
                  variant="outline"
                  className="flex-1"
                >
                  {carregando ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  Visualizar Prévia
                </Button>
                <Button
                  onClick={handleImportar}
                  disabled={carregando}
                  className="flex-1"
                >
                  {carregando ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Importar
                </Button>
              </>
            )}
            {(arquivo || preview || sucesso) && (
              <Button onClick={resetar} variant="ghost">
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>
              {sucesso ? 'Resultado da Importação' : 'Prévia da Importação'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview.erros && preview.erros.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Avisos/Erros:</h4>
                <ul className="list-disc pl-5 text-sm text-red-600">
                  {preview.erros.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {preview.preview && preview.preview.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Abas Processadas:</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {preview.preview.map((item, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {tipoParaLabel(item.tipo)}
                          </span>
                          <Badge variant="secondary">
                            {item.itensEncontrados} itens
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {Object.keys(item.dados.secoes).length} seções
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {sucesso && preview.arquivosProcessados && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Arquivos atualizados: {preview.arquivosProcessados.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Abas Reconhecidas</CardTitle>
          <CardDescription>
            O sistema procura pelas seguintes abas no arquivo Excel:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              'ORÇAMENTO - CASA',
              'MÃO DE OBRA - CASA',
              'ORÇAMENTO MURO',
              'MÃO DE OBRA MURO',
              'PISCINA',
              'MÃO DE OBRA - PISCINA'
            ].map((aba) => (
              <div key={aba} className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                {aba}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
