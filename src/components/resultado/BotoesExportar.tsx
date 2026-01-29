'use client';

import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';
import { ResultadoOrcamento } from '@/types';

interface BotoesExportarProps {
  resultado: ResultadoOrcamento;
}

export function BotoesExportar({ resultado }: BotoesExportarProps) {
  const exportarCSV = () => {
    const linhas: string[] = [];
    linhas.push('Secao,Item,Quantidade,Unidade,Preco Unitario,Total');

    const secoes = [
      resultado.breakdown.fundacao,
      resultado.breakdown.estrutura,
      resultado.breakdown.alvenaria,
      resultado.breakdown.telhado,
      resultado.breakdown.reboco,
      resultado.breakdown.acabamento,
      resultado.breakdown.maoObraCasa,
      resultado.breakdown.maoObraMuro,
      resultado.breakdown.maoObraPiscina,
      resultado.breakdown.muro,
      resultado.breakdown.piscina,
    ].filter(s => s && s.itens.length > 0);

    secoes.forEach(secao => {
      if (!secao) return;
      secao.itens.forEach(item => {
        linhas.push(
          `"${secao.nome}","${item.descricao}",${item.quantidade},"${item.unidade}",${item.precoUnitario},${item.total}`
        );
      });
      linhas.push(`"${secao.nome}","SUBTOTAL",,,,"${secao.subtotal}"`);
    });

    linhas.push('');
    linhas.push(`"TOTAL GERAL","",,,,"${resultado.totalGeral}"`);

    const csv = linhas.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orcamento-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const imprimir = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={exportarCSV}>
        <FileDown className="h-4 w-4 mr-2" />
        Exportar CSV
      </Button>
      <Button variant="outline" onClick={imprimir}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
    </div>
  );
}
