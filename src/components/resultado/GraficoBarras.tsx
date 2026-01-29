'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BreakdownOrcamento } from '@/types';
import { formatarMoeda } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GraficoBarrasProps {
  breakdown: BreakdownOrcamento;
  className?: string;
}

export function GraficoBarras({ breakdown, className }: GraficoBarrasProps) {
  const dados = [
    {
      nome: 'Fundacao',
      materiais: breakdown.fundacao.subtotal,
      maoObra: 0,
    },
    {
      nome: 'Estrutura',
      materiais: breakdown.estrutura.subtotal,
      maoObra: 0,
    },
    {
      nome: 'Alvenaria',
      materiais: breakdown.alvenaria.subtotal,
      maoObra: 0,
    },
    {
      nome: 'Telhado',
      materiais: breakdown.telhado.subtotal,
      maoObra: 0,
    },
    {
      nome: 'Reboco',
      materiais: breakdown.reboco.subtotal,
      maoObra: 0,
    },
    {
      nome: 'Acabamento',
      materiais: breakdown.acabamento.subtotal,
      maoObra: 0,
    },
    {
      nome: 'M.O. Casa',
      materiais: 0,
      maoObra: breakdown.maoObraCasa.subtotal,
    },
    ...(breakdown.maoObraMuro ? [{
      nome: 'M.O. Muro',
      materiais: 0,
      maoObra: breakdown.maoObraMuro.subtotal,
    }] : []),
    ...(breakdown.maoObraPiscina ? [{
      nome: 'M.O. Piscina',
      materiais: 0,
      maoObra: breakdown.maoObraPiscina.subtotal,
    }] : []),
    ...(breakdown.muro ? [{
      nome: 'Mat. Muro',
      materiais: breakdown.muro.subtotal,
      maoObra: 0,
    }] : []),
    ...(breakdown.piscina ? [{
      nome: 'Mat. Piscina',
      materiais: breakdown.piscina.subtotal,
      maoObra: 0,
    }] : []),
  ].filter(d => d.materiais > 0 || d.maoObra > 0);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            entry.value > 0 && (
              <div key={index} className="flex justify-between gap-4">
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-medium">{formatarMoeda(entry.value)}</span>
              </div>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparativo por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dados}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="nome"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ className: 'stroke-border' }}
                  className="text-muted-foreground"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickFormatter={(value) => formatarMoeda(value).replace('R$', '')}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar
                  dataKey="materiais"
                  name="Materiais"
                  fill="hsl(221, 83%, 53%)"
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="maoObra"
                  name="Mao de Obra"
                  fill="hsl(160, 84%, 39%)"
                  radius={[4, 4, 0, 0]}
                  animationBegin={200}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Horizontal bar chart for materials breakdown
interface MaterialsBreakdownProps {
  items: Array<{ nome: string; valor: number }>;
  title?: string;
}

export function MaterialsBreakdown({ items, title = 'Materiais por Categoria' }: MaterialsBreakdownProps) {
  const sortedItems = [...items].sort((a, b) => b.valor - a.valor);
  const maxValue = Math.max(...items.map(i => i.valor));

  const colors = [
    'hsl(221, 83%, 53%)',
    'hsl(160, 84%, 39%)',
    'hsl(30, 80%, 55%)',
    'hsl(280, 65%, 60%)',
    'hsl(340, 75%, 55%)',
    'hsl(200, 70%, 50%)',
    'hsl(45, 93%, 47%)',
    'hsl(0, 84%, 60%)',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedItems.map((item, index) => (
            <motion.div
              key={item.nome}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.nome}</span>
                <span className="font-medium">{formatarMoeda(item.valor)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.valor / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
