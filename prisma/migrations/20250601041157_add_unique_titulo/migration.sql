/*
  Warnings:

  - A unique constraint covering the columns `[titulo]` on the table `Serie` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Serie_titulo_key" ON "Serie"("titulo");
