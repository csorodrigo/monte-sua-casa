'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RelatorioCompleto, TipoRelatorio, NOMES_RELATORIOS } from '@/types/relatorios';
import { formatarMoeda, formatarNumero } from '@/lib/utils';
import {
  FileText,
  Home,
  Hammer,
  Fence,
  Waves,
  Calculator,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { SecaoOrcamentoDetalhado } from '@/lib/calculations/orcamento-detalhado-casa';
import { motion, AnimatePresence } from 'framer-motion';

interface RelatorioDetalhadoProps {
  relatorio: RelatorioCompleto;
}

// Content animation wrapper
function AnimatedContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Componente para exibir uma seção de orçamento
function SecaoTabela({ secao }: { secao: SecaoOrcamentoDetalhado }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!secao.itens || secao.itens.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="mb-4 overflow-hidden">
        <CardHeader
          className="py-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
              />
              {secao.codigo} {secao.nome}
            </CardTitle>
            <span className="font-bold text-primary">{formatarMoeda(secao.subtotal)}</span>
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
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Item</TableHead>
                        <TableHead>Descricao</TableHead>
                        <TableHead className="text-right w-[100px]">Qtd</TableHead>
                        <TableHead className="text-center w-[60px]">Un</TableHead>
                        <TableHead className="text-right w-[120px]">Preco Unit.</TableHead>
                        <TableHead className="text-right w-[120px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {secao.itens.map((item) => (
                        <TableRow key={item.codigo} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                          <TableCell className="text-sm">{item.descricao}</TableCell>
                          <TableCell className="text-right">{formatarNumero(item.quantidade)}</TableCell>
                          <TableCell className="text-center">{item.unidade}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(item.precoUnitario)}</TableCell>
                          <TableCell className="text-right font-medium">{formatarMoeda(item.total)}</TableCell>
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

// Mobile menu
function MobileMenu({
  tipoAtivo,
  onChange,
  relatorio,
}: {
  tipoAtivo: TipoRelatorio;
  onChange: (tipo: TipoRelatorio) => void;
  relatorio: RelatorioCompleto;
}) {
  const menuItems: { tipo: TipoRelatorio; icon: React.ReactNode; habilitado: boolean }[] = [
    { tipo: 'resumo', icon: <FileText className="h-4 w-4" />, habilitado: true },
    { tipo: 'orcamento-casa', icon: <Home className="h-4 w-4" />, habilitado: true },
    { tipo: 'mao-obra-casa', icon: <Hammer className="h-4 w-4" />, habilitado: true },
    { tipo: 'orcamento-muro', icon: <Fence className="h-4 w-4" />, habilitado: relatorio.orcamentoMuro.subtotal > 0 },
    { tipo: 'mao-obra-muro', icon: <Hammer className="h-4 w-4" />, habilitado: relatorio.maoObraMuro.subtotal > 0 },
    { tipo: 'orcamento-piscina', icon: <Waves className="h-4 w-4" />, habilitado: relatorio.orcamentoPiscina.subtotal > 0 },
    { tipo: 'mao-obra-piscina', icon: <Hammer className="h-4 w-4" />, habilitado: relatorio.maoObraPiscina.subtotal > 0 },
    { tipo: 'memorial-estrutural', icon: <Calculator className="h-4 w-4" />, habilitado: true },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Menu className="h-4 w-4 mr-2" />
          {NOMES_RELATORIOS[tipoAtivo]}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Relatorios</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 space-y-1">
          {menuItems.map(({ tipo, icon, habilitado }) => (
            <Button
              key={tipo}
              variant={tipoAtivo === tipo ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${!habilitado ? 'opacity-50' : ''}`}
              onClick={() => habilitado && onChange(tipo)}
              disabled={!habilitado}
            >
              {icon}
              <span className="ml-2 text-sm">{NOMES_RELATORIOS[tipo]}</span>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// Componente de Resumo
function ResumoGeral({ relatorio }: { relatorio: RelatorioCompleto }) {
  const { resumo } = relatorio;

  return (
    <AnimatedContent>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center p-4 bg-muted rounded-lg"
              >
                <p className="text-2xl font-bold">{formatarNumero(resumo.areaTotalConstruida)} m²</p>
                <p className="text-sm text-muted-foreground">Area Construida</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center p-4 bg-muted rounded-lg"
              >
                <p className="text-2xl font-bold">{formatarNumero(resumo.areaParedes)} m²</p>
                <p className="text-sm text-muted-foreground">Area de Paredes</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center p-4 bg-muted rounded-lg"
              >
                <p className="text-2xl font-bold">{formatarNumero(resumo.areaTelhado)} m²</p>
                <p className="text-sm text-muted-foreground">Area do Telhado</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orcamento Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Materiais</TableHead>
                    <TableHead className="text-right">Mao de Obra</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Casa</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.totalMateriaisCasa)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.totalMaoObraCasa)}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatarMoeda(resumo.totalMateriaisCasa + resumo.totalMaoObraCasa)}
                    </TableCell>
                  </TableRow>
                  {resumo.totalMateriaisMuro > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">Muro</TableCell>
                      <TableCell className="text-right">{formatarMoeda(resumo.totalMateriaisMuro)}</TableCell>
                      <TableCell className="text-right">{formatarMoeda(resumo.totalMaoObraMuro)}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatarMoeda(resumo.totalMateriaisMuro + resumo.totalMaoObraMuro)}
                      </TableCell>
                    </TableRow>
                  )}
                  {resumo.totalMateriaisPiscina > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">Piscina</TableCell>
                      <TableCell className="text-right">{formatarMoeda(resumo.totalMateriaisPiscina)}</TableCell>
                      <TableCell className="text-right">{formatarMoeda(resumo.totalMaoObraPiscina)}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatarMoeda(resumo.totalMateriaisPiscina + resumo.totalMaoObraPiscina)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-primary/10">
                    <TableCell className="font-bold">TOTAL GERAL</TableCell>
                    <TableCell className="text-right font-bold">{formatarMoeda(resumo.totalGeralMateriais)}</TableCell>
                    <TableCell className="text-right font-bold">{formatarMoeda(resumo.totalGeralMaoObra)}</TableCell>
                    <TableCell className="text-right font-bold text-primary text-lg">
                      {formatarMoeda(resumo.totalGeral)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-center text-white"
            >
              <p className="text-sm text-white/80">Custo por m² construido</p>
              <p className="text-3xl font-bold">
                {formatarMoeda(resumo.totalGeral / resumo.areaTotalConstruida)}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </AnimatedContent>
  );
}

// Componente Memorial Estrutural
function MemorialEstruturalView({ memorial }: { memorial: RelatorioCompleto['memorialEstrutural'] }) {
  return (
    <AnimatedContent>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados de Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { value: formatarNumero(memorial.areaTotal), unit: 'm²', label: 'Area Total' },
                { value: formatarNumero(memorial.perimetroExterno), unit: 'm', label: 'Perimetro' },
                { value: formatarNumero(memorial.peDireito), unit: 'm', label: 'Pe Direito' },
                { value: memorial.estimativaPilar.toString(), unit: '', label: 'Est. Pilares' },
                { value: memorial.estimativaFundacao.toString(), unit: '', label: 'Est. Fundacoes' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 bg-muted rounded-lg text-center"
                >
                  <p className="text-lg font-bold">{item.value} {item.unit}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                <CardTitle className="text-orange-700 dark:text-orange-400">FERRO (kg)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Pilar ({memorial.ferro.pilar.secao}cm)</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.ferro.pilar.quantidade)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Vigas ({formatarNumero(memorial.ferro.vigas.perimetro)}m)</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.ferro.vigas.quantidade)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fundacao</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.ferro.fundacao.quantidade)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-orange-100 dark:bg-orange-900/30">
                      <TableCell className="font-bold">TOTAL</TableCell>
                      <TableCell className="text-right font-bold text-lg">{formatarNumero(memorial.ferro.total)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                <CardTitle className="text-blue-700 dark:text-blue-400">CONCRETO (m³)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Pilar</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.concreto.pilar.volume)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Vigas</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.concreto.vigas.volume)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Laje</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.concreto.laje.volume)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fundacao</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.concreto.fundacao.volume)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-100 dark:bg-blue-900/30">
                      <TableCell className="font-bold">TOTAL</TableCell>
                      <TableCell className="text-right font-bold text-lg">{formatarNumero(memorial.concreto.total)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="bg-green-50 dark:bg-green-900/20">
                <CardTitle className="text-green-700 dark:text-green-400">FORMA (m²)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Pilar ({memorial.forma.pilar.secao}cm)</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.forma.pilar.area)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Vigas</TableCell>
                      <TableCell className="text-right font-bold">{formatarNumero(memorial.forma.vigas.area)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-green-100 dark:bg-green-900/30">
                      <TableCell className="font-bold">TOTAL</TableCell>
                      <TableCell className="text-right font-bold text-lg">{formatarNumero(memorial.forma.total)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Indices por m² Construido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="p-4 bg-muted rounded-lg text-center"
              >
                <p className="text-2xl font-bold">{formatarNumero(memorial.taxaFerro)} kg/m²</p>
                <p className="text-sm text-muted-foreground">Taxa de Ferro</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-muted rounded-lg text-center"
              >
                <p className="text-2xl font-bold">{formatarNumero(memorial.taxaConcreto, 3)} m³/m²</p>
                <p className="text-sm text-muted-foreground">Taxa de Concreto</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedContent>
  );
}

export function RelatorioDetalhado({ relatorio }: RelatorioDetalhadoProps) {
  const [tipoAtivo, setTipoAtivo] = useState<TipoRelatorio>('resumo');

  const tabs = [
    { id: 'resumo' as TipoRelatorio, label: 'Resumo', icon: <FileText className="h-4 w-4" />, enabled: true },
    { id: 'orcamento-casa' as TipoRelatorio, label: 'Mat. Casa', icon: <Home className="h-4 w-4" />, enabled: true },
    { id: 'mao-obra-casa' as TipoRelatorio, label: 'M.O. Casa', icon: <Hammer className="h-4 w-4" />, enabled: true },
    { id: 'orcamento-muro' as TipoRelatorio, label: 'Mat. Muro', icon: <Fence className="h-4 w-4" />, enabled: relatorio.orcamentoMuro.subtotal > 0 },
    { id: 'mao-obra-muro' as TipoRelatorio, label: 'M.O. Muro', icon: <Hammer className="h-4 w-4" />, enabled: relatorio.maoObraMuro.subtotal > 0 },
    { id: 'orcamento-piscina' as TipoRelatorio, label: 'Mat. Piscina', icon: <Waves className="h-4 w-4" />, enabled: relatorio.orcamentoPiscina.subtotal > 0 },
    { id: 'mao-obra-piscina' as TipoRelatorio, label: 'M.O. Piscina', icon: <Hammer className="h-4 w-4" />, enabled: relatorio.maoObraPiscina.subtotal > 0 },
    { id: 'memorial-estrutural' as TipoRelatorio, label: 'Memorial', icon: <Calculator className="h-4 w-4" />, enabled: true },
  ];

  const enabledTabs = tabs.filter(t => t.enabled);

  const renderConteudo = () => {
    switch (tipoAtivo) {
      case 'resumo':
        return <ResumoGeral relatorio={relatorio} />;

      case 'orcamento-casa':
        return (
          <AnimatedContent>
            <div>
              <h2 className="text-xl font-bold mb-4">Orcamento Casa - Materiais</h2>
              <SecaoTabela secao={relatorio.orcamentoCasa.movimentoTerra} />
              <SecaoTabela secao={relatorio.orcamentoCasa.baldrameAlvenaria} />
              <SecaoTabela secao={relatorio.orcamentoCasa.fundacoesEstruturas} />
              <SecaoTabela secao={relatorio.orcamentoCasa.esquadriasFerragens} />
              <SecaoTabela secao={relatorio.orcamentoCasa.cobertura} />
              <SecaoTabela secao={relatorio.orcamentoCasa.revestimentos} />
              <SecaoTabela secao={relatorio.orcamentoCasa.instalacaoHidraulica} />
              <SecaoTabela secao={relatorio.orcamentoCasa.instalacaoSanitaria} />
              <SecaoTabela secao={relatorio.orcamentoCasa.instalacaoEletrica} />
              {relatorio.orcamentoCasa.gasGlp && <SecaoTabela secao={relatorio.orcamentoCasa.gasGlp} />}
              <SecaoTabela secao={relatorio.orcamentoCasa.pintura} />
              {relatorio.orcamentoCasa.churrasqueira && relatorio.orcamentoCasa.churrasqueira.subtotal > 0 && (
                <SecaoTabela secao={relatorio.orcamentoCasa.churrasqueira} />
              )}
              {relatorio.orcamentoCasa.limpezaObra && <SecaoTabela secao={relatorio.orcamentoCasa.limpezaObra} />}
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL GERAL - MATERIAIS CASA</span>
                    <span className="text-2xl font-bold">{formatarMoeda(relatorio.orcamentoCasa.totalGeral)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedContent>
        );

      case 'mao-obra-casa':
        return (
          <AnimatedContent>
            <div>
              <h2 className="text-xl font-bold mb-4">Mao de Obra - Casa</h2>
              <SecaoTabela secao={relatorio.maoObraCasa.movimentoTerra} />
              <SecaoTabela secao={relatorio.maoObraCasa.baldrameAlvenaria} />
              <SecaoTabela secao={relatorio.maoObraCasa.fundacoesEstruturas} />
              <SecaoTabela secao={relatorio.maoObraCasa.esquadriasFerragens} />
              <SecaoTabela secao={relatorio.maoObraCasa.cobertura} />
              <SecaoTabela secao={relatorio.maoObraCasa.revestimentos} />
              <SecaoTabela secao={relatorio.maoObraCasa.instalacaoHidraulica} />
              <SecaoTabela secao={relatorio.maoObraCasa.instalacaoSanitaria} />
              <SecaoTabela secao={relatorio.maoObraCasa.instalacaoEletrica} />
              <SecaoTabela secao={relatorio.maoObraCasa.gasGlp} />
              <SecaoTabela secao={relatorio.maoObraCasa.pintura} />
              {relatorio.maoObraCasa.churrasqueira && relatorio.maoObraCasa.churrasqueira.subtotal > 0 && (
                <SecaoTabela secao={relatorio.maoObraCasa.churrasqueira} />
              )}
              {relatorio.maoObraCasa.limpezaObra && <SecaoTabela secao={relatorio.maoObraCasa.limpezaObra} />}
              <Card className="mb-4">
                <CardContent className="py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold">{formatarMoeda(relatorio.maoObraCasa.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>BDI ({relatorio.maoObraCasa.bdiPercentual}%)</span>
                      <span>{formatarMoeda(relatorio.maoObraCasa.bdi)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL GERAL - MAO DE OBRA CASA</span>
                    <span className="text-2xl font-bold">{formatarMoeda(relatorio.maoObraCasa.totalGeral)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedContent>
        );

      case 'orcamento-muro':
        return (
          <AnimatedContent>
            <div>
              <h2 className="text-xl font-bold mb-4">Orcamento Muro - Materiais</h2>
              <SecaoTabela secao={relatorio.orcamentoMuro.servicosPreliminares} />
              <SecaoTabela secao={relatorio.orcamentoMuro.movimentoTerra} />
              <SecaoTabela secao={relatorio.orcamentoMuro.baldrameAlvenaria} />
              <SecaoTabela secao={relatorio.orcamentoMuro.pinturaMuro} />
              <SecaoTabela secao={relatorio.orcamentoMuro.portoes} />
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL GERAL - MATERIAIS MURO</span>
                    <span className="text-2xl font-bold">{formatarMoeda(relatorio.orcamentoMuro.totalGeral)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedContent>
        );

      case 'mao-obra-muro':
        return (
          <AnimatedContent>
            <div>
              <h2 className="text-xl font-bold mb-4">Mao de Obra - Muro</h2>
              <SecaoTabela secao={relatorio.maoObraMuro.servicosPreliminares} />
              <SecaoTabela secao={relatorio.maoObraMuro.movimentoTerra} />
              <SecaoTabela secao={relatorio.maoObraMuro.baldrameAlvenaria} />
              <SecaoTabela secao={relatorio.maoObraMuro.pinturaMuro} />
              <Card className="mb-4">
                <CardContent className="py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold">{formatarMoeda(relatorio.maoObraMuro.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>BDI ({relatorio.maoObraMuro.bdiPercentual}%)</span>
                      <span>{formatarMoeda(relatorio.maoObraMuro.bdi)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL GERAL - MAO DE OBRA MURO</span>
                    <span className="text-2xl font-bold">{formatarMoeda(relatorio.maoObraMuro.totalGeral)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedContent>
        );

      case 'orcamento-piscina':
        return (
          <AnimatedContent>
            <div>
              <h2 className="text-xl font-bold mb-4">Orcamento Piscina - Materiais</h2>
              <SecaoTabela secao={relatorio.orcamentoPiscina.estrutura} />
              <SecaoTabela secao={relatorio.orcamentoPiscina.impermeabilizacao} />
              <SecaoTabela secao={relatorio.orcamentoPiscina.revestimento} />
              <SecaoTabela secao={relatorio.orcamentoPiscina.equipamentos} />
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL GERAL - MATERIAIS PISCINA</span>
                    <span className="text-2xl font-bold">{formatarMoeda(relatorio.orcamentoPiscina.totalGeral)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedContent>
        );

      case 'mao-obra-piscina':
        return (
          <AnimatedContent>
            <div>
              <h2 className="text-xl font-bold mb-4">Mao de Obra - Piscina</h2>
              <SecaoTabela secao={relatorio.maoObraPiscina.estrutura} />
              <SecaoTabela secao={relatorio.maoObraPiscina.impermeabilizacao} />
              <SecaoTabela secao={relatorio.maoObraPiscina.revestimento} />
              <SecaoTabela secao={relatorio.maoObraPiscina.equipamentos} />
              <SecaoTabela secao={relatorio.maoObraPiscina.limpezaObra} />
              <Card className="mb-4">
                <CardContent className="py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold">{formatarMoeda(relatorio.maoObraPiscina.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>BDI ({relatorio.maoObraPiscina.bdiPercentual}%)</span>
                      <span>{formatarMoeda(relatorio.maoObraPiscina.bdi)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL GERAL - MAO DE OBRA PISCINA</span>
                    <span className="text-2xl font-bold">{formatarMoeda(relatorio.maoObraPiscina.totalGeral)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedContent>
        );

      case 'memorial-estrutural':
        return <MemorialEstruturalView memorial={relatorio.memorialEstrutural} />;

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Mobile menu */}
      <div className="lg:hidden">
        <MobileMenu
          tipoAtivo={tipoAtivo}
          onChange={setTipoAtivo}
          relatorio={relatorio}
        />
      </div>

      {/* Desktop tabs */}
      <Tabs value={tipoAtivo} onValueChange={(v) => setTipoAtivo(v as TipoRelatorio)} className="w-full">
        <TabsList className="hidden lg:flex w-full h-auto flex-wrap gap-1 bg-muted/50 p-1">
          {enabledTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {tab.icon}
              <span className="hidden xl:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {renderConteudo()}
          </AnimatePresence>
        </div>
      </Tabs>
    </motion.div>
  );
}
