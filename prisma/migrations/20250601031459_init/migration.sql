-- CreateTable
CREATE TABLE "Serie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "sinopsis" TEXT,
    "año" INTEGER,
    "temporadas" INTEGER NOT NULL DEFAULT 1,
    "poster" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Actor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "nacionalidad" TEXT,
    "fechaNac" DATETIME,
    "foto" TEXT
);

-- CreateTable
CREATE TABLE "ActorSerie" (
    "serieId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "personaje" TEXT,
    "tipoRol" TEXT,

    PRIMARY KEY ("serieId", "actorId"),
    CONSTRAINT "ActorSerie_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActorSerie_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Genero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GeneroSerie" (
    "serieId" TEXT NOT NULL,
    "generoId" TEXT NOT NULL,

    PRIMARY KEY ("serieId", "generoId"),
    CONSTRAINT "GeneroSerie_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GeneroSerie_generoId_fkey" FOREIGN KEY ("generoId") REFERENCES "Genero" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Idioma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "IdiomaSerie" (
    "serieId" TEXT NOT NULL,
    "idiomaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    PRIMARY KEY ("serieId", "idiomaId"),
    CONSTRAINT "IdiomaSerie_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdiomaSerie_idiomaId_fkey" FOREIGN KEY ("idiomaId") REFERENCES "Idioma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plataforma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "logo" TEXT
);

-- CreateTable
CREATE TABLE "PlataformaSerie" (
    "serieId" TEXT NOT NULL,
    "plataformaId" TEXT NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("serieId", "plataformaId"),
    CONSTRAINT "PlataformaSerie_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlataformaSerie_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "Plataforma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Genero_nombre_key" ON "Genero"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Idioma_nombre_key" ON "Idioma"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Idioma_codigo_key" ON "Idioma"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Plataforma_nombre_key" ON "Plataforma"("nombre");
