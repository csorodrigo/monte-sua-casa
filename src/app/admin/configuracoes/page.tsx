'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminContext } from '../layout';
import { Loader2, Edit2, Trash2, Plus, Save, X, MapPin, Home, Layers, DoorOpen, Sparkles } from 'lucide-react';

interface Estado {
  id: number;
  nome: string;
  sigla: string;
  cub: number;
}

interface TipoTelhado {
  id: number;
  nome: string;
  precoMaterial: number;
  precoMaoObra: number;
}

interface TipoTijolo {
  id: number;
  nome: string;
  preco: number;
  consumoPorM2: number;
}

interface TipoJanela {
  id: number;
  nome: string;
  preco: number;
}

interface PadraoAcabamento {
  id: number;
  nome: string;
  multiplicador: number;
  precoRevestimentoParede: number;
  precoRevestimentoPiso: number;
  precoPortaEntrada: number;
}

interface Configuracoes {
  fatorINCC: number;
  estados: Estado[];
  tiposTelhado: TipoTelhado[];
  tiposTijolo: TipoTijolo[];
  tiposJanela: TipoJanela[];
  padroesAcabamento: PadraoAcabamento[];
  ultimaAtualizacao: string;
}

export default function ConfiguracoesPage() {
  const { senha } = useAdminContext();
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Estados para edição
  const [editandoEstado, setEditandoEstado] = useState<Estado | null>(null);
  const [editandoTelhado, setEditandoTelhado] = useState<TipoTelhado | null>(null);
  const [editandoTijolo, setEditandoTijolo] = useState<TipoTijolo | null>(null);
  const [editandoJanela, setEditandoJanela] = useState<TipoJanela | null>(null);
  const [editandoPadrao, setEditandoPadrao] = useState<PadraoAcabamento | null>(null);

  // Estado para novo item
  const [dialogNovoAberto, setDialogNovoAberto] = useState(false);
  const [tipoNovo, setTipoNovo] = useState<string>('');

  // Estado para confirmar exclusão
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<{ secao: string; id: number } | null>(null);

  const carregarConfiguracoes = useCallback(async () => {
    if (!senha) return;

    setCarregando(true);
    setErro('');

    try {
      const res = await fetch('/api/admin/configuracoes', {
        headers: { 'x-admin-password': senha }
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      } else {
        setErro('Erro ao carregar configurações');
      }
    } catch {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  }, [senha]);

  useEffect(() => {
    carregarConfiguracoes();
  }, [carregarConfiguracoes]);

  const salvarItem = async (secao: string, itemId: number, dados: Estado | TipoTelhado | TipoTijolo | TipoJanela | PadraoAcabamento) => {
    if (!senha) return;

    setSalvando(true);
    try {
      const res = await fetch('/api/admin/configuracoes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': senha
        },
        body: JSON.stringify({ secao, itemId, dados })
      });

      if (res.ok) {
        await carregarConfiguracoes();
        return true;
      } else {
        alert('Erro ao salvar');
        return false;
      }
    } catch {
      alert('Erro de conexão');
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const adicionarItem = async (secao: string, dados: Partial<Estado | TipoTelhado | TipoTijolo | TipoJanela | PadraoAcabamento>) => {
    if (!senha) return;

    setSalvando(true);
    try {
      const res = await fetch('/api/admin/configuracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': senha
        },
        body: JSON.stringify({ secao, dados })
      });

      if (res.ok) {
        await carregarConfiguracoes();
        setDialogNovoAberto(false);
        return true;
      } else {
        alert('Erro ao adicionar');
        return false;
      }
    } catch {
      alert('Erro de conexão');
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const excluirItem = async (secao: string, itemId: number) => {
    if (!senha) return;

    setSalvando(true);
    try {
      const res = await fetch('/api/admin/configuracoes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': senha
        },
        body: JSON.stringify({ secao, itemId })
      });

      if (res.ok) {
        await carregarConfiguracoes();
        setConfirmandoExclusao(null);
      } else {
        alert('Erro ao excluir');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSalvando(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (erro || !config) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{erro || 'Configurações não encontradas'}</p>
        <Button onClick={carregarConfiguracoes} className="mt-4">Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie tipos, preços e parâmetros do sistema
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Última atualização: {new Date(config.ultimaAtualizacao).toLocaleString('pt-BR')}
        </p>
      </div>

      <Tabs defaultValue="estados">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="estados" className="gap-1">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Estados</span>
          </TabsTrigger>
          <TabsTrigger value="telhados" className="gap-1">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Telhados</span>
          </TabsTrigger>
          <TabsTrigger value="tijolos" className="gap-1">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Tijolos</span>
          </TabsTrigger>
          <TabsTrigger value="janelas" className="gap-1">
            <DoorOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Janelas</span>
          </TabsTrigger>
          <TabsTrigger value="acabamentos" className="gap-1">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Acabamento</span>
          </TabsTrigger>
        </TabsList>

        {/* ESTADOS / CUB */}
        <TabsContent value="estados">
          <Card>
            <CardHeader>
              <CardTitle>Estados e CUB</CardTitle>
              <CardDescription>
                Custo Unitário Básico por estado (usado no cálculo de mão de obra)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium">Fator INCC (ajuste geral)</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    step="0.0001"
                    value={config.fatorINCC}
                    onChange={(e) => setConfig({ ...config, fatorINCC: parseFloat(e.target.value) || 0 })}
                    className="w-32"
                  />
                  <Button
                    size="sm"
                    onClick={async () => {
                      setSalvando(true);
                      try {
                        await fetch('/api/admin/configuracoes', {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-admin-password': senha
                          },
                          body: JSON.stringify({ secao: 'fatorINCC', dados: config.fatorINCC })
                        });
                        await carregarConfiguracoes();
                      } finally {
                        setSalvando(false);
                      }
                    }}
                    disabled={salvando}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Sigla</TableHead>
                    <TableHead className="text-right">CUB (R$)</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.estados.map((estado) => (
                    <TableRow key={estado.id}>
                      <TableCell>{estado.nome}</TableCell>
                      <TableCell>{estado.sigla}</TableCell>
                      <TableCell className="text-right">
                        {editandoEstado?.id === estado.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoEstado.cub}
                            onChange={(e) => setEditandoEstado({ ...editandoEstado, cub: parseFloat(e.target.value) || 0 })}
                            className="w-32 text-right"
                          />
                        ) : (
                          formatarMoeda(estado.cub)
                        )}
                      </TableCell>
                      <TableCell>
                        {editandoEstado?.id === estado.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={async () => {
                                await salvarItem('estados', estado.id, { cub: editandoEstado.cub });
                                setEditandoEstado(null);
                              }}
                              disabled={salvando}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditandoEstado(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditandoEstado(estado)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIPOS DE TELHADO */}
        <TabsContent value="telhados">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Telhado/Coberta</CardTitle>
                <CardDescription>
                  Preços de material e mão de obra por tipo
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => { setTipoNovo('tiposTelhado'); setDialogNovoAberto(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Material (R$/m²)</TableHead>
                    <TableHead className="text-right">Mão de Obra (R$/m²)</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.tiposTelhado.map((tipo) => (
                    <TableRow key={tipo.id}>
                      <TableCell>
                        {editandoTelhado?.id === tipo.id ? (
                          <Input
                            value={editandoTelhado.nome}
                            onChange={(e) => setEditandoTelhado({ ...editandoTelhado, nome: e.target.value })}
                          />
                        ) : (
                          tipo.nome
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoTelhado?.id === tipo.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoTelhado.precoMaterial}
                            onChange={(e) => setEditandoTelhado({ ...editandoTelhado, precoMaterial: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right"
                          />
                        ) : (
                          formatarMoeda(tipo.precoMaterial)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoTelhado?.id === tipo.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoTelhado.precoMaoObra}
                            onChange={(e) => setEditandoTelhado({ ...editandoTelhado, precoMaoObra: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right"
                          />
                        ) : (
                          formatarMoeda(tipo.precoMaoObra)
                        )}
                      </TableCell>
                      <TableCell>
                        {editandoTelhado?.id === tipo.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={async () => {
                                await salvarItem('tiposTelhado', tipo.id, editandoTelhado);
                                setEditandoTelhado(null);
                              }}
                              disabled={salvando}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditandoTelhado(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setEditandoTelhado(tipo)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setConfirmandoExclusao({ secao: 'tiposTelhado', id: tipo.id })}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIPOS DE TIJOLO */}
        <TabsContent value="tijolos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Tijolo/Bloco</CardTitle>
                <CardDescription>
                  Preços e consumo por m² de parede
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => { setTipoNovo('tiposTijolo'); setDialogNovoAberto(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Preço (R$/m²)</TableHead>
                    <TableHead className="text-right">Consumo (un/m²)</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.tiposTijolo.map((tipo) => (
                    <TableRow key={tipo.id}>
                      <TableCell>
                        {editandoTijolo?.id === tipo.id ? (
                          <Input
                            value={editandoTijolo.nome}
                            onChange={(e) => setEditandoTijolo({ ...editandoTijolo, nome: e.target.value })}
                          />
                        ) : (
                          tipo.nome
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoTijolo?.id === tipo.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoTijolo.preco}
                            onChange={(e) => setEditandoTijolo({ ...editandoTijolo, preco: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right"
                          />
                        ) : (
                          formatarMoeda(tipo.preco)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoTijolo?.id === tipo.id ? (
                          <Input
                            type="number"
                            step="0.1"
                            value={editandoTijolo.consumoPorM2}
                            onChange={(e) => setEditandoTijolo({ ...editandoTijolo, consumoPorM2: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right"
                          />
                        ) : (
                          tipo.consumoPorM2
                        )}
                      </TableCell>
                      <TableCell>
                        {editandoTijolo?.id === tipo.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={async () => {
                                await salvarItem('tiposTijolo', tipo.id, editandoTijolo);
                                setEditandoTijolo(null);
                              }}
                              disabled={salvando}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditandoTijolo(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setEditandoTijolo(tipo)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setConfirmandoExclusao({ secao: 'tiposTijolo', id: tipo.id })}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIPOS DE JANELA */}
        <TabsContent value="janelas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Janela</CardTitle>
                <CardDescription>
                  Preços por m² de janela
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => { setTipoNovo('tiposJanela'); setDialogNovoAberto(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Preço (R$/m²)</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.tiposJanela.map((tipo) => (
                    <TableRow key={tipo.id}>
                      <TableCell>
                        {editandoJanela?.id === tipo.id ? (
                          <Input
                            value={editandoJanela.nome}
                            onChange={(e) => setEditandoJanela({ ...editandoJanela, nome: e.target.value })}
                          />
                        ) : (
                          tipo.nome
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoJanela?.id === tipo.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoJanela.preco}
                            onChange={(e) => setEditandoJanela({ ...editandoJanela, preco: parseFloat(e.target.value) || 0 })}
                            className="w-28 text-right"
                          />
                        ) : (
                          formatarMoeda(tipo.preco)
                        )}
                      </TableCell>
                      <TableCell>
                        {editandoJanela?.id === tipo.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={async () => {
                                await salvarItem('tiposJanela', tipo.id, editandoJanela);
                                setEditandoJanela(null);
                              }}
                              disabled={salvando}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditandoJanela(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setEditandoJanela(tipo)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setConfirmandoExclusao({ secao: 'tiposJanela', id: tipo.id })}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PADRÕES DE ACABAMENTO */}
        <TabsContent value="acabamentos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Padrões de Acabamento</CardTitle>
                <CardDescription>
                  Multiplicadores e preços por padrão
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => { setTipoNovo('padroesAcabamento'); setDialogNovoAberto(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Multiplicador</TableHead>
                    <TableHead className="text-right">Rev. Parede</TableHead>
                    <TableHead className="text-right">Rev. Piso</TableHead>
                    <TableHead className="text-right">Porta Entrada</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.padroesAcabamento.map((padrao) => (
                    <TableRow key={padrao.id}>
                      <TableCell>
                        {editandoPadrao?.id === padrao.id ? (
                          <Input
                            value={editandoPadrao.nome}
                            onChange={(e) => setEditandoPadrao({ ...editandoPadrao, nome: e.target.value })}
                            className="w-32"
                          />
                        ) : (
                          padrao.nome
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoPadrao?.id === padrao.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoPadrao.multiplicador}
                            onChange={(e) => setEditandoPadrao({ ...editandoPadrao, multiplicador: parseFloat(e.target.value) || 0 })}
                            className="w-20 text-right"
                          />
                        ) : (
                          padrao.multiplicador.toFixed(2)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoPadrao?.id === padrao.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoPadrao.precoRevestimentoParede}
                            onChange={(e) => setEditandoPadrao({ ...editandoPadrao, precoRevestimentoParede: parseFloat(e.target.value) || 0 })}
                            className="w-20 text-right"
                          />
                        ) : (
                          formatarMoeda(padrao.precoRevestimentoParede)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoPadrao?.id === padrao.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoPadrao.precoRevestimentoPiso}
                            onChange={(e) => setEditandoPadrao({ ...editandoPadrao, precoRevestimentoPiso: parseFloat(e.target.value) || 0 })}
                            className="w-20 text-right"
                          />
                        ) : (
                          formatarMoeda(padrao.precoRevestimentoPiso)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editandoPadrao?.id === padrao.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoPadrao.precoPortaEntrada}
                            onChange={(e) => setEditandoPadrao({ ...editandoPadrao, precoPortaEntrada: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right"
                          />
                        ) : (
                          formatarMoeda(padrao.precoPortaEntrada)
                        )}
                      </TableCell>
                      <TableCell>
                        {editandoPadrao?.id === padrao.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={async () => {
                                await salvarItem('padroesAcabamento', padrao.id, editandoPadrao);
                                setEditandoPadrao(null);
                              }}
                              disabled={salvando}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditandoPadrao(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setEditandoPadrao(padrao)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setConfirmandoExclusao({ secao: 'padroesAcabamento', id: padrao.id })}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={!!confirmandoExclusao} onOpenChange={() => setConfirmandoExclusao(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmandoExclusao(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmandoExclusao && excluirItem(confirmandoExclusao.secao, confirmandoExclusao.id)}
              disabled={salvando}
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Novo Item */}
      <Dialog open={dialogNovoAberto} onOpenChange={setDialogNovoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item</DialogTitle>
          </DialogHeader>
          <NovoItemForm
            tipo={tipoNovo}
            onSalvar={(dados) => adicionarItem(tipoNovo, dados)}
            salvando={salvando}
            onCancelar={() => setDialogNovoAberto(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para o formulário de novo item
function NovoItemForm({
  tipo,
  onSalvar,
  salvando,
  onCancelar
}: {
  tipo: string;
  onSalvar: (dados: Record<string, unknown>) => void;
  salvando: boolean;
  onCancelar: () => void;
}) {
  const [dados, setDados] = useState<Record<string, unknown>>({});

  const campos: Record<string, { label: string; tipo: 'text' | 'number'; campo: string }[]> = {
    tiposTelhado: [
      { label: 'Nome', tipo: 'text', campo: 'nome' },
      { label: 'Preço Material (R$/m²)', tipo: 'number', campo: 'precoMaterial' },
      { label: 'Preço Mão de Obra (R$/m²)', tipo: 'number', campo: 'precoMaoObra' }
    ],
    tiposTijolo: [
      { label: 'Nome', tipo: 'text', campo: 'nome' },
      { label: 'Preço (R$/m²)', tipo: 'number', campo: 'preco' },
      { label: 'Consumo (un/m²)', tipo: 'number', campo: 'consumoPorM2' }
    ],
    tiposJanela: [
      { label: 'Nome', tipo: 'text', campo: 'nome' },
      { label: 'Preço (R$/m²)', tipo: 'number', campo: 'preco' }
    ],
    padroesAcabamento: [
      { label: 'Nome', tipo: 'text', campo: 'nome' },
      { label: 'Multiplicador', tipo: 'number', campo: 'multiplicador' },
      { label: 'Preço Rev. Parede (R$/m²)', tipo: 'number', campo: 'precoRevestimentoParede' },
      { label: 'Preço Rev. Piso (R$/m²)', tipo: 'number', campo: 'precoRevestimentoPiso' },
      { label: 'Preço Porta Entrada (R$)', tipo: 'number', campo: 'precoPortaEntrada' }
    ]
  };

  const camposDoTipo = campos[tipo] || [];

  return (
    <div className="space-y-4">
      {camposDoTipo.map((campo) => (
        <div key={campo.campo} className="space-y-2">
          <label className="text-sm font-medium">{campo.label}</label>
          <Input
            type={campo.tipo}
            step={campo.tipo === 'number' ? '0.01' : undefined}
            value={(dados[campo.campo] as string | number) || ''}
            onChange={(e) => setDados({
              ...dados,
              [campo.campo]: campo.tipo === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
            })}
          />
        </div>
      ))}
      <DialogFooter>
        <Button variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button onClick={() => onSalvar(dados)} disabled={salvando}>
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
        </Button>
      </DialogFooter>
    </div>
  );
}
