'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Home } from 'lucide-react';
import { Comodo } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { formatarArea } from '@/lib/utils';

interface GridComodosProps {
  comodos: Comodo[];
  onAdicionar: () => void;
  onRemover: (id: string) => void;
  onAtualizar: (id: string, campo: keyof Comodo, valor: string | number) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.95 },
};

export function GridComodos({
  comodos,
  onAdicionar,
  onRemover,
  onAtualizar,
}: GridComodosProps) {
  const areaTotal = comodos.reduce(
    (sum, c) => sum + c.largura * c.comprimento,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Home className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Comodos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {comodos.length} {comodos.length === 1 ? 'comodo' : 'comodos'} - {formatarArea(areaTotal)}
                </p>
              </div>
            </div>
            <Button size="sm" onClick={onAdicionar} className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {comodos.map((comodo, index) => (
                <motion.div
                  key={comodo.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{
                    duration: 0.2,
                    delay: index * 0.02,
                    layout: { duration: 0.2 },
                  }}
                  className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  {/* Nome - 4 cols on desktop, full on mobile */}
                  <div className="col-span-12 sm:col-span-4">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input
                      value={comodo.nome}
                      onChange={(e) =>
                        onAtualizar(comodo.id, 'nome', e.target.value)
                      }
                      placeholder="Nome do comodo"
                      className="h-9"
                    />
                  </div>

                  {/* Dimensoes - 2 cols each on desktop */}
                  <div className="col-span-4 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Largura (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      value={comodo.largura}
                      onChange={(e) =>
                        onAtualizar(comodo.id, 'largura', parseFloat(e.target.value) || 0)
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Comprimento (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      value={comodo.comprimento}
                      onChange={(e) =>
                        onAtualizar(comodo.id, 'comprimento', parseFloat(e.target.value) || 0)
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Pe Direito (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="2"
                      max="4"
                      value={comodo.peDireito}
                      onChange={(e) =>
                        onAtualizar(comodo.id, 'peDireito', parseFloat(e.target.value) || 2.8)
                      }
                      className="h-9"
                    />
                  </div>

                  {/* Area and delete button */}
                  <div className="col-span-6 sm:col-span-1 flex items-center justify-center">
                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground block">Area</Label>
                      <motion.p
                        key={comodo.largura * comodo.comprimento}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-sm font-medium h-9 flex items-center justify-center"
                      >
                        {(comodo.largura * comodo.comprimento).toFixed(1)}m²
                      </motion.p>
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-1 flex items-center justify-center sm:justify-end">
                    <div className="sm:hidden">
                      <Label className="text-xs text-muted-foreground block">&nbsp;</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemover(comodo.id)}
                      disabled={comodos.length <= 1}
                      className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {comodos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum comodo adicionado</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAdicionar}
                  className="mt-3"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar primeiro comodo
                </Button>
              </motion.div>
            )}
          </div>

          {/* Area total summary */}
          {comodos.length > 0 && (
            <motion.div
              layout
              className="mt-4 pt-3 border-t flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground">Area total construida:</span>
              <motion.span
                key={areaTotal}
                initial={{ scale: 1.1, color: 'hsl(var(--primary))' }}
                animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                className="font-bold"
              >
                {formatarArea(areaTotal)}
              </motion.span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
