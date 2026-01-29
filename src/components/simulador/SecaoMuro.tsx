'use client';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfiguracaoMuro } from '@/types';

interface SecaoMuroProps {
  muro: ConfiguracaoMuro;
  onChangeIncluir: (valor: boolean) => void;
  onChangeFrente: (valor: number) => void;
  onChangeFundo: (valor: number) => void;
  onChangeDireita: (valor: number) => void;
  onChangeEsquerda: (valor: number) => void;
  onChangeAltura: (valor: number) => void;
}

export function SecaoMuro({
  muro,
  onChangeIncluir,
  onChangeFrente,
  onChangeFundo,
  onChangeDireita,
  onChangeEsquerda,
  onChangeAltura,
}: SecaoMuroProps) {
  const comprimentoTotal = muro.frente + muro.fundo + muro.direita + muro.esquerda;
  const areaTotal = comprimentoTotal * muro.altura;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id="incluir-muro"
            checked={muro.incluir}
            onCheckedChange={(checked) => onChangeIncluir(checked === true)}
          />
          <CardTitle className="text-lg cursor-pointer">
            <label htmlFor="incluir-muro">
              Muro {muro.incluir && `(${areaTotal.toFixed(1)} m²)`}
            </label>
          </CardTitle>
        </div>
      </CardHeader>
      {muro.incluir && (
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="muro-frente">Frente (m)</Label>
              <Input
                id="muro-frente"
                type="number"
                step="0.5"
                min="0"
                value={muro.frente}
                onChange={(e) => onChangeFrente(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="muro-fundo">Fundo (m)</Label>
              <Input
                id="muro-fundo"
                type="number"
                step="0.5"
                min="0"
                value={muro.fundo}
                onChange={(e) => onChangeFundo(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="muro-direita">Direita (m)</Label>
              <Input
                id="muro-direita"
                type="number"
                step="0.5"
                min="0"
                value={muro.direita}
                onChange={(e) => onChangeDireita(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="muro-esquerda">Esquerda (m)</Label>
              <Input
                id="muro-esquerda"
                type="number"
                step="0.5"
                min="0"
                value={muro.esquerda}
                onChange={(e) => onChangeEsquerda(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="muro-altura">Altura (m)</Label>
              <Input
                id="muro-altura"
                type="number"
                step="0.1"
                min="1"
                max="4"
                value={muro.altura}
                onChange={(e) => onChangeAltura(parseFloat(e.target.value) || 2.5)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Comprimento total: {comprimentoTotal.toFixed(1)}m | Area total: {areaTotal.toFixed(1)}m²
          </p>
        </CardContent>
      )}
    </Card>
  );
}
