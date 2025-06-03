-- CreateIndex
CREATE INDEX "Episodio_temporadaId_idx" ON "Episodio"("temporadaId");

-- CreateIndex
CREATE INDEX "MediaItem_serieId_idx" ON "MediaItem"("serieId");

-- CreateIndex
CREATE INDEX "Temporada_serieId_idx" ON "Temporada"("serieId");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
