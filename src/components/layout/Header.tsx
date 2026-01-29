'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calculator, FileText, Menu, Settings, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { motion } from 'framer-motion';

interface HeaderProps {
  showBreadcrumb?: boolean;
  currentPage?: string;
}

export function Header({ showBreadcrumb = false, currentPage = 'Simulador' }: HeaderProps) {
  return (
    <header className="sticky-blur border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Image
                src="/logo.png"
                alt="Sua Casa no Papel"
                width={48}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="hidden sm:block"
            >
              <h1 className="text-lg font-bold">
                <span className="text-blue-600 dark:text-blue-400">Sua </span>
                <span className="text-blue-700 dark:text-blue-300">Casa </span>
                <span className="text-amber-500 dark:text-amber-400">no </span>
                <span className="text-amber-600 dark:text-amber-300">Papel</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Simulador de Orcamento
              </p>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-2">
              <Calculator className="h-4 w-4" />
              Simulador
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Historico
            </Button>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/logo.png"
                      alt="Sua Casa no Papel"
                      width={32}
                      height={40}
                      className="h-10 w-auto"
                    />
                    <span>
                      <span className="text-blue-600">Sua Casa </span>
                      <span className="text-amber-500">no Papel</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start gap-2">
                    <Calculator className="h-4 w-4" />
                    Simulador
                  </Button>
                  <Button variant="ghost" className="justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Historico
                  </Button>
                  <Link href="/admin">
                    <Button variant="ghost" className="justify-start gap-2 w-full">
                      <Settings className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Breadcrumb */}
        {showBreadcrumb && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-3"
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Inicio
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        )}
      </div>
    </header>
  );
}
