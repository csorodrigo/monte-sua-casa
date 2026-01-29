// Static data for construction budget simulator
// This data is used when database is not available (e.g., Vercel serverless)

export const estados = [
  { id: 1, sigla: 'AC', nome: 'Acre', custoMaoObraPorM2: 850 },
  { id: 2, sigla: 'AL', nome: 'Alagoas', custoMaoObraPorM2: 820 },
  { id: 3, sigla: 'AP', nome: 'Amapa', custoMaoObraPorM2: 870 },
  { id: 4, sigla: 'AM', nome: 'Amazonas', custoMaoObraPorM2: 880 },
  { id: 5, sigla: 'BA', nome: 'Bahia', custoMaoObraPorM2: 800 },
  { id: 6, sigla: 'CE', nome: 'Ceara', custoMaoObraPorM2: 780 },
  { id: 7, sigla: 'DF', nome: 'Distrito Federal', custoMaoObraPorM2: 950 },
  { id: 8, sigla: 'ES', nome: 'Espirito Santo', custoMaoObraPorM2: 850 },
  { id: 9, sigla: 'GO', nome: 'Goias', custoMaoObraPorM2: 830 },
  { id: 10, sigla: 'MA', nome: 'Maranhao', custoMaoObraPorM2: 760 },
  { id: 11, sigla: 'MT', nome: 'Mato Grosso', custoMaoObraPorM2: 860 },
  { id: 12, sigla: 'MS', nome: 'Mato Grosso do Sul', custoMaoObraPorM2: 840 },
  { id: 13, sigla: 'MG', nome: 'Minas Gerais', custoMaoObraPorM2: 870 },
  { id: 14, sigla: 'PA', nome: 'Para', custoMaoObraPorM2: 820 },
  { id: 15, sigla: 'PB', nome: 'Paraiba', custoMaoObraPorM2: 770 },
  { id: 16, sigla: 'PR', nome: 'Parana', custoMaoObraPorM2: 890 },
  { id: 17, sigla: 'PE', nome: 'Pernambuco', custoMaoObraPorM2: 810 },
  { id: 18, sigla: 'PI', nome: 'Piaui', custoMaoObraPorM2: 750 },
  { id: 19, sigla: 'RJ', nome: 'Rio de Janeiro', custoMaoObraPorM2: 950 },
  { id: 20, sigla: 'RN', nome: 'Rio Grande do Norte', custoMaoObraPorM2: 790 },
  { id: 21, sigla: 'RS', nome: 'Rio Grande do Sul', custoMaoObraPorM2: 900 },
  { id: 22, sigla: 'RO', nome: 'Rondonia', custoMaoObraPorM2: 850 },
  { id: 23, sigla: 'RR', nome: 'Roraima', custoMaoObraPorM2: 880 },
  { id: 24, sigla: 'SC', nome: 'Santa Catarina', custoMaoObraPorM2: 910 },
  { id: 25, sigla: 'SP', nome: 'Sao Paulo', custoMaoObraPorM2: 980 },
  { id: 26, sigla: 'SE', nome: 'Sergipe', custoMaoObraPorM2: 800 },
  { id: 27, sigla: 'TO', nome: 'Tocantins', custoMaoObraPorM2: 830 },
];

export const tiposTelhado = [
  { id: 1, nome: 'Telha Ceramica', precoPorM2: 85 },
  { id: 2, nome: 'Telha de Concreto', precoPorM2: 95 },
  { id: 3, nome: 'Telha Metalica', precoPorM2: 120 },
  { id: 4, nome: 'Telha de Fibrocimento', precoPorM2: 65 },
  { id: 5, nome: 'Telha Ecologica', precoPorM2: 110 },
];

export const tiposTijolo = [
  { id: 1, nome: 'Tijolo Ceramico 8 Furos', precoUnidade: 0.85, tijolosPorM2: 25, multiplicadorFerro: 1.0 },
  { id: 2, nome: 'Tijolo Ceramico 6 Furos', precoUnidade: 0.75, tijolosPorM2: 28, multiplicadorFerro: 1.0 },
  { id: 3, nome: 'Bloco de Concreto 14x19x39', precoUnidade: 3.50, tijolosPorM2: 13, multiplicadorFerro: 1.2 },
  { id: 4, nome: 'Bloco de Concreto 19x19x39', precoUnidade: 4.20, tijolosPorM2: 13, multiplicadorFerro: 1.3 },
  { id: 5, nome: 'Tijolo Macico', precoUnidade: 0.95, tijolosPorM2: 75, multiplicadorFerro: 0.8 },
];

export const padroesAcabamento = [
  { id: 1, nome: 'Popular', multiplicadorPreco: 0.8, descricao: 'Acabamento basico, materiais economicos' },
  { id: 2, nome: 'Padrao', multiplicadorPreco: 1.0, descricao: 'Acabamento medio, boa relacao custo-beneficio' },
  { id: 3, nome: 'Alto Padrao', multiplicadorPreco: 1.4, descricao: 'Acabamento superior, materiais de qualidade' },
  { id: 4, nome: 'Luxo', multiplicadorPreco: 1.8, descricao: 'Acabamento premium, materiais importados' },
];

// Helper function to get estado by id
export function getEstadoById(id: number) {
  return estados.find(e => e.id === id);
}

// Helper function to get tipo telhado by id
export function getTipoTelhadoById(id: number) {
  return tiposTelhado.find(t => t.id === id);
}

// Helper function to get tipo tijolo by id
export function getTipoTijoloById(id: number) {
  return tiposTijolo.find(t => t.id === id);
}

// Helper function to get padrao acabamento by id
export function getPadraoAcabamentoById(id: number) {
  return padroesAcabamento.find(p => p.id === id);
}
