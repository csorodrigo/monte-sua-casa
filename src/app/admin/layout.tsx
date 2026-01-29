'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LoginAdmin } from '@/components/admin/LoginAdmin';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  DollarSign,
  Upload,
  ArrowLeft,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'admin_autenticado';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    // Verifica se há sessão salva
    const sessao = localStorage.getItem(STORAGE_KEY);
    if (sessao) {
      // Tenta validar a sessão
      setSenha(sessao);
      setAutenticado(true);
    }
    setCarregando(false);
  }, []);

  const handleLogin = async (senhaDigitada: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: senhaDigitada })
      });

      if (response.ok) {
        localStorage.setItem(STORAGE_KEY, senhaDigitada);
        setSenha(senhaDigitada);
        setAutenticado(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAutenticado(false);
    setSenha('');
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!autenticado) {
    return <LoginAdmin onLogin={handleLogin} />;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/precos', label: 'Preços', icon: DollarSign },
    { href: '/admin/precos/importar', label: 'Importar Excel', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMenuAberto(!menuAberto)}>
            {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <span className="font-semibold">Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${menuAberto ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b hidden lg:block">
            <h1 className="text-xl font-bold">Painel Admin</h1>
            <p className="text-sm text-muted-foreground">Monte sua Casa</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 mt-14 lg:mt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAberto(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Simulador
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start hidden lg:flex"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8">
          {/* Passa a senha para os filhos via contexto ou prop drilling */}
          <AdminContext.Provider value={{ senha }}>
            {children}
          </AdminContext.Provider>
        </div>
      </main>
    </div>
  );
}

// Contexto para compartilhar a senha com os filhos
import { createContext, useContext } from 'react';

interface AdminContextType {
  senha: string;
}

const AdminContext = createContext<AdminContextType>({ senha: '' });

export function useAdminContext() {
  return useContext(AdminContext);
}
