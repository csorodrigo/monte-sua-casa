'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Estado } from '@/types';

interface SeletorEstadoProps {
  estados: Estado[];
  valor: number;
  onChange: (id: number) => void;
}

export function SeletorEstado({ estados, valor, onChange }: SeletorEstadoProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="estado">Estado</Label>
      <Select
        value={valor.toString()}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger id="estado">
          <SelectValue placeholder="Selecione o estado" />
        </SelectTrigger>
        <SelectContent>
          {estados.map((estado) => (
            <SelectItem key={estado.id} value={estado.id.toString()}>
              {estado.sigla} - {estado.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
