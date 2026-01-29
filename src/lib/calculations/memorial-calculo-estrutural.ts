// Memorial de Cálculo Estrutural - Baseado na planilha original

import { Comodo, TipoTijolo } from '@/types';
import { ALVENARIA } from './constants';

export interface CalculoFerro {
  pilar: {
    secao: number;        // dimensão da seção (cm)
    quantidade: number;   // kg
  };
  vigas: {
    perimetro: number;    // metros lineares
    quantidade: number;   // kg
  };
  fundacao: {
    quantidade: number;   // kg
  };
  total: number;          // kg total
}

export interface CalculoConcreto {
  pilar: {
    volume: number;       // m³
  };
  vigas: {
    volume: number;       // m³
  };
  laje: {
    volume: number;       // m³
  };
  fundacao: {
    volume: number;       // m³
  };
  total: number;          // m³ total
}

export interface CalculoForma {
  pilar: {
    secao: number;        // dimensão da seção (cm)
    area: number;         // m²
  };
  vigas: {
    perimetro: number;    // metros lineares
    area: number;         // m²
  };
  total: number;          // m² total
}

export interface MemorialCalculoEstrutural {
  // Estimativas base
  estimativaPilar: number;
  estimativaFundacao: number;

  // Dados de entrada
  areaTotal: number;
  perimetroExterno: number;
  peDireito: number;

  // Cálculos
  ferro: CalculoFerro;
  concreto: CalculoConcreto;
  forma: CalculoForma;

  // Resumo
  taxaFerro: number;      // kg/m² construído
  taxaConcreto: number;   // m³/m² construído
}

interface ParametrosMemorial {
  comodos: Comodo[];
  tipoTijolo: TipoTijolo;
}

/**
 * Calcula o memorial de cálculo estrutural
 * Baseado nas fórmulas da planilha original
 */
export function calcularMemorialEstrutural(params: ParametrosMemorial): MemorialCalculoEstrutural {
  const { comodos, tipoTijolo } = params;

  // Cálculo da área total
  const areaTotal = comodos.reduce((sum, c) => sum + (c.largura * c.comprimento), 0);

  // Estimativa do perímetro externo (simplificado como raiz quadrada da área * 4)
  const ladoEquivalente = Math.sqrt(areaTotal);
  const perimetroExterno = ladoEquivalente * 4;

  // Pé direito médio
  const peDireito = comodos.length > 0
    ? comodos.reduce((sum, c) => sum + (c.peDireito || ALVENARIA.alturaParede), 0) / comodos.length
    : ALVENARIA.alturaParede;

  // Estimativas conforme planilha
  // 1 pilar a cada 12-15 m² de área construída
  const estimativaPilar = Math.max(4, Math.ceil(areaTotal / 12));
  const estimativaFundacao = estimativaPilar; // 1 fundação por pilar

  // ========================================
  // CÁLCULO DO FERRO (kg)
  // ========================================
  // Pilar: seção 15x15cm, 4 barras de 10mm + estribos
  // Fórmula: qtdPilares * alturaPilar * taxaFerro
  const secaoPilar = 15; // cm
  const taxaFerroPilar = 35; // kg por pilar (altura média)
  const ferroPilar = estimativaPilar * taxaFerroPilar * tipoTijolo.multiplicadorFerro;

  // Vigas: seção 15x30cm
  // Fórmula: perímetro * taxaFerro
  const taxaFerroViga = 3.9; // kg por metro linear
  const ferroVigas = perimetroExterno * taxaFerroViga * tipoTijolo.multiplicadorFerro;

  // Fundação: baldrame
  // Fórmula: perímetro * taxaFerro
  const taxaFerroFundacao = 1.5; // kg por metro linear
  const ferroFundacao = perimetroExterno * taxaFerroFundacao;

  const ferroTotal = ferroPilar + ferroVigas + ferroFundacao;

  const ferro: CalculoFerro = {
    pilar: {
      secao: secaoPilar,
      quantidade: Math.round(ferroPilar * 100) / 100,
    },
    vigas: {
      perimetro: Math.round(perimetroExterno * 100) / 100,
      quantidade: Math.round(ferroVigas * 100) / 100,
    },
    fundacao: {
      quantidade: Math.round(ferroFundacao * 100) / 100,
    },
    total: Math.round(ferroTotal * 100) / 100,
  };

  // ========================================
  // CÁLCULO DO CONCRETO (m³)
  // ========================================
  // Pilar: 0.15 x 0.15 x altura
  const volumeConcretoPilar = estimativaPilar * 0.15 * 0.15 * peDireito;

  // Vigas: 0.15 x 0.30 x perímetro
  const volumeConcretoVigas = perimetroExterno * 0.15 * 0.30;

  // Laje: área x espessura (0.10m para laje mista)
  const espessuraLaje = 0.10;
  const volumeConcretoLaje = areaTotal * espessuraLaje;

  // Fundação: baldrame 0.40 x 0.40 x perímetro
  const volumeConcretoFundacao = perimetroExterno * 0.40 * 0.40;

  const concretoTotal = volumeConcretoPilar + volumeConcretoVigas + volumeConcretoLaje + volumeConcretoFundacao;

  const concreto: CalculoConcreto = {
    pilar: {
      volume: Math.round(volumeConcretoPilar * 100) / 100,
    },
    vigas: {
      volume: Math.round(volumeConcretoVigas * 100) / 100,
    },
    laje: {
      volume: Math.round(volumeConcretoLaje * 100) / 100,
    },
    fundacao: {
      volume: Math.round(volumeConcretoFundacao * 100) / 100,
    },
    total: Math.round(concretoTotal * 100) / 100,
  };

  // ========================================
  // CÁLCULO DA FORMA (m²)
  // ========================================
  // Pilar: perímetro da seção * altura * qtd pilares
  // Fórmula: 4 * lado * altura * qtd
  const areaFormaPilar = estimativaPilar * (4 * 0.15) * peDireito;

  // Vigas: (2 * altura + largura) * perímetro
  // Fórmula: (2 * 0.30 + 0.15) * perímetro
  const areaFormaVigas = perimetroExterno * (2 * 0.30 + 0.15);

  const formaTotal = areaFormaPilar + areaFormaVigas;

  const forma: CalculoForma = {
    pilar: {
      secao: secaoPilar,
      area: Math.round(areaFormaPilar * 100) / 100,
    },
    vigas: {
      perimetro: Math.round(perimetroExterno * 100) / 100,
      area: Math.round(areaFormaVigas * 100) / 100,
    },
    total: Math.round(formaTotal * 100) / 100,
  };

  // Taxas por m² construído
  const taxaFerro = ferroTotal / areaTotal;
  const taxaConcreto = concretoTotal / areaTotal;

  return {
    estimativaPilar,
    estimativaFundacao,
    areaTotal: Math.round(areaTotal * 100) / 100,
    perimetroExterno: Math.round(perimetroExterno * 100) / 100,
    peDireito: Math.round(peDireito * 100) / 100,
    ferro,
    concreto,
    forma,
    taxaFerro: Math.round(taxaFerro * 100) / 100,
    taxaConcreto: Math.round(taxaConcreto * 1000) / 1000,
  };
}

