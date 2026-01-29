'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatarMoeda, formatarNumero } from '@/lib/utils';
import { BreakdownOrcamento, SecaoOrcamento } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface BreakdownTableProps {
  breakdown: BreakdownOrcamento;
}

function SecaoTable({ secao, index }: { secao: SecaoOrcamento; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (secao.itens.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden">
        <CardHeader
          className="py-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isExpanded ? '' : '-rotate-90'
                }`}
              />
              <CardTitle className="text-base">{secao.nome}</CardTitle>
              <span className="text-xs text-muted-foreground">
                ({secao.itens.length} {secao.itens.length === 1 ? 'item' : 'itens'})
              </span>
            </div>
            <span className="font-bold text-primary">
              {formatarMoeda(secao.subtotal)}
            </span>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 pb-3">
                <div className="overflow-x-auto -mx-6 px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Item</TableHead>
                        <TableHead className="text-right min-w-[80px]">Qtd</TableHead>
                        <TableHead className="text-right min-w-[60px]">Unid.</TableHead>
                        <TableHead className="text-right min-w-[100px]">Valor Unit.</TableHead>
                        <TableHead className="text-right min-w-[100px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {secao.itens.map((item, itemIndex) => (
                        <TableRow
                          key={itemIndex}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="font-medium">{item.descricao}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatarNumero(item.quantidade)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.unidade}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatarMoeda(item.precoUnitario)}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatarMoeda(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export function BreakdownTable({ breakdown }: BreakdownTableProps) {
  const secoes = [
    breakdown.fundacao,
    breakdown.estrutura,
    breakdown.alvenaria,
    breakdown.telhado,
    breakdown.reboco,
    breakdown.acabamento,
    breakdown.maoObra,
    breakdown.muro,
    breakdown.piscina,
  ].filter((s): s is SecaoOrcamento => s !== undefined && s.itens.length > 0);

  const totalGeral = secoes.reduce((sum, s) => sum + s.subtotal, 0);

  return (
    <div className="space-y-3">
      {secoes.map((secao, index) => (
        <SecaoTable key={secao.nome} secao={secao} index={index} />
      ))}

      {/* Total card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: secoes.length * 0.05 }}
      >
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total Geral</span>
              <span className="text-2xl font-bold">{formatarMoeda(totalGeral)}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
