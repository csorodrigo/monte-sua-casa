'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TipoTijolo } from '@/types';
import { formatarMoeda } from '@/lib/utils';

interface SeletorTijoloProps {
  tipos: TipoTijolo[];
  valor: number;
  onChange: (id: number) => void;
}

export function SeletorTijolo({ tipos, valor, onChange }: SeletorTijoloProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tijolo">Tipo de Tijolo</Label>
      <Select
        value={valor.toString()}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger id="tijolo">
          <SelectValue placeholder="Selecione o tipo de tijolo" />
        </SelectTrigger>
        <SelectContent>
          {tipos.map((tipo) => (
            <SelectItem key={tipo.id} value={tipo.id.toString()}>
              {tipo.nome} - {formatarMoeda(tipo.precoUnidade)}/un ({tipo.tijolosPorM2}/m²)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
