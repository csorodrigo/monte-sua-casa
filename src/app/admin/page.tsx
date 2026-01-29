'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  Home,
  Building2,
  Waves,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAdminContext } from './layout';

interface ConfiguracaoGeral {
  versao: string;
  ultimaAtualizacao: string;
  fonte: string;
  importacoes: Array<{
    data: string;
    arquivo: string;
    tipo: string;
    itensAtualizados: number;
  }>;
}

interface Estatisticas {
  totalMateriais: number;
  totalMaoObra: number;
  categorias: {
    casa: { materiais: number; maoObra: number };
    muro: { materiais: number; maoObra: number };
    piscina: { materiais: number; maoObra: number };
  };
}

export default function AdminDashboard() {
  const { senha } = useAdminContext();
  const [config] = useState<ConfiguracaoGeral | null>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      if (!senha) return;

      try {
        // Carrega configuração
        const configRes = await fetch('/api/admin/precos?tipo=materiais-casa', {
          headers: { 'x-admin-password': senha }
        });

        if (configRes.ok) {
          // Conta itens por categoria
          const tipos = ['materiais-casa', 'mao-obra-casa'];
          const stats: Estatisticas = {
            totalMateriais: 0,
            totalMaoObra: 0,
            categorias: {
              casa: { materiais: 0, maoObra: 0 },
              muro: { materiais: 0, maoObra: 0 },
              piscina: { materiais: 0, maoObra: 0 }
            }
          };

          for (const tipo of tipos) {
            const res = await fetch(`/api/admin/precos?tipo=${tipo}`, {
              headers: { 'x-admin-password': senha }
            });
            if (res.ok) {
              const dados = await res.json();
              let count = 0;

              for (const secao of Object.values(dados.secoes || {})) {
                const s = secao as { itens?: Record<string, unknown>; subSecoes?: Record<string, { itens: Record<string, unknown> }> };
                if (s.itens) {
                  count += Object.keys(s.itens).length;
                }
                if (s.subSecoes) {
                  for (const sub of Object.values(s.subSecoes)) {
                    count += Object.keys(sub.itens).length;
                  }
                }
              }

              if (tipo.includes('materiais')) {
                stats.totalMateriais += count;
                if (tipo.includes('casa')) stats.categorias.casa.materiais = count;
                if (tipo.includes('muro')) stats.categorias.muro.materiais = count;
                if (tipo.includes('piscina')) stats.categorias.piscina.materiais = count;
              } else {
                stats.totalMaoObra += count;
                if (tipo.includes('casa')) stats.categorias.casa.maoObra = count;
                if (tipo.includes('muro')) stats.categorias.muro.maoObra = count;
                if (tipo.includes('piscina')) stats.categorias.piscina.maoObra = count;
              }
            }
          }

          setEstatisticas(stats);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [senha]);

  const formatarData = (dataStr: string) => {
    return new Date(dataStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Gerencie os preços e configurações do simulador
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Materiais</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas?.totalMateriais || 0}
            </div>
            <p className="text-xs text-muted-foreground">itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mão de Obra</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas?.totalMaoObra || 0}
            </div>
            <p className="text-xs text-muted-foreground">itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config?.ultimaAtualizacao
                ? formatarData(config.ultimaAtualizacao).split(' ')[0]
                : '29/01/2026'}
            </div>
            <p className="text-xs text-muted-foreground">via Excel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Casa, Muro, Piscina</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards por categoria */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              <CardTitle>Casa</CardTitle>
            </div>
            <CardDescription>Preços de materiais e mão de obra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Materiais</span>
              <Badge variant="secondary">
                {estatisticas?.categorias.casa.materiais || 0} itens
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mão de Obra</span>
              <Badge variant="secondary">
                {estatisticas?.categorias.casa.maoObra || 0} itens
              </Badge>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/precos?categoria=casa">
                Gerenciar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <CardTitle>Muro</CardTitle>
            </div>
            <CardDescription>Preços de materiais e mão de obra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Materiais</span>
              <Badge variant="secondary">
                {estatisticas?.categorias.muro.materiais || 0} itens
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mão de Obra</span>
              <Badge variant="secondary">
                {estatisticas?.categorias.muro.maoObra || 0} itens
              </Badge>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/precos?categoria=muro">
                Gerenciar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-primary" />
              <CardTitle>Piscina</CardTitle>
            </div>
            <CardDescription>Preços de materiais e mão de obra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Materiais</span>
              <Badge variant="secondary">
                {estatisticas?.categorias.piscina.materiais || 0} itens
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mão de Obra</span>
              <Badge variant="secondary">
                {estatisticas?.categorias.piscina.maoObra || 0} itens
              </Badge>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/precos?categoria=piscina">
                Gerenciar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/precos">
              <DollarSign className="w-4 h-4 mr-2" />
              Editar Preços
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/precos/importar">
              <Upload className="w-4 h-4 mr-2" />
              Importar Excel
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Ver Simulador
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de importações */}
      {config?.importacoes && config.importacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Importações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.importacoes.slice(-5).reverse().map((imp, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{imp.arquivo}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatarData(imp.data)}
                      </p>
                    </div>
                  </div>
                  <Badge>{imp.itensAtualizados} itens</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
