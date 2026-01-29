'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowUp } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  showAfterScroll?: number;
  className?: string;
  loading?: boolean;
}

export function FAB({
  onClick,
  label = 'Calcular',
  icon,
  showAfterScroll = 200,
  className,
  loading = false,
}: FABProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed bottom-6 right-6 z-50 md:hidden',
            className
          )}
        >
          <Button
            size="lg"
            onClick={onClick}
            disabled={loading}
            className={cn(
              'h-14 rounded-full shadow-lg shadow-primary/25 gap-2',
              label ? 'px-6' : 'w-14'
            )}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              icon || <Calculator className="h-5 w-5" />
            )}
            {label && <span className="font-medium">{label}</span>}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Scroll to top FAB
export function ScrollToTopFAB({ showAfterScroll = 400 }: { showAfterScroll?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="h-10 w-10 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Voltar ao topo</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