/**
 * Formata o memorial para exibição
 */
export function formatarMemorial(memorial: MemorialCalculoEstrutural): string {
  const linhas = [
    '╔════════════════════════════════════════════════════════════╗',
    '║          MEMORIAL DE CÁLCULO ESTRUTURAL                   ║',
    '╚════════════════════════════════════════════════════════════╝',
    '',
    '┌────────────────────────────────────────────────────────────┐',
    '│ DADOS DE ENTRADA                                          │',
    '├────────────────────────────────────────────────────────────┤',
    `│ Área Total:        ${memorial.areaTotal.toFixed(2).padStart(10)} m²                     │`,
    `│ Perímetro Externo: ${memorial.perimetroExterno.toFixed(2).padStart(10)} m                      │`,
    `│ Pé Direito Médio:  ${memorial.peDireito.toFixed(2).padStart(10)} m                      │`,
    `│ Estimativa Pilares:${memorial.estimativaPilar.toString().padStart(10)} unid                   │`,
    `│ Estimativa Fundação:${memorial.estimativaFundacao.toString().padStart(9)} unid                   │`,
    '└────────────────────────────────────────────────────────────┘',
    '',
    '┌────────────────────────────────────────────────────────────┐',
    '│ FERRO (kg)                                                 │',
    '├──────────────────────────────────────────────────┬─────────┤',
    `│ Pilar (seção ${memorial.ferro.pilar.secao}cm)                            │${memorial.ferro.pilar.quantidade.toFixed(2).padStart(8)} │`,
    `│ Vigas (${memorial.ferro.vigas.perimetro.toFixed(2)}m lineares)                     │${memorial.ferro.vigas.quantidade.toFixed(2).padStart(8)} │`,
    `│ Fundação                                         │${memorial.ferro.fundacao.quantidade.toFixed(2).padStart(8)} │`,
    '├──────────────────────────────────────────────────┼─────────┤',
    `│ TOTAL                                            │${memorial.ferro.total.toFixed(2).padStart(8)} │`,
    '└──────────────────────────────────────────────────┴─────────┘',
    '',
    '┌────────────────────────────────────────────────────────────┐',
    '│ CONCRETO (m³)                                              │',
    '├──────────────────────────────────────────────────┬─────────┤',
    `│ Pilar                                            │${memorial.concreto.pilar.volume.toFixed(2).padStart(8)} │`,
    `│ Vigas                                            │${memorial.concreto.vigas.volume.toFixed(2).padStart(8)} │`,
    `│ Laje                                             │${memorial.concreto.laje.volume.toFixed(2).padStart(8)} │`,
    `│ Fundação                                         │${memorial.concreto.fundacao.volume.toFixed(2).padStart(8)} │`,
    '├──────────────────────────────────────────────────┼─────────┤',
    `│ TOTAL                                            │${memorial.concreto.total.toFixed(2).padStart(8)} │`,
    '└──────────────────────────────────────────────────┴─────────┘',
    '',
    '┌────────────────────────────────────────────────────────────┐',
    '│ FORMA (m²)                                                 │',
    '├──────────────────────────────────────────────────┬─────────┤',
    `│ Pilar (seção ${memorial.forma.pilar.secao}cm)                            │${memorial.forma.pilar.area.toFixed(2).padStart(8)} │`,
    `│ Vigas                                            │${memorial.forma.vigas.area.toFixed(2).padStart(8)} │`,
    '├──────────────────────────────────────────────────┼─────────┤',
    `│ TOTAL                                            │${memorial.forma.total.toFixed(2).padStart(8)} │`,
    '└──────────────────────────────────────────────────┴─────────┘',
    '',
    '┌────────────────────────────────────────────────────────────┐',
    '│ ÍNDICES                                                    │',
    '├──────────────────────────────────────────────────┬─────────┤',
    `│ Taxa de Ferro (kg/m²)                            │${memorial.taxaFerro.toFixed(2).padStart(8)} │`,
    `│ Taxa de Concreto (m³/m²)                         │${memorial.taxaConcreto.toFixed(3).padStart(8)} │`,
    '└──────────────────────────────────────────────────┴─────────┘',
  ];

  return linhas.join('\n');
}
