'use client';

import { useSimulacao } from '@/hooks/useSimulacao';
import { SeletorEstado } from '@/components/simulador/SeletorEstado';
import { ConfigReboco } from '@/components/simulador/ConfigReboco';
import { GridComodos } from '@/components/simulador/GridComodos';
import { SeletorTelhado } from '@/components/simulador/SeletorTelhado';
import { SeletorTijolo } from '@/components/simulador/SeletorTijolo';
import { SeletorPadrao } from '@/components/simulador/SeletorPadrao';
import { SecaoMuro } from '@/components/simulador/SecaoMuro';
import { SecaoPiscina } from '@/components/simulador/SecaoPiscina';
import { SecaoChurrasqueira } from '@/components/simulador/SecaoChurrasqueira';
import { ResumoLateral } from '@/components/simulador/ResumoLateral';
import { CardTotal } from '@/components/resultado/CardTotal';
import { BreakdownTable } from '@/components/resultado/BreakdownTable';
import { GraficoPizza } from '@/components/resultado/GraficoPizza';
import { GraficoBarras } from '@/components/resultado/GraficoBarras';
import { BotoesExportar } from '@/components/resultado/BotoesExportar';
import { RelatorioDetalhado } from '@/components/resultado/RelatorioDetalhado';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FAB, ScrollToTopFAB } from '@/components/ui/fab';
import { PageSkeleton } from '@/components/ui/skeletons';
import { FadeIn } from '@/components/ui/motion';
import { FileText, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const simulacao = useSimulacao();

  if (!simulacao.dadosIniciais) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Coluna do Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuracoes Gerais */}
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Settings className="h-4 w-4" />
                    </div>
                    <CardTitle>Configuracoes Gerais</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SeletorEstado
                    estados={simulacao.dadosIniciais.estados}
                    valor={simulacao.dados.estadoId}
                    onChange={simulacao.setEstado}
                  />
                  <SeletorPadrao
                    padroes={simulacao.dadosIniciais.padroesAcabamento}
                    valor={simulacao.dados.padraoAcabamentoId}
                    onChange={simulacao.setPadraoAcabamento}
                  />
                  <SeletorTelhado
                    tipos={simulacao.dadosIniciais.tiposTelhado}
                    valor={simulacao.dados.tipoTelhadoId}
                    onChange={simulacao.setTipoTelhado}
                  />
                  <SeletorTijolo
                    tipos={simulacao.dadosIniciais.tiposTijolo}
                    valor={simulacao.dados.tipoTijoloId}
                    onChange={simulacao.setTipoTijolo}
                  />
                  <ConfigReboco
                    reboco={simulacao.dados.reboco}
                    onChangeExterno={simulacao.setRebocoExterno}
                    onChangeInterno={simulacao.setRebocoInterno}
                  />
                </CardContent>
              </Card>
            </FadeIn>

            {/* Comodos */}
            <FadeIn delay={0.2}>
              <GridComodos
                comodos={simulacao.dados.comodos}
                onAdicionar={simulacao.adicionarComodo}
                onRemover={simulacao.removerComodo}
                onAtualizar={simulacao.atualizarComodo}
              />
            </FadeIn>

            {/* Muro */}
            <FadeIn delay={0.3}>
              <SecaoMuro
                muro={simulacao.dados.muro}
                onChangeIncluir={simulacao.setIncluirMuro}
                onChangeFrente={simulacao.setMuroFrente}
                onChangeFundo={simulacao.setMuroFundo}
                onChangeDireita={simulacao.setMuroDireita}
                onChangeEsquerda={simulacao.setMuroEsquerda}
                onChangeAltura={simulacao.setMuroAltura}
              />
            </FadeIn>

            {/* Piscina */}
            <FadeIn delay={0.4}>
              <SecaoPiscina
                piscina={simulacao.dados.piscina}
                onChangeIncluir={simulacao.setIncluirPiscina}
                onChangeLargura={simulacao.setPiscinaLargura}
                onChangeComprimento={simulacao.setPiscinaComprimento}
                onChangeProfundidade={simulacao.setPiscinaProfundidade}
              />
            </FadeIn>

            {/* Churrasqueira */}
            <FadeIn delay={0.45}>
              <SecaoChurrasqueira
                incluir={simulacao.dados.incluirChurrasqueira}
                onChange={simulacao.setIncluirChurrasqueira}
              />
            </FadeIn>

            {/* Resultado Detalhado */}
            {simulacao.resultado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 print:block"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-bold">Resultado do Orcamento</h2>
                  <div className="flex gap-2 flex-wrap items-center">
                    {simulacao.carregandoRelatorio && (
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 animate-pulse" />
                        Gerando relatorios...
                      </span>
                    )}
                    <BotoesExportar resultado={simulacao.resultado} />
                  </div>
                </div>

                <CardTotal
                  areaTotalConstruida={simulacao.resultado.areaTotalConstruida}
                  totalMateriais={simulacao.resultado.totalMateriais}
                  totalMaoObra={simulacao.resultado.totalMaoObra}
                  totalGeral={simulacao.resultado.totalGeral}
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <GraficoPizza
                    breakdown={simulacao.resultado.breakdown}
                    totalGeral={simulacao.resultado.totalGeral}
                  />
                  <GraficoBarras
                    breakdown={simulacao.resultado.breakdown}
                  />
                </div>

                <FadeIn delay={0.2}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Detalhamento por Categoria</h3>
                    <BreakdownTable breakdown={simulacao.resultado.breakdown} />
                  </div>
                </FadeIn>

                {/* Relatorio Detalhado Completo */}
                {simulacao.relatorioDetalhado && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <RelatorioDetalhado relatorio={simulacao.relatorioDetalhado} />
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Coluna do Resumo */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.2} direction="right">
              <ResumoLateral
                resultado={simulacao.resultado}
                carregando={simulacao.carregando}
                onCalcular={simulacao.calcular}
                onSalvar={simulacao.salvar}
                onLimpar={simulacao.limpar}
              />
            </FadeIn>

            {simulacao.erro && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="mt-4 border-destructive">
                  <CardContent className="pt-4">
                    <p className="text-destructive text-sm">{simulacao.erro}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Monte sua Casa - Simulador de Orcamento de Construcao</p>
          <p className="mt-1">Os valores sao estimativas e podem variar conforme regiao e mercado.</p>
        </div>
      </footer>

      {/* FAB for mobile */}
      <FAB
        onClick={simulacao.calcular}
        loading={simulacao.carregando}
        label="Calcular"
      />

      {/* Scroll to top */}
      <ScrollToTopFAB />
    </div>
  );
}
