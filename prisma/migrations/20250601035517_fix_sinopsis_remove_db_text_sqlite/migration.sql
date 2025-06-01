-- AlterTable
ALTER TABLE "Actor" ADD COLUMN "biografia" TEXT;

-- AlterTable
ALTER TABLE "PlataformaSerie" ADD COLUMN "urlSerieEnPlataforma" TEXT;

-- AlterTable
ALTER TABLE "Serie" ADD COLUMN "estado" TEXT;
ALTER TABLE "Serie" ADD COLUMN "pais" TEXT;
ALTER TABLE "Serie" ADD COLUMN "rating" REAL;
ALTER TABLE "Serie" ADD COLUMN "trailerUrl" TEXT;
