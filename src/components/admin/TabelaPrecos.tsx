'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Edit2, Save, X, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';

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

interface TabelaPrecosProps {
  secoes: Record<string, SecaoPrecos>;
  tipo: string;
  onAtualizarPreco: (secao: string, itemKey: string, novoPreco: number, subSecao?: string) => Promise<void>;
  onRemoverItem: (secao: string, itemKey: string, subSecao?: string) => Promise<void>;
  onAdicionarItem: (secao: string, itemKey: string, item: ItemPreco, subSecao?: string) => Promise<void>;
}

interface ItemLinha {
  secaoKey: string;
  secaoNome: string;
  subSecaoKey?: string;
  subSecaoNome?: string;
  itemKey: string;
  item: ItemPreco;
}

export function TabelaPrecos({
  secoes,
  tipo,
  onAtualizarPreco,
  onRemoverItem,
  onAdicionarItem
}: TabelaPrecosProps) {
  const [filtro, setFiltro] = useState('');
  const [secaoExpandida, setSecaoExpandida] = useState<Record<string, boolean>>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [precoEditado, setPrecoEditado] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState<ItemLinha | null>(null);
  const [dialogAdicionar, setDialogAdicionar] = useState(false);
  const [novoItem, setNovoItem] = useState({ descricao: '', unidade: 'm²', preco: '' });
  const [secaoNovoItem, setSecaoNovoItem] = useState('');
  const [subSecaoNovoItem, setSubSecaoNovoItem] = useState('');

  // Flatten items for easier rendering
  const itens = useMemo(() => {
    const resultado: ItemLinha[] = [];

    for (const [secaoKey, secao] of Object.entries(secoes)) {
      if (secao.itens) {
        for (const [itemKey, item] of Object.entries(secao.itens)) {
          resultado.push({
            secaoKey,
            secaoNome: secao.nome,
            itemKey,
            item
          });
        }
      }

      if (secao.subSecoes) {
        for (const [subKey, subSecao] of Object.entries(secao.subSecoes)) {
          for (const [itemKey, item] of Object.entries(subSecao.itens)) {
            resultado.push({
              secaoKey,
              secaoNome: secao.nome,
              subSecaoKey: subKey,
              subSecaoNome: subSecao.nome,
              itemKey,
              item
            });
          }
        }
      }
    }

    return resultado;
  }, [secoes]);

  // Filter items
  const itensFiltrados = useMemo(() => {
    if (!filtro) return itens;

    const termo = filtro.toLowerCase();
    return itens.filter(
      (i) =>
        i.item.descricao.toLowerCase().includes(termo) ||
        i.secaoNome.toLowerCase().includes(termo) ||
        i.subSecaoNome?.toLowerCase().includes(termo)
    );
  }, [itens, filtro]);

  // Group by section
  const itensPorSecao = useMemo(() => {
    const grupos: Record<string, ItemLinha[]> = {};

    for (const item of itensFiltrados) {
      const chave = item.subSecaoKey
        ? `${item.secaoKey}|${item.subSecaoKey}`
        : item.secaoKey;

      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(item);
    }

    return grupos;
  }, [itensFiltrados]);

  const formatarPreco = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleEditar = (item: ItemLinha) => {
    const chave = `${item.secaoKey}|${item.subSecaoKey || ''}|${item.itemKey}`;
    setEditando(chave);
    setPrecoEditado(item.item.preco.toString());
  };

  const handleSalvar = async (item: ItemLinha) => {
    const novoPreco = parseFloat(precoEditado.replace(',', '.'));
    if (isNaN(novoPreco) || novoPreco < 0) return;

    await onAtualizarPreco(item.secaoKey, item.itemKey, novoPreco, item.subSecaoKey);
    setEditando(null);
    setPrecoEditado('');
  };

  const handleCancelar = () => {
    setEditando(null);
    setPrecoEditado('');
  };

  const handleConfirmarRemocao = async () => {
    if (!itemParaRemover) return;
    await onRemoverItem(
      itemParaRemover.secaoKey,
      itemParaRemover.itemKey,
      itemParaRemover.subSecaoKey
    );
    setDialogAberto(false);
    setItemParaRemover(null);
  };

  const handleAdicionar = async () => {
    const preco = parseFloat(novoItem.preco.replace(',', '.'));
    if (!novoItem.descricao || !novoItem.unidade || isNaN(preco)) return;

    const itemKey = novoItem.descricao
      .toLowerCase()
      .replace(/[áàâã]/g, 'a')
      .replace(/[éèê]/g, 'e')
      .replace(/[íìî]/g, 'i')
      .replace(/[óòôõ]/g, 'o')
      .replace(/[úùû]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(p => p.length > 2)
      .slice(0, 4)
      .map((p, i) => i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))
      .join('');

    await onAdicionarItem(
      secaoNovoItem,
      itemKey,
      {
        descricao: novoItem.descricao,
        unidade: novoItem.unidade,
        preco
      },
      subSecaoNovoItem || undefined
    );

    setDialogAdicionar(false);
    setNovoItem({ descricao: '', unidade: 'm²', preco: '' });
    setSecaoNovoItem('');
    setSubSecaoNovoItem('');
  };

  const toggleSecao = (chave: string) => {
    setSecaoExpandida(prev => ({ ...prev, [chave]: !prev[chave] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar item..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setDialogAdicionar(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {itensFiltrados.length} itens encontrados
      </div>

      <div className="border rounded-lg overflow-hidden">
        {Object.entries(itensPorSecao).map(([chaveGrupo, itensGrupo]) => {
          const primeiroItem = itensGrupo[0];
          const nomeGrupo = primeiroItem.subSecaoNome
            ? `${primeiroItem.secaoNome} > ${primeiroItem.subSecaoNome}`
            : primeiroItem.secaoNome;
          const expandido = secaoExpandida[chaveGrupo] !== false;

          return (
            <div key={chaveGrupo} className="border-b last:border-b-0">
              <button
                onClick={() => toggleSecao(chaveGrupo)}
                className="w-full px-4 py-3 bg-muted/50 hover:bg-muted flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  {expandido ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium">{nomeGrupo}</span>
                  <Badge variant="secondary">{itensGrupo.length}</Badge>
                </div>
              </button>

              {expandido && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Descrição</TableHead>
                      <TableHead className="w-[10%]">Unidade</TableHead>
                      <TableHead className="w-[20%] text-right">Preço</TableHead>
                      <TableHead className="w-[20%] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensGrupo.map((item) => {
                      const chaveItem = `${item.secaoKey}|${item.subSecaoKey || ''}|${item.itemKey}`;
                      const estaEditando = editando === chaveItem;

                      return (
                        <TableRow key={chaveItem}>
                          <TableCell className="font-medium">
                            {item.item.descricao}
                          </TableCell>
                          <TableCell>{item.item.unidade}</TableCell>
                          <TableCell className="text-right">
                            {estaEditando ? (
                              <Input
                                type="text"
                                value={precoEditado}
                                onChange={(e) => setPrecoEditado(e.target.value)}
                                className="w-28 text-right"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSalvar(item);
                                  if (e.key === 'Escape') handleCancelar();
                                }}
                              />
                            ) : (
                              formatarPreco(item.item.preco)
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {estaEditando ? (
                              <div className="flex gap-1 justify-end">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSalvar(item)}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={handleCancelar}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1 justify-end">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEditar(item)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setItemParaRemover(item);
                                    setDialogAberto(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialog de confirmação de remoção */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o item &quot;{itemParaRemover?.item.descricao}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarRemocao}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de adicionar item */}
      <Dialog open={dialogAdicionar} onOpenChange={setDialogAdicionar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo item de preço
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seção</label>
              <select
                value={secaoNovoItem}
                onChange={(e) => {
                  setSecaoNovoItem(e.target.value);
                  setSubSecaoNovoItem('');
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                {Object.entries(secoes).map(([key, secao]) => (
                  <option key={key} value={key}>{secao.nome}</option>
                ))}
              </select>
            </div>

            {secaoNovoItem && secoes[secaoNovoItem]?.subSecoes && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Subseção</label>
                <select
                  value={subSecaoNovoItem}
                  onChange={(e) => setSubSecaoNovoItem(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Selecione...</option>
                  {Object.entries(secoes[secaoNovoItem].subSecoes!).map(([key, sub]) => (
                    <option key={key} value={key}>{sub.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={novoItem.descricao}
                onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                placeholder="Ex: Tubo PVC 40mm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidade</label>
                <Input
                  value={novoItem.unidade}
                  onChange={(e) => setNovoItem({ ...novoItem, unidade: e.target.value })}
                  placeholder="m², m³, un, etc"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço (R$)</label>
                <Input
                  value={novoItem.preco}
                  onChange={(e) => setNovoItem({ ...novoItem, preco: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAdicionar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionar} disabled={!secaoNovoItem || !novoItem.descricao || !novoItem.preco}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
