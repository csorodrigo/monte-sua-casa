'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SecaoChurrasqueiraProps {
  incluir: boolean;
  onChange: (valor: boolean) => void;
}

export function SecaoChurrasqueira({
  incluir,
  onChange,
}: SecaoChurrasqueiraProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id="incluir-churrasqueira"
            checked={incluir}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
          <CardTitle className="text-lg cursor-pointer">
            <label htmlFor="incluir-churrasqueira">
              Churrasqueira
            </label>
          </CardTitle>
        </div>
      </CardHeader>
      {incluir && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Churrasqueira de medio porte em tijolo refratario, inclui estrutura basica e acabamento.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
