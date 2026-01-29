'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Settings, Home, PlusCircle, Calculator } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { id: 'config', label: 'Configuracoes', icon: <Settings className="h-4 w-4" /> },
  { id: 'comodos', label: 'Comodos', icon: <Home className="h-4 w-4" /> },
  { id: 'extras', label: 'Extras', icon: <PlusCircle className="h-4 w-4" /> },
  { id: 'resultado', label: 'Resultado', icon: <Calculator className="h-4 w-4" /> },
];

interface ProgressBarProps {
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export function FormProgressBar({
  currentStep,
  completedSteps = [],
  className,
}: ProgressBarProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress bar */}
      <div className="relative">
        <Progress value={progress} className="h-2" />
        <motion.div
          className="absolute top-0 left-0 h-2 bg-primary/20 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center gap-1',
                isUpcoming && 'opacity-50'
              )}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && !isCompleted && 'border-primary text-primary bg-primary/10',
                  isUpcoming && 'border-muted-foreground/30 text-muted-foreground/50'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </motion.div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isCurrent && 'text-primary',
                  isUpcoming && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple progress indicator showing percentage
interface SimpleProgressProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function SimpleProgress({
  value,
  label,
  showPercentage = true,
  className,
}: SimpleProgressProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between items-center text-sm">
        {label && <span className="text-muted-foreground">{label}</span>}
        {showPercentage && (
          <span className="font-medium">{Math.round(value)}%</span>
        )}
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

// Calculation progress indicator
interface CalculationProgressProps {
  isCalculating: boolean;
  stage?: string;
}

export function CalculationProgress({
  isCalculating,
  stage = 'Calculando...',
}: CalculationProgressProps) {
  if (!isCalculating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-card border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3"
    >
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-sm font-medium">{stage}</span>
    </motion.div>
  );
}
