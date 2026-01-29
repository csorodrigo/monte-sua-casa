'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PadraoAcabamento } from '@/types';

interface SeletorPadraoProps {
  padroes: PadraoAcabamento[];
  valor: number;
  onChange: (id: number) => void;
}

export function SeletorPadrao({ padroes, valor, onChange }: SeletorPadraoProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="padrao">Padrao de Acabamento</Label>
      <Select
        value={valor.toString()}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger id="padrao">
          <SelectValue placeholder="Selecione o padrao de acabamento" />
        </SelectTrigger>
        <SelectContent>
          {padroes.map((padrao) => (
            <SelectItem key={padrao.id} value={padrao.id.toString()}>
              {padrao.nome} (x{padrao.multiplicadorPreco.toFixed(1)})
              {padrao.descricao && ` - ${padrao.descricao}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
