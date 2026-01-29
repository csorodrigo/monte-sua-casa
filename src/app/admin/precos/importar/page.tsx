'use client';

import { UploadExcel } from '@/components/admin/UploadExcel';
import { useAdminContext } from '../../layout';

export default function ImportarExcelPage() {
  const { senha } = useAdminContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar Planilha Excel</h1>
        <p className="text-muted-foreground">
          Faça upload de uma planilha Excel para atualizar os preços
        </p>
      </div>

      <UploadExcel senha={senha} />
    </div>
  );
}
