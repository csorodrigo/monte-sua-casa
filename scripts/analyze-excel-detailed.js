const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../monte-sua-casa-simulacao.xlsx');
const workbook = XLSX.readFile(filePath);

// Analisar coluna I (preços base) na aba ORÇAMENTO - CASA
console.log('=== PREÇOS BASE (Coluna I) - ORÇAMENTO CASA ===');
const orcamento = workbook.Sheets['ORÇAMENTO - CASA'];
if (orcamento) {
  for (let r = 0; r <= 120; r++) {
    const cellB = orcamento[XLSX.utils.encode_cell({ r, c: 1 })]; // B = descrição
    const cellC = orcamento[XLSX.utils.encode_cell({ r, c: 2 })]; // C = código
    const cellD = orcamento[XLSX.utils.encode_cell({ r, c: 3 })]; // D = serviço
    const cellF = orcamento[XLSX.utils.encode_cell({ r, c: 5 })]; // F = unidade
    const cellI = orcamento[XLSX.utils.encode_cell({ r, c: 8 })]; // I = preço base

    if (cellI && (cellI.v || cellI.f)) {
      const desc = cellD?.v || cellC?.v || cellB?.v || '';
      const un = cellF?.v || '';
      console.log(`Linha ${r+1}: ${desc} | Un: ${un} | Preço Base I: ${cellI.v} | Fórmula: ${cellI.f || 'valor fixo'}`);
    }
  }
}

// Analisar aba QUESTIONÁRIO mais detalhadamente - especialmente os preços
console.log('\n\n=== QUESTIONÁRIO - TODOS OS PREÇOS E CONFIGURAÇÕES ===');
const questionario = workbook.Sheets['QUESTIONÁRIO'];
if (questionario) {
  const range = XLSX.utils.decode_range(questionario['!ref'] || 'A1:Z100');

  for (let r = 0; r <= 60; r++) {
    const row = [];
    for (let c = 0; c <= 15; c++) {
      const cell = questionario[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.v !== undefined) {
        const colLetter = XLSX.utils.encode_col(c);
        row.push(`${colLetter}${r+1}=${cell.v}`);
      }
    }
    if (row.length > 0) {
      console.log(row.join(' | '));
    }
  }
}

// Analisar estrutura dos tipos (telhado, tijolo, acabamento)
console.log('\n\n=== TIPOS DE TELHADO (procurando na planilha) ===');
// Procurar por células que contenham "LAJE" ou "TELHA"
for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100');

  for (let r = range.s.r; r <= Math.min(range.e.r, 100); r++) {
    for (let c = range.s.c; c <= Math.min(range.e.c, 20); c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.v && typeof cell.v === 'string') {
        const val = cell.v.toUpperCase();
        if (val.includes('LAJE') || val.includes('TELHA') || val.includes('FIBROCIMENTO') || val.includes('COBERTA')) {
          const nextCells = [];
          for (let nc = c; nc <= Math.min(c + 5, range.e.c); nc++) {
            const nextCell = sheet[XLSX.utils.encode_cell({ r, c: nc })];
            if (nextCell) nextCells.push(`${XLSX.utils.encode_col(nc)}=${nextCell.v}`);
          }
          console.log(`${sheetName} - Linha ${r+1}: ${nextCells.join(' | ')}`);
        }
      }
    }
  }
}

// Ver MÃO DE OBRA para entender a estrutura
console.log('\n\n=== MÃO DE OBRA - CASA (estrutura) ===');
const maoObra = workbook.Sheets['MÃO DE OBRA - CASA'];
if (maoObra) {
  for (let r = 0; r <= 50; r++) {
    const cellB = maoObra[XLSX.utils.encode_cell({ r, c: 1 })];
    const cellC = maoObra[XLSX.utils.encode_cell({ r, c: 2 })];
    const cellD = maoObra[XLSX.utils.encode_cell({ r, c: 3 })];
    const cellF = maoObra[XLSX.utils.encode_cell({ r, c: 5 })];
    const cellG = maoObra[XLSX.utils.encode_cell({ r, c: 6 })]; // quantidade
    const cellH = maoObra[XLSX.utils.encode_cell({ r, c: 7 })]; // preço unit
    const cellI = maoObra[XLSX.utils.encode_cell({ r, c: 8 })]; // preço base
    const cellJ = maoObra[XLSX.utils.encode_cell({ r, c: 9 })];

    if (cellH && (cellH.v || cellH.f)) {
      const desc = cellD?.v || cellC?.v || cellB?.v || '';
      console.log(`Linha ${r+1}: ${desc} | H=${cellH.v} | I=${cellI?.v || ''} | Fórmula H: ${cellH.f || 'fixo'}`);
    }
  }
}
