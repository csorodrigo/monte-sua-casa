'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BreakdownOrcamento } from '@/types';
import { formatarMoeda } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GraficoPizzaProps {
  breakdown: BreakdownOrcamento;
  totalGeral: number;
  onCategoryClick?: (category: string) => void;
}

const CORES_LIGHT = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
];

const CORES_DARK = [
  '#60a5fa', // blue-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#f87171', // red-400
  '#a78bfa', // violet-400
  '#22d3ee', // cyan-400
  '#fb923c', // orange-400
  '#a3e635', // lime-400
  '#f472b6', // pink-400
];

export function GraficoPizza({ breakdown, totalGeral, onCategoryClick }: GraficoPizzaProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const dados = [
    { nome: 'Fundacao', valor: breakdown.fundacao.subtotal },
    { nome: 'Estrutura', valor: breakdown.estrutura.subtotal },
    { nome: 'Alvenaria', valor: breakdown.alvenaria.subtotal },
    { nome: 'Telhado', valor: breakdown.telhado.subtotal },
    { nome: 'Reboco', valor: breakdown.reboco.subtotal },
    { nome: 'Acabamento', valor: breakdown.acabamento.subtotal },
    { nome: 'Mao de Obra', valor: breakdown.maoObra.subtotal },
    ...(breakdown.muro ? [{ nome: 'Muro', valor: breakdown.muro.subtotal }] : []),
    ...(breakdown.piscina ? [{ nome: 'Piscina', valor: breakdown.piscina.subtotal }] : []),
  ].filter(d => d.valor > 0);

  const dadosComPorcentagem = dados.map((d, i) => ({
    ...d,
    porcentagem: ((d.valor / totalGeral) * 100).toFixed(1),
    cor: CORES_LIGHT[i % CORES_LIGHT.length],
    corDark: CORES_DARK[i % CORES_DARK.length],
  }));

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  interface TooltipPayload {
    payload: {
      nome: string;
      valor: number;
      porcentagem: string;
      cor: string;
    };
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.cor }}
            />
            {data.nome}
          </p>
          <div className="mt-1 space-y-0.5">
            <p className="text-muted-foreground">
              Valor: <span className="font-medium text-foreground">{formatarMoeda(data.valor)}</span>
            </p>
            <p className="text-muted-foreground">
              Porcentagem: <span className="font-medium text-foreground">{data.porcentagem}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuicao de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosComPorcentagem}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="valor"
                  nameKey="nome"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  onClick={(_, index) => {
                    const category = dadosComPorcentagem[index]?.nome;
                    if (category && onCategoryClick) {
                      onCategoryClick(category);
                    }
                  }}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
                >
                  {dadosComPorcentagem.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.cor}
                      className="transition-opacity duration-200"
                      style={{
                        opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.6,
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {dadosComPorcentagem.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.3 }}
                className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                  activeIndex === i ? 'bg-muted' : ''
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(undefined)}
                onClick={() => onCategoryClick?.(d.nome)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.cor }}
                />
                <span className="flex-1 truncate">{d.nome}</span>
                <span className="font-medium text-xs text-muted-foreground">
                  {d.porcentagem}%
                </span>
              </motion.div>
            ))}
          </div>

          {/* Total in center info */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-bold text-lg">{formatarMoeda(totalGeral)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
