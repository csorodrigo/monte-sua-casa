'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const statusConfig: Record<StatusType, { className: string; icon: React.ReactNode }> = {
  success: {
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  warning: {
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  danger: {
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  info: {
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  neutral: {
    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    icon: <Minus className="h-3 w-3" />,
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  default: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'default',
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium gap-1.5 border',
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && config.icon}
      {label}
    </Badge>
  );
}

// Cost per m2 badge specifically for construction costs
interface CostBadgeProps {
  costPerM2: number;
  className?: string;
}

export function CostBadge({ costPerM2, className }: CostBadgeProps) {
  let status: StatusType;
  let label: string;
  let icon: React.ReactNode;

  if (costPerM2 < 2000) {
    status = 'success';
    label = 'Economico';
    icon = <TrendingDown className="h-3 w-3" />;
  } else if (costPerM2 < 3000) {
    status = 'warning';
    label = 'Moderado';
    icon = <Minus className="h-3 w-3" />;
  } else {
    status = 'danger';
    label = 'Alto';
    icon = <TrendingUp className="h-3 w-3" />;
  }

  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium gap-1.5 border',
        config.className,
        className
      )}
    >
      {icon}
      {label}
    </Badge>
  );
}

// Percentage change badge
interface PercentChangeBadgeProps {
  value: number;
  showSign?: boolean;
  className?: string;
}

export function PercentChangeBadge({
  value,
  showSign = true,
  className,
}: PercentChangeBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  let status: StatusType = 'neutral';
  let icon: React.ReactNode = <Minus className="h-3 w-3" />;

  if (isPositive) {
    status = 'success';
    icon = <TrendingUp className="h-3 w-3" />;
  } else if (isNegative) {
    status = 'danger';
    icon = <TrendingDown className="h-3 w-3" />;
  }

  const config = statusConfig[status];
  const displayValue = Math.abs(value).toFixed(1);
  const sign = showSign && isPositive ? '+' : '';

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium gap-1 border',
        config.className,
        className
      )}
    >
      {icon}
      {sign}{displayValue}%
    </Badge>
  );
}
