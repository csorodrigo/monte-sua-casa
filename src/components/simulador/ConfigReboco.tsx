'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ConfiguracaoReboco } from '@/types';

interface ConfigRebocoProps {
  reboco: ConfiguracaoReboco;
  onChangeExterno: (valor: boolean) => void;
  onChangeInterno: (valor: boolean) => void;
}

export function ConfigReboco({
  reboco,
  onChangeExterno,
  onChangeInterno,
}: ConfigRebocoProps) {
  return (
    <div className="space-y-3">
      <Label>Reboco</Label>
      <div className="flex gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reboco-externo"
            checked={reboco.externo}
            onCheckedChange={(checked) => onChangeExterno(checked === true)}
          />
          <Label htmlFor="reboco-externo" className="font-normal cursor-pointer">
            Externo
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reboco-interno"
            checked={reboco.interno}
            onCheckedChange={(checked) => onChangeInterno(checked === true)}
          />
          <Label htmlFor="reboco-interno" className="font-normal cursor-pointer">
            Interno
          </Label>
        </div>
      </div>
    </div>
  );
}
