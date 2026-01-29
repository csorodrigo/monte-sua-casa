'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Save, RefreshCw } from 'lucide-react';
import { ResultadoOrcamento } from '@/types';
import { formatarMoeda, formatarArea } from '@/lib/utils';

interface ResumoLateralProps {
  resultado: ResultadoOrcamento | null;
  carregando: boolean;
  onCalcular: () => void;
  onSalvar: () => void;
  onLimpar: () => void;
}

export function ResumoLateral({
  resultado,
  carregando,
  onCalcular,
  onSalvar,
  onLimpar,
}: ResumoLateralProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Resumo do Orcamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resultado ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Area Construida:</span>
                <span className="font-medium">{formatarArea(resultado.areaTotalConstruida)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Area Paredes:</span>
                <span className="font-medium">{formatarArea(resultado.areaParedes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Area Telhado:</span>
                <span className="font-medium">{formatarArea(resultado.areaTelhado)}</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materiais:</span>
                <span className="font-medium">{formatarMoeda(resultado.totalMateriais)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mao de Obra:</span>
                <span className="font-medium">{formatarMoeda(resultado.totalMaoObra)}</span>
              </div>

              {resultado.muro && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Muro:</span>
                  <span className="font-medium">{formatarMoeda(resultado.muro.total)}</span>
                </div>
              )}

              {resultado.piscina && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Piscina:</span>
                  <span className="font-medium">{formatarMoeda(resultado.piscina.total)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Geral:</span>
                <span className="text-primary">{formatarMoeda(resultado.totalGeral)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatarMoeda(resultado.totalGeral / resultado.areaTotalConstruida)}/m²
              </p>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Preencha os dados e clique em Calcular para ver o orcamento
          </p>
        )}

        <div className="space-y-2 pt-4">
          <Button
            onClick={onCalcular}
            disabled={carregando}
            className="w-full"
            size="lg"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {carregando ? 'Calculando...' : 'Calcular'}
          </Button>

          {resultado && (
            <>
              <Button
                onClick={onSalvar}
                disabled={carregando}
                variant="outline"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Simulacao
              </Button>
            </>
          )}

          <Button
            onClick={onLimpar}
            variant="ghost"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
