/*
  Warnings:

  - The primary key for the `IdiomaSerie` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Genero" ADD COLUMN "descripcion" TEXT;

-- AlterTable
ALTER TABLE "PlataformaSerie" ADD COLUMN "fechaIngreso" DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "PlataformaSerie" ADD COLUMN "fechaSalida" DATETIME;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Temporada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serieId" TEXT NOT NULL,
    "numeroTemporada" INTEGER NOT NULL,
    "titulo" TEXT,
    "sinopsis" TEXT,
    "fechaEstreno" DATETIME,
    "fechaFin" DATETIME,
    CONSTRAINT "Temporada_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Episodio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "temporadaId" TEXT NOT NULL,
    "numeroEpisodio" INTEGER NOT NULL,
    "titulo" TEXT,
    "sinopsis" TEXT,
    "duracion" INTEGER,
    "fechaEmision" DATETIME,
    CONSTRAINT "Episodio_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serieId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MediaItem_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "SerieTag" (
    "serieId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("serieId", "tagId"),
    CONSTRAINT "SerieTag_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SerieTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SerieRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serieId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "comentario" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SerieRating_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SerieRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serieId" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Watchlist_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActorSerie" (
    "serieId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "personaje" TEXT,
    "tipoRol" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 999,

    PRIMARY KEY ("serieId", "actorId"),
    CONSTRAINT "ActorSerie_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActorSerie_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActorSerie" ("actorId", "personaje", "serieId", "tipoRol") SELECT "actorId", "personaje", "serieId", "tipoRol" FROM "ActorSerie";
DROP TABLE "ActorSerie";
ALTER TABLE "new_ActorSerie" RENAME TO "ActorSerie";
CREATE INDEX "ActorSerie_serieId_idx" ON "ActorSerie"("serieId");
CREATE INDEX "ActorSerie_actorId_idx" ON "ActorSerie"("actorId");
CREATE TABLE "new_IdiomaSerie" (
    "serieId" TEXT NOT NULL,
    "idiomaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    PRIMARY KEY ("serieId", "idiomaId", "tipo"),
    CONSTRAINT "IdiomaSerie_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdiomaSerie_idiomaId_fkey" FOREIGN KEY ("idiomaId") REFERENCES "Idioma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IdiomaSerie" ("idiomaId", "serieId", "tipo") SELECT "idiomaId", "serieId", "tipo" FROM "IdiomaSerie";
DROP TABLE "IdiomaSerie";
ALTER TABLE "new_IdiomaSerie" RENAME TO "IdiomaSerie";
CREATE INDEX "IdiomaSerie_serieId_idx" ON "IdiomaSerie"("serieId");
CREATE INDEX "IdiomaSerie_idiomaId_idx" ON "IdiomaSerie"("idiomaId");
CREATE TABLE "new_Plataforma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "logo" TEXT,
    "urlBase" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Plataforma" ("id", "logo", "nombre") SELECT "id", "logo", "nombre" FROM "Plataforma";
DROP TABLE "Plataforma";
ALTER TABLE "new_Plataforma" RENAME TO "Plataforma";
CREATE UNIQUE INDEX "Plataforma_nombre_key" ON "Plataforma"("nombre");
CREATE TABLE "new_Serie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "sinopsis" TEXT,
    "año" INTEGER,
    "temporadas" INTEGER,
    "episodios" INTEGER,
    "duracionPromedio" INTEGER,
    "poster" TEXT,
    "backdrop" TEXT,
    "estado" TEXT,
    "pais" TEXT,
    "fechaEstreno" DATETIME,
    "fechaFinalizacion" DATETIME,
    "creador" TEXT,
    "productora" TEXT,
    "presupuesto" REAL,
    "recaudacion" REAL,
    "rating" REAL,
    "trailerUrl" TEXT,
    "premios" TEXT,
    "notasCritica" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Serie" ("año", "createdAt", "estado", "id", "pais", "poster", "rating", "sinopsis", "temporadas", "titulo", "trailerUrl", "updatedAt") SELECT "año", "createdAt", "estado", "id", "pais", "poster", "rating", "sinopsis", "temporadas", "titulo", "trailerUrl", "updatedAt" FROM "Serie";
DROP TABLE "Serie";
ALTER TABLE "new_Serie" RENAME TO "Serie";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Temporada_serieId_numeroTemporada_key" ON "Temporada"("serieId", "numeroTemporada");

-- CreateIndex
CREATE UNIQUE INDEX "Episodio_temporadaId_numeroEpisodio_key" ON "Episodio"("temporadaId", "numeroEpisodio");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_nombre_key" ON "Tag"("nombre");

-- CreateIndex
CREATE INDEX "SerieTag_serieId_idx" ON "SerieTag"("serieId");

-- CreateIndex
CREATE INDEX "SerieTag_tagId_idx" ON "SerieTag"("tagId");

-- CreateIndex
CREATE INDEX "SerieRating_serieId_idx" ON "SerieRating"("serieId");

-- CreateIndex
CREATE INDEX "SerieRating_userId_idx" ON "SerieRating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SerieRating_serieId_userId_key" ON "SerieRating"("serieId", "userId");

-- CreateIndex
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

-- CreateIndex
CREATE INDEX "Watchlist_serieId_idx" ON "Watchlist"("serieId");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_serieId_key" ON "Watchlist"("userId", "serieId");

-- CreateIndex
CREATE INDEX "GeneroSerie_serieId_idx" ON "GeneroSerie"("serieId");

-- CreateIndex
CREATE INDEX "GeneroSerie_generoId_idx" ON "GeneroSerie"("generoId");

-- CreateIndex
CREATE INDEX "PlataformaSerie_serieId_idx" ON "PlataformaSerie"("serieId");

-- CreateIndex
CREATE INDEX "PlataformaSerie_plataformaId_idx" ON "PlataformaSerie"("plataformaId");
