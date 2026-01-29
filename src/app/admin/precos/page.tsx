'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TabelaPrecos } from '@/components/admin/TabelaPrecos';
import { useAdminContext } from '../layout';
import { Loader2 } from 'lucide-react';

interface ItemPreco {
  descricao: string;
  unidade: string;
  preco: number;
}

interface SecaoPrecos {
  nome: string;
  itens?: Record<string, ItemPreco>;
  subSecoes?: Record<string, { nome: string; itens: Record<string, ItemPreco> }>;
}

interface ArquivoPrecos {
  versao: string;
  tipo: string;
  fatorAjuste?: number;
  bdiPercentual?: number;
  secoes: Record<string, SecaoPrecos>;
}

type TipoPreco = 'materiais-casa' | 'mao-obra-casa' | 'materiais-muro' | 'mao-obra-muro' | 'materiais-piscina' | 'mao-obra-piscina';

const TIPOS_DISPONIVEIS: { tipo: TipoPreco; label: string; categoria: string }[] = [
  { tipo: 'materiais-casa', label: 'Materiais Casa', categoria: 'casa' },
  { tipo: 'mao-obra-casa', label: 'Mão de Obra Casa', categoria: 'casa' },
  { tipo: 'materiais-muro', label: 'Materiais Muro', categoria: 'muro' },
  { tipo: 'mao-obra-muro', label: 'Mão de Obra Muro', categoria: 'muro' },
  { tipo: 'materiais-piscina', label: 'Materiais Piscina', categoria: 'piscina' },
  { tipo: 'mao-obra-piscina', label: 'Mão de Obra Piscina', categoria: 'piscina' },
];

export default function PrecosPage() {
  const { senha } = useAdminContext();
  const searchParams = useSearchParams();
  const categoriaInicial = searchParams.get('categoria') || 'casa';

  const [tipoSelecionado, setTipoSelecionado] = useState<TipoPreco>(
    categoriaInicial === 'casa' ? 'materiais-casa' :
    categoriaInicial === 'muro' ? 'materiais-muro' :
    'materiais-piscina'
  );
  const [dados, setDados] = useState<ArquivoPrecos | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregarPrecos = useCallback(async (tipo: TipoPreco) => {
    if (!senha) return;

    setCarregando(true);
    setErro('');

    try {
      const res = await fetch(`/api/admin/precos?tipo=${tipo}`, {
        headers: { 'x-admin-password': senha }
      });

      if (res.ok) {
        const data = await res.json();
        setDados(data);
      } else if (res.status === 404) {
        setDados(null);
        setErro('Arquivo de preços não encontrado. Importe uma planilha Excel primeiro.');
      } else {
        const errorData = await res.json();
        setErro(errorData.error || 'Erro ao carregar preços');
      }
    } catch (e) {
      setErro('Erro de conexão');
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, [senha]);

  useEffect(() => {
    carregarPrecos(tipoSelecionado);
  }, [tipoSelecionado, carregarPrecos]);

  const handleAtualizarPreco = async (
    secao: string,
    itemKey: string,
    novoPreco: number,
    subSecao?: string
  ) => {
    if (!senha) return;

    setSalvando(true);
    try {
      const res = await fetch('/api/admin/precos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': senha
        },
        body: JSON.stringify({
          tipo: tipoSelecionado,
          secao,
          itemKey,
          novoPreco,
          subSecao
        })
      });

      if (res.ok) {
        // Recarrega os dados
        await carregarPrecos(tipoSelecionado);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Erro ao atualizar preço');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemoverItem = async (
    secao: string,
    itemKey: string,
    subSecao?: string
  ) => {
    if (!senha) return;

    setSalvando(true);
    try {
      const res = await fetch('/api/admin/precos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': senha
        },
        body: JSON.stringify({
          tipo: tipoSelecionado,
          secao,
          itemKey,
          subSecao
        })
      });

      if (res.ok) {
        await carregarPrecos(tipoSelecionado);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Erro ao remover item');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSalvando(false);
    }
  };

  const handleAdicionarItem = async (
    secao: string,
    itemKey: string,
    item: ItemPreco,
    subSecao?: string
  ) => {
    if (!senha) return;

    setSalvando(true);
    try {
      const res = await fetch('/api/admin/precos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': senha
        },
        body: JSON.stringify({
          tipo: tipoSelecionado,
          secao,
          itemKey,
          item,
          subSecao
        })
      });

      if (res.ok) {
        await carregarPrecos(tipoSelecionado);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Erro ao adicionar item');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSalvando(false);
    }
  };

  const tiposCategoria = (categoria: string) =>
    TIPOS_DISPONIVEIS.filter(t => t.categoria === categoria);

  const contarItens = (secoes: Record<string, SecaoPrecos>) => {
    let count = 0;
    for (const secao of Object.values(secoes)) {
      if (secao.itens) count += Object.keys(secao.itens).length;
      if (secao.subSecoes) {
        for (const sub of Object.values(secao.subSecoes)) {
          count += Object.keys(sub.itens).length;
        }
      }
    }
    return count;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Preços</h1>
        <p className="text-muted-foreground">
          Edite os preços de materiais e mão de obra
        </p>
      </div>

      <Tabs
        defaultValue={categoriaInicial}
        onValueChange={(cat) => {
          const primeiroTipo = tiposCategoria(cat)[0];
          if (primeiroTipo) setTipoSelecionado(primeiroTipo.tipo);
        }}
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="casa">Casa</TabsTrigger>
          <TabsTrigger value="muro">Muro</TabsTrigger>
          <TabsTrigger value="piscina">Piscina</TabsTrigger>
        </TabsList>

        {['casa', 'muro', 'piscina'].map((categoria) => (
          <TabsContent key={categoria} value={categoria} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tiposCategoria(categoria).map((t) => (
                <button
                  key={t.tipo}
                  onClick={() => setTipoSelecionado(t.tipo)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${tipoSelecionado === t.tipo
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {TIPOS_DISPONIVEIS.find(t => t.tipo === tipoSelecionado)?.label}
                    </CardTitle>
                    <CardDescription>
                      {dados?.versao && `Versão: ${dados.versao}`}
                      {dados?.fatorAjuste && ` • Fator de ajuste: ${(dados.fatorAjuste * 100).toFixed(2)}%`}
                      {dados?.bdiPercentual && ` • BDI: ${dados.bdiPercentual}%`}
                    </CardDescription>
                  </div>
                  {dados && (
                    <Badge variant="outline">
                      {contarItens(dados.secoes)} itens
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {carregando ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : erro ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{erro}</p>
                  </div>
                ) : dados ? (
                  <div className="relative">
                    {salvando && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                    <TabelaPrecos
                      secoes={dados.secoes}
                      tipo={tipoSelecionado}
                      onAtualizarPreco={handleAtualizarPreco}
                      onRemoverItem={handleRemoverItem}
                      onAdicionarItem={handleAdicionarItem}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Nenhum dado disponível. Importe uma planilha Excel.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
