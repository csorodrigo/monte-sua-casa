-- CreateTable
CREATE TABLE "Estado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "custoMaoObraPorM2" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TipoTelhado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "precoPorM2" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TipoTijolo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "precoUnidade" REAL NOT NULL,
    "tijolosPorM2" INTEGER NOT NULL,
    "multiplicadorFerro" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PadraoAcabamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "multiplicadorPreco" REAL NOT NULL,
    "descricao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Simulacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "estadoId" INTEGER NOT NULL,
    "tipoTelhadoId" INTEGER NOT NULL,
    "tipoTijoloId" INTEGER NOT NULL,
    "padraoAcabamentoId" INTEGER NOT NULL,
    "incluirRebocoExterno" BOOLEAN NOT NULL DEFAULT true,
    "incluirRebocoInterno" BOOLEAN NOT NULL DEFAULT true,
    "comodos" TEXT NOT NULL,
    "incluirMuro" BOOLEAN NOT NULL DEFAULT false,
    "muroFrente" REAL,
    "muroFundo" REAL,
    "muroDireita" REAL,
    "muroEsquerda" REAL,
    "muroAltura" REAL,
    "incluirPiscina" BOOLEAN NOT NULL DEFAULT false,
    "piscinaLargura" REAL,
    "piscinaComprimento" REAL,
    "piscinaProfundidade" REAL,
    "areaTotalConstruida" REAL NOT NULL,
    "totalMateriais" REAL NOT NULL,
    "totalMaoObra" REAL NOT NULL,
    "totalGeral" REAL NOT NULL,
    "breakdown" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Simulacao_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "Estado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Simulacao_tipoTelhadoId_fkey" FOREIGN KEY ("tipoTelhadoId") REFERENCES "TipoTelhado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Simulacao_tipoTijoloId_fkey" FOREIGN KEY ("tipoTijoloId") REFERENCES "TipoTijolo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Simulacao_padraoAcabamentoId_fkey" FOREIGN KEY ("padraoAcabamentoId") REFERENCES "PadraoAcabamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Estado_sigla_key" ON "Estado"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "TipoTelhado_nome_key" ON "TipoTelhado"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoTijolo_nome_key" ON "TipoTijolo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "PadraoAcabamento_nome_key" ON "PadraoAcabamento"("nome");
