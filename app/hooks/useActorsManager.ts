// /hooks/useActorsManager.ts
import { useState, useCallback } from "react";

interface SerieActor {
  serieId: string;
  actorId: string;
  actor: { id: string; nombre: string; nacionalidad?: string };
  personaje?: string;
  tipoRol?: string;
  orden?: number;
}

export const useActorsManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveActors = useCallback(
    async (serieId: string, actors: SerieActor[]) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("actores", JSON.stringify(actors));

        const response = await fetch(`/api/series/${serieId}`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) throw new Error("Error saving actors");
        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { saveActors, loading, error };
};
