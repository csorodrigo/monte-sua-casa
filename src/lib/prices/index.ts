// Exportacoes centralizadas de precos
// Data de geracao: 2026-01-29 08:40:26

export * from './types';
export * from './orcamento-casa';
export * from './mao-obra-casa';

// Re-exporta funcoes de leitura de JSON para uso em server components
export { lerPrecos, lerConfiguracao } from '../admin/precos-json';
