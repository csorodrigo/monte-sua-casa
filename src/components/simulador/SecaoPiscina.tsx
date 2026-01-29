'use client';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfiguracaoPiscina } from '@/types';

interface SecaoPiscinaProps {
  piscina: ConfiguracaoPiscina;
  onChangeIncluir: (valor: boolean) => void;
  onChangeLargura: (valor: number) => void;
  onChangeComprimento: (valor: number) => void;
  onChangeProfundidade: (valor: number) => void;
}

export function SecaoPiscina({
  piscina,
  onChangeIncluir,
  onChangeLargura,
  onChangeComprimento,
  onChangeProfundidade,
}: SecaoPiscinaProps) {
  const volume = piscina.largura * piscina.comprimento * piscina.profundidade;
  const areaSuperficie = piscina.largura * piscina.comprimento;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id="incluir-piscina"
            checked={piscina.incluir}
            onCheckedChange={(checked) => onChangeIncluir(checked === true)}
          />
          <CardTitle className="text-lg cursor-pointer">
            <label htmlFor="incluir-piscina">
              Piscina {piscina.incluir && `(${volume.toFixed(1)} m³)`}
            </label>
          </CardTitle>
        </div>
      </CardHeader>
      {piscina.incluir && (
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="piscina-largura">Largura (m)</Label>
              <Input
                id="piscina-largura"
                type="number"
                step="0.5"
                min="2"
                value={piscina.largura}
                onChange={(e) => onChangeLargura(parseFloat(e.target.value) || 4)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piscina-comprimento">Comprimento (m)</Label>
              <Input
                id="piscina-comprimento"
                type="number"
                step="0.5"
                min="3"
                value={piscina.comprimento}
                onChange={(e) => onChangeComprimento(parseFloat(e.target.value) || 8)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piscina-profundidade">Profundidade (m)</Label>
              <Input
                id="piscina-profundidade"
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={piscina.profundidade}
                onChange={(e) => onChangeProfundidade(parseFloat(e.target.value) || 1.5)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Area superficie: {areaSuperficie.toFixed(1)}m² | Volume: {volume.toFixed(1)}m³
          </p>
        </CardContent>
      )}
    </Card>
  );
}
