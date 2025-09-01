import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Serie } from "../page";

interface SeriesGridProps {
  series: Serie[];
  viewType: "grid" | "edit";
}

export default function SeriesGrid({ series, viewType }: SeriesGridProps) {
  const [editingSerie, setEditingSerie] = useState<string | null>(null);
  const [editedSeries, setEditedSeries] = useState<
    Record<string, Partial<Serie>>
  >({});

  if (!series.length) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400">
        <p>No hay series disponibles</p>
      </div>
    );
  }

  if (viewType === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {series.map((serie) => (
          <Link
            key={serie.id}
            href={`/series/${serie.id}`}
            className="group block bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700">
              {serie.poster ? (
                <Image
                  src={serie.poster}
                  alt={serie.titulo}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                  Sin póster
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                {serie.titulo}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                {serie.año && <span>{serie.año}</span>}
                {serie.rating && <span>★ {serie.rating}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  const handleEdit = (serieId: string) => {
    setEditingSerie(editingSerie === serieId ? null : serieId);
  };

  const updateSerie = <K extends keyof Serie>(
    serieId: string,
    field: K,
    value: Serie[K] | undefined
  ) => {
    setEditedSeries((prev) => ({
      ...prev,
      [serieId]: {
        ...prev[serieId],
        [field]: value,
      },
    }));
  };

  const getCurrentValue = <K extends keyof Serie>(
    serie: Serie,
    field: K
  ): Serie[K] | undefined => {
    return editedSeries[serie.id]?.[field] ?? serie[field];
  };

  return (
    <div className="space-y-4">
      {series.map((serie) => (
        <SeriesEditCard
          key={serie.id}
          serie={serie}
          isEditing={editingSerie === serie.id}
          onEdit={() => handleEdit(serie.id)}
          onUpdate={(field, value) => updateSerie(serie.id, field, value)}
          getCurrentValue={(field) => getCurrentValue(serie, field)}
        />
      ))}
    </div>
  );
}

interface SeriesEditCardProps {
  serie: Serie;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: <K extends keyof Serie>(
    field: K,
    value: Serie[K] | undefined
  ) => void;
  getCurrentValue: <K extends keyof Serie>(field: K) => Serie[K] | undefined;
}

function SeriesEditCard({
  serie,
  isEditing,
  onEdit,
  onUpdate,
  getCurrentValue,
}: SeriesEditCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header compacto */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-16 flex-shrink-0 bg-slate-200 dark:bg-slate-600 rounded">
            {serie.poster ? (
              <Image
                src={serie.poster}
                alt={serie.titulo}
                fill
                sizes="48px"
                className="object-cover rounded"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                ?
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {serie.titulo}
            </h3>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span>{serie.año}</span>
              <span>★ {serie.rating}</span>
              <span>{serie.pais}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/series/${serie.id}`}
            className="px-3 py-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400"
          >
            Ver
          </Link>
          <button
            onClick={onEdit}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              isEditing
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {isEditing ? "Cerrar" : "Editar"}
          </button>
        </div>
      </div>

      {/* Panel expandible de edición */}
      {isEditing && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Información básica
              </h4>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={getCurrentValue("titulo") || ""}
                  onChange={(e) => onUpdate("titulo", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    value={getCurrentValue("año") || ""}
                    onChange={(e) =>
                      onUpdate("año", parseInt(e.target.value) || null)
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={getCurrentValue("rating") || ""}
                    onChange={(e) =>
                      onUpdate("rating", parseFloat(e.target.value) || null)
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  País
                </label>
                <input
                  type="text"
                  value={getCurrentValue("pais") || ""}
                  onChange={(e) => onUpdate("pais", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>
            </div>

            {/* Detalles de producción */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Producción
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Temporadas
                  </label>
                  <input
                    type="number"
                    value={getCurrentValue("temporadas") || ""}
                    onChange={(e) =>
                      onUpdate("temporadas", parseInt(e.target.value) || null)
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Episodios
                  </label>
                  <input
                    type="number"
                    value={getCurrentValue("episodios") || ""}
                    onChange={(e) =>
                      onUpdate("episodios", parseInt(e.target.value) || null)
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sinopsis
                </label>
                <textarea
                  value={getCurrentValue("sinopsis") || ""}
                  onChange={(e) => onUpdate("sinopsis", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm resize-none"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Información adicional
                </h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Creador
                  </label>
                  <input
                    type="text"
                    value={getCurrentValue("creador") || ""}
                    onChange={(e) => onUpdate("creador", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Productora
                  </label>
                  <input
                    type="text"
                    value={getCurrentValue("productora") || ""}
                    onChange={(e) => onUpdate("productora", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={getCurrentValue("estado") || ""}
                    onChange={(e) => onUpdate("estado", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="EN_EMISION">En emisión</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="PROXIMAMENTE">Próximamente</option>
                    <option value="CANCELADA">Cancelada</option>
                    <option value="PAUSADA">Pausada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Duración promedio (min)
                  </label>
                  <input
                    type="number"
                    value={getCurrentValue("duracionPromedio") || ""}
                    onChange={(e) =>
                      onUpdate(
                        "duracionPromedio",
                        parseInt(e.target.value) || null
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Acciones
              </h4>

              <div className="space-y-2">
                <button className="w-full px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                  + Agregar Actor
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                  + Agregar Género
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                  + Agregar Plataforma
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                  📝 Edición Completa
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button className="w-full px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded hover:bg-violet-700 transition-colors">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
