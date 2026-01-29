import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Estados brasileiros com custos de mao de obra por m2
  const estados = [
    { sigla: 'AC', nome: 'Acre', custoMaoObraPorM2: 85.00 },
    { sigla: 'AL', nome: 'Alagoas', custoMaoObraPorM2: 75.00 },
    { sigla: 'AP', nome: 'Amapa', custoMaoObraPorM2: 90.00 },
    { sigla: 'AM', nome: 'Amazonas', custoMaoObraPorM2: 88.00 },
    { sigla: 'BA', nome: 'Bahia', custoMaoObraPorM2: 78.00 },
    { sigla: 'CE', nome: 'Ceara', custoMaoObraPorM2: 76.00 },
    { sigla: 'DF', nome: 'Distrito Federal', custoMaoObraPorM2: 95.00 },
    { sigla: 'ES', nome: 'Espirito Santo', custoMaoObraPorM2: 82.00 },
    { sigla: 'GO', nome: 'Goias', custoMaoObraPorM2: 80.00 },
    { sigla: 'MA', nome: 'Maranhao', custoMaoObraPorM2: 74.00 },
    { sigla: 'MT', nome: 'Mato Grosso', custoMaoObraPorM2: 84.00 },
    { sigla: 'MS', nome: 'Mato Grosso do Sul', custoMaoObraPorM2: 83.00 },
    { sigla: 'MG', nome: 'Minas Gerais', custoMaoObraPorM2: 85.00 },
    { sigla: 'PA', nome: 'Para', custoMaoObraPorM2: 82.00 },
    { sigla: 'PB', nome: 'Paraiba', custoMaoObraPorM2: 73.00 },
    { sigla: 'PR', nome: 'Parana', custoMaoObraPorM2: 88.00 },
    { sigla: 'PE', nome: 'Pernambuco', custoMaoObraPorM2: 77.00 },
    { sigla: 'PI', nome: 'Piaui', custoMaoObraPorM2: 72.00 },
    { sigla: 'RJ', nome: 'Rio de Janeiro', custoMaoObraPorM2: 92.00 },
    { sigla: 'RN', nome: 'Rio Grande do Norte', custoMaoObraPorM2: 75.00 },
    { sigla: 'RS', nome: 'Rio Grande do Sul', custoMaoObraPorM2: 90.00 },
    { sigla: 'RO', nome: 'Rondonia', custoMaoObraPorM2: 86.00 },
    { sigla: 'RR', nome: 'Roraima', custoMaoObraPorM2: 92.00 },
    { sigla: 'SC', nome: 'Santa Catarina', custoMaoObraPorM2: 89.00 },
    { sigla: 'SP', nome: 'Sao Paulo', custoMaoObraPorM2: 98.00 },
    { sigla: 'SE', nome: 'Sergipe', custoMaoObraPorM2: 74.00 },
    { sigla: 'TO', nome: 'Tocantins', custoMaoObraPorM2: 81.00 },
  ];

  for (const estado of estados) {
    await prisma.estado.upsert({
      where: { sigla: estado.sigla },
      update: estado,
      create: estado,
    });
  }
  console.log(`Created ${estados.length} estados`);

  // Tipos de telhado
  const tiposTelhado = [
    { nome: 'Fibrocimento', precoPorM2: 45.00 },
    { nome: 'Ceramica', precoPorM2: 85.00 },
    { nome: 'Concreto', precoPorM2: 120.00 },
    { nome: 'Metalico', precoPorM2: 95.00 },
    { nome: 'Colonial', precoPorM2: 110.00 },
  ];

  for (const telhado of tiposTelhado) {
    await prisma.tipoTelhado.upsert({
      where: { nome: telhado.nome },
      update: telhado,
      create: telhado,
    });
  }
  console.log(`Created ${tiposTelhado.length} tipos de telhado`);

  // Tipos de tijolo
  const tiposTijolo = [
    { nome: 'Ceramico 6 furos', precoUnidade: 0.85, tijolosPorM2: 33, multiplicadorFerro: 1.0 },
    { nome: 'Ceramico 8 furos', precoUnidade: 1.10, tijolosPorM2: 25, multiplicadorFerro: 1.0 },
    { nome: 'Bloco Concreto 14x19x39', precoUnidade: 3.50, tijolosPorM2: 13, multiplicadorFerro: 0.8 },
    { nome: 'Bloco Concreto 19x19x39', precoUnidade: 4.20, tijolosPorM2: 13, multiplicadorFerro: 0.7 },
    { nome: 'Tijolo Macico', precoUnidade: 0.95, tijolosPorM2: 45, multiplicadorFerro: 1.2 },
  ];

  for (const tijolo of tiposTijolo) {
    await prisma.tipoTijolo.upsert({
      where: { nome: tijolo.nome },
      update: tijolo,
      create: tijolo,
    });
  }
  console.log(`Created ${tiposTijolo.length} tipos de tijolo`);

  // Padroes de acabamento
  const padroesAcabamento = [
    { nome: 'Popular', multiplicadorPreco: 1.0, descricao: 'Acabamento basico, materiais economicos' },
    { nome: 'Medio', multiplicadorPreco: 1.3, descricao: 'Acabamento padrao, boa relacao custo-beneficio' },
    { nome: 'Alto', multiplicadorPreco: 1.6, descricao: 'Acabamento de qualidade superior' },
    { nome: 'Luxo', multiplicadorPreco: 2.0, descricao: 'Acabamento premium, materiais de primeira linha' },
  ];

  for (const padrao of padroesAcabamento) {
    await prisma.padraoAcabamento.upsert({
      where: { nome: padrao.nome },
      update: padrao,
      create: padrao,
    });
  }
  console.log(`Created ${padroesAcabamento.length} padroes de acabamento`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
