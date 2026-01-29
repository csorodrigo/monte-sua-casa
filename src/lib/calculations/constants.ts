// Constantes para calculos de construcao

// Precos de materiais basicos (R$)
export const PRECOS = {
  // Concreto e cimento
  concretoPorM3: 450.00,           // Concreto usinado por m3
  cimentoPorSaco: 38.00,           // Saco de 50kg
  areiaPorM3: 120.00,              // Areia media
  britraPorM3: 130.00,             // Brita 1

  // Aco e ferro
  ferroPorKg: 8.50,                // Ferro CA-50/60
  aramePorKg: 14.00,               // Arame recozido

  // Fundacao
  sapataPorUnidade: 180.00,        // Sapata de concreto armado

  // Reboco e acabamento
  argamassaPorM2: 25.00,           // Argamassa para reboco

  // Instalacoes (estimativas por m2)
  eletricaPorM2: 85.00,            // Instalacao eletrica completa
  hidraulicaPorM2: 65.00,          // Instalacao hidraulica completa

  // Piso e revestimento (base popular)
  pisoPorM2: 45.00,
  azulejoPorM2: 55.00,

  // Esquadrias (portas e janelas por m2 construido)
  esquadriasPorM2: 120.00,

  // Pintura
  pinturaPorM2: 18.00,

  // Muro especificos
  muroMaterialPorM2: 180.00,       // Material para muro por m2
  muroMaoObraPorM2: 45.00,         // Mao de obra muro por m2

  // Piscina especificos
  piscinaMaterialPorM3: 850.00,    // Material por m3 de piscina
  piscinaMaoObraPorM3: 250.00,     // Mao de obra por m3
  piscinaAcabamentoPorM2: 120.00,  // Azulejo/acabamento superficie
};

// Parametros de calculo estrutural
export const ESTRUTURA = {
  // Pilares
  pilarPorM2: 0.08,               // 1 pilar a cada 12.5m2 (0.08 pilares por m2)
  alturaPilarPadrao: 3.0,          // Altura padrao do pilar em metros
  volumeConcretoPilar: 0.054,      // Volume concreto por pilar (0.3x0.3x0.6)
  ferroPorPilar: 24.0,             // Kg de ferro por pilar

  // Vigas
  alturaViga: 0.30,                // Altura da viga em metros
  larguraViga: 0.15,               // Largura da viga
  ferroPorMetroViga: 3.0,          // Kg de ferro por metro linear de viga

  // Fundacao
  profundidadeFundacao: 0.60,      // Profundidade da fundacao
  larguraFundacao: 0.40,           // Largura da vala de fundacao
  concretoPorMetroFundacao: 0.12,  // M3 de concreto por metro linear

  // Laje
  espessuraLaje: 0.12,             // Espessura da laje em metros
  ferroPorM2Laje: 4.5,             // Kg de ferro por m2 de laje

  // Contrapiso
  espessuraContrapiso: 0.05,       // 5cm de contrapiso
};

// Parametros de alvenaria
export const ALVENARIA = {
  espessuraParede: 0.15,           // Espessura padrao parede (15cm)
  alturaParede: 2.80,              // Pe direito padrao
  argamassaPorM2: 0.02,            // M3 de argamassa por m2 de parede

  // Reboco
  espessuraReboco: 0.02,           // 2cm de reboco
  argamassaRebocoPorM2: 0.025,     // M3 de argamassa por m2 de reboco
};

// Parametros de telhado
export const TELHADO = {
  inclinacaoMedia: 1.15,           // Multiplicador para inclinacao (15% a mais que area plana)
  beiralPadrao: 0.60,              // Beiral de 60cm
  estruturaMadeiraPorM2: 45.00,    // Custo estrutura madeira por m2
};

// Desperdicio e margem de seguranca
export const DESPERDICIO = {
  materiais: 1.10,                 // 10% de desperdicio em materiais
  ferro: 1.05,                     // 5% de desperdicio em ferro
  concreto: 1.08,                  // 8% de desperdicio em concreto
};

// Proporcoes de custo (baseado em SINAPI)
export const PROPORCOES_CUSTO = {
  fundacao: 0.08,                  // 8% do custo total
  estrutura: 0.15,                 // 15%
  alvenaria: 0.10,                 // 10%
  telhado: 0.10,                   // 10%
  instalacoes: 0.18,               // 18% (eletrica + hidraulica)
  acabamento: 0.25,                // 25%
  maoObra: 0.14,                   // 14%
};
