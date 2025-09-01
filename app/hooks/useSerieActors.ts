// /hooks/useSerieActors.ts
import { useState, useCallback } from "react";

// Define SerieActor type if not imported from elsewhere
export interface SerieActor {
  actor: {
    id: string;
    // add other actor properties if needed
  };
  personaje: string;
  tipoRol: string;
  esParejaPrincipal: boolean;
}

export const useSerieActors = (serieId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSerieActors = useCallback(
    async (actors: SerieActor[]) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/series/${serieId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actores: actors.map((sa) => ({
              actorId: sa.actor.id,
              personaje: sa.personaje,
              tipoRol: sa.tipoRol,
              esParejaPrincipal: sa.esParejaPrincipal,
            })),
          }),
        });

        if (!response.ok) throw new Error("Error updating actors");

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [serieId]
  );

  return { updateSerieActors, loading, error };
};
