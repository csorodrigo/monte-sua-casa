'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TipoTelhado } from '@/types';
import { formatarMoeda } from '@/lib/utils';

interface SeletorTelhadoProps {
  tipos: TipoTelhado[];
  valor: number;
  onChange: (id: number) => void;
}

export function SeletorTelhado({ tipos, valor, onChange }: SeletorTelhadoProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="telhado">Tipo de Telhado</Label>
      <Select
        value={valor.toString()}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger id="telhado">
          <SelectValue placeholder="Selecione o tipo de telhado" />
        </SelectTrigger>
        <SelectContent>
          {tipos.map((tipo) => (
            <SelectItem key={tipo.id} value={tipo.id.toString()}>
              {tipo.nome} - {formatarMoeda(tipo.precoPorM2)}/m²
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
