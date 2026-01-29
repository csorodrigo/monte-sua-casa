const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../monte-sua-casa-simulacao.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('=== ABAS DO EXCEL ===');
console.log(workbook.SheetNames);

// Analisar aba QUESTIONÁRIO
console.log('\n=== ABA QUESTIONÁRIO ===');
const questionario = workbook.Sheets['QUESTIONÁRIO'];
if (questionario) {
  const range = XLSX.utils.decode_range(questionario['!ref'] || 'A1:Z100');
  console.log('Range:', questionario['!ref']);

  // Mostra as primeiras 50 linhas com conteúdo
  for (let r = range.s.r; r <= Math.min(range.e.r, 60); r++) {
    const row = [];
    for (let c = range.s.c; c <= Math.min(range.e.c, 10); c++) {
      const cell = questionario[XLSX.utils.encode_cell({ r, c })];
      if (cell) {
        row.push(`${XLSX.utils.encode_col(c)}${r+1}:${cell.v}`);
      }
    }
    if (row.length > 0) {
      console.log(`Linha ${r+1}:`, row.join(' | '));
    }
  }
}

// Analisar estrutura de uma aba de orçamento para ver as fórmulas
console.log('\n=== ABA ORÇAMENTO - CASA (primeiras células com fórmulas) ===');
const orcamento = workbook.Sheets['ORÇAMENTO - CASA'] || workbook.Sheets['ORCAMENTO - CASA'];
if (orcamento) {
  const range = XLSX.utils.decode_range(orcamento['!ref'] || 'A1:Z100');
  console.log('Range:', orcamento['!ref']);

  let formulasFound = 0;
  for (let r = range.s.r; r <= Math.min(range.e.r, 100) && formulasFound < 30; r++) {
    for (let c = range.s.c; c <= Math.min(range.e.c, 20); c++) {
      const cell = orcamento[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.f) {
        console.log(`${XLSX.utils.encode_col(c)}${r+1}: valor=${cell.v} | fórmula=${cell.f}`);
        formulasFound++;
      }
    }
  }

  // Mostrar colunas N e além (onde podem estar os preços de referência)
  console.log('\n=== Colunas N-Z (possíveis preços de referência) ===');
  for (let r = 0; r <= 30; r++) {
    const row = [];
    for (let c = 13; c <= 25; c++) { // N = 13
      const cell = orcamento[XLSX.utils.encode_cell({ r, c })];
      if (cell) {
        row.push(`${XLSX.utils.encode_col(c)}${r+1}:${cell.v}`);
      }
    }
    if (row.length > 0) {
      console.log(`Linha ${r+1}:`, row.join(' | '));
    }
  }
}

// Ver se há outras abas com dados de referência
console.log('\n=== OUTRAS ABAS ===');
for (const sheetName of workbook.SheetNames) {
  if (!sheetName.includes('ORÇAMENTO') && !sheetName.includes('ORCAMENTO') &&
      !sheetName.includes('MÃO DE OBRA') && !sheetName.includes('MAO DE OBRA') &&
      sheetName !== 'QUESTIONÁRIO' && sheetName !== 'RESUMO') {
    console.log(`\n--- ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z10');
    for (let r = range.s.r; r <= Math.min(range.e.r, 15); r++) {
      const row = [];
      for (let c = range.s.c; c <= Math.min(range.e.c, 10); c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        if (cell) {
          row.push(`${XLSX.utils.encode_col(c)}${r+1}:${cell.v}`);
        }
      }
      if (row.length > 0) {
        console.log(`Linha ${r+1}:`, row.join(' | '));
      }
    }
  }
}
