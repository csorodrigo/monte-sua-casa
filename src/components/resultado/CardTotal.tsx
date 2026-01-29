'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatarMoeda, formatarArea } from '@/lib/utils';
import { Home, Layers, Users, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountUp } from '@/components/ui/motion';
import { CostBadge } from '@/components/ui/status-badge';

interface CardTotalProps {
  areaTotalConstruida: number;
  totalMateriais: number;
  totalMaoObra: number;
  totalGeral: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export function CardTotal({
  areaTotalConstruida,
  totalMateriais,
  totalMaoObra,
  totalGeral,
}: CardTotalProps) {
  const custoPorM2 = totalGeral / areaTotalConstruida;
  const percentMateriais = ((totalMateriais / totalGeral) * 100).toFixed(0);
  const percentMaoObra = ((totalMaoObra / totalGeral) * 100).toFixed(0);

  const cards = [
    {
      title: 'Area Total',
      value: areaTotalConstruida,
      formatter: (v: number) => formatarArea(v),
      subtitle: 'construida',
      icon: <Home className="h-4 w-4" />,
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      title: 'Materiais',
      value: totalMateriais,
      formatter: (v: number) => formatarMoeda(v),
      subtitle: `${percentMateriais}% do total`,
      icon: <Layers className="h-4 w-4" />,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      title: 'Mao de Obra',
      value: totalMaoObra,
      formatter: (v: number) => formatarMoeda(v),
      subtitle: `${percentMaoObra}% do total`,
      icon: <Users className="h-4 w-4" />,
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="card-hover overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <CountUp
                  value={card.value}
                  duration={0.8}
                  formatter={card.formatter}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Total Card with gradient */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="card-hover overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/25">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Total Geral
            </CardTitle>
            <div className="p-2 rounded-lg bg-white/20">
              <Wallet className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              <CountUp
                value={totalGeral}
                duration={1}
                formatter={(v: number) => formatarMoeda(v)}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-white/80">
                {formatarMoeda(custoPorM2)}/m²
              </span>
              <CostBadge costPerM2={custoPorM2} className="text-xs" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
