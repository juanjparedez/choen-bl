"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
export interface Serie {
  id: string;
  titulo: string;
  año?: number;
  rating?: number;
  pais?: string;
  poster?: string;
  temporadas?: number;
  episodios?: number;
  sinopsis?: string;
  creador?: string;
  productora?: string;
  estado?: string;
  actores?: SerieActor[];
}
import { useActorsManager } from "../hooks/useActorsManager";
import ActorsManager from "./ActorsManager";

interface SavedActor extends SerieActor {
  serieId: string;
  actorId: string;
  actor: Actor;
}

interface Actor {
  apellido: string;
  id: string;
  nombre: string;
  nacionalidad: string;
}

export interface SerieActor {
  actor: Actor;
  personaje: string;
  tipoRol: "PROTAGONISTA" | "ANTAGONISTA" | "SECUNDARIO" | "INVITADO";
  esParejaPrincipal: boolean;
}

interface SeriesGridProps {
  series: Serie[];
  viewType: "grid" | "edit";
}

export default function SeriesGrid({ series, viewType }: SeriesGridProps) {
  const [editingSerie, setEditingSerie] = useState<string | null>(null);
  const [editedSeries, setEditedSeries] = useState<
    Record<string, Partial<Serie>>
  >({});

  const { saveActors, loading: actorsLoading } = useActorsManager();

  const handleActorsChange = async (serieId: string, actors: SerieActor[]) => {
    try {
      await saveActors(
        serieId,
        actors.map((actor) => ({
          ...actor,
          serieId,
          actorId: actor.actor.id,
          actor: {
            id: actor.actor.id,
            nombre: actor.actor.nombre,
            nacionalidad: actor.actor.nacionalidad,
            apellido: actor.actor.apellido || "",
          },
        })) satisfies SavedActor[] // Usa satisfies para inferencia sin any
      );
      // TODO: toast de éxito
    } catch (error) {
      console.error("Error saving actors:", error);
      // TODO: mostrar error al usuario
    }
  };

  if (!series.length) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400">
        <p>No hay series disponibles</p>
      </div>
    );
  }

  if (viewType === "grid") {
    return <GridView series={series} />;
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
          onUpdate={(field, value) => updateSerie(serie.id, field, value)} // Closure para incluir serie.id
          getCurrentValue={(field) => getCurrentValue(serie, field)} // Closure para incluir serie
          actorsLoading={actorsLoading}
          onActorsChange={(actors) => handleActorsChange(serie.id, actors)}
        />
      ))}
    </div>
  );
}

// Vista de grid separada para claridad
function GridView({ series }: { series: Serie[] }) {
  const cardClass =
    "group block bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300";
  const posterContainerClass =
    "relative aspect-[2/3] bg-slate-200 dark:bg-slate-700";
  const titleClass =
    "text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors";
  const detailsClass =
    "flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {series.map((serie) => (
        <Link key={serie.id} href={`/series/${serie.id}`} className={cardClass}>
          <div className={posterContainerClass}>
            {serie.poster ? (
              <Image
                src={
                  serie.poster.startsWith("/") || serie.poster.startsWith("http")
                    ? serie.poster
                    : "/" + serie.poster
                }
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
            <h3 className={titleClass}>{serie.titulo}</h3>
            <div className={detailsClass}>
              {serie.año && <span>{serie.año}</span>}
              {serie.rating && <span>★ {serie.rating}</span>}
            </div>
          </div>
        </Link>
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
  actorsLoading: boolean;
  onActorsChange: (actors: SerieActor[]) => void | Promise<void>;
}

function SeriesEditCard({
  serie,
  isEditing,
  onEdit,
  onUpdate,
  getCurrentValue,
  actorsLoading,
  onActorsChange,
}: SeriesEditCardProps) {
  const cardClass =
    "bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden";
  const headerClass =
    "flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700";
  const posterContainerClass =
    "relative w-12 h-16 flex-shrink-0 bg-slate-200 dark:bg-slate-600 rounded";
  const titleClass = "font-semibold text-slate-900 dark:text-slate-100";
  const detailsClass =
    "flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400";
  const viewButtonClass =
    "px-3 py-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400";
  const editButtonClassBase =
    "px-3 py-1.5 text-xs font-medium rounded transition-colors";
  const editButtonActive = `${editButtonClassBase} bg-violet-600 text-white`;
  const editButtonInactive = `${editButtonClassBase} bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300`;
  const editPanelClass =
    "p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700";
  const gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";

  return (
    <div className={cardClass}>
      {/* Header compacto */}
      <div className={headerClass}>
        <div className="flex items-center gap-3">
          <div className={posterContainerClass}>
            {serie.poster ? (
              <Image
                src={
                  serie.poster.startsWith("/") || serie.poster.startsWith("http")
                    ? serie.poster
                    : "/" + serie.poster
                }
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
            <h3 className={titleClass}>{serie.titulo}</h3>
            <div className={detailsClass}>
              <span>{serie.año}</span>
              <span>★ {serie.rating}</span>
              <span>{serie.pais}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/series/${serie.id}`} className={viewButtonClass}>
            Ver
          </Link>
          <button
            onClick={onEdit}
            className={isEditing ? editButtonActive : editButtonInactive}
          >
            {isEditing ? "Cerrar" : "Editar"}
          </button>
        </div>
      </div>

      {/* Panel expandible de edición */}
      {isEditing && (
        <div className={editPanelClass}>
          <div className={gridClass}>
            <BasicInfo getCurrentValue={getCurrentValue} onUpdate={onUpdate} />
            <ProductionInfo
              getCurrentValue={getCurrentValue}
              onUpdate={onUpdate}
            />
            <AdditionalInfo
              getCurrentValue={getCurrentValue}
              onUpdate={onUpdate}
            />
            <CastInfo
              serieId={serie.id}
              currentActors={(serie.actores || []).map((actor) => ({
                ...actor,
                tipoRol: actor.tipoRol ?? "SECUNDARIO",
              }))}
              onActorsChange={onActorsChange}
              actorsLoading={actorsLoading}
            />
            <ActionsSection />
          </div>
        </div>
      )}
    </div>
  );
}

// Clases comunes para inputs, labels, etc. (deprecamos inline)
const sectionClass = "space-y-4";
const h4Class = "font-medium text-slate-900 dark:text-slate-100";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
const inputClass =
  "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm";
const textareaClass = `${inputClass} resize-none`;
const selectClass = inputClass;
const buttonClass =
  "w-full px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors";
const saveButtonClass =
  "w-full px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded hover:bg-violet-700 transition-colors";

// Subcomponente: Información básica
function BasicInfo({
  getCurrentValue,
  onUpdate,
}: {
  getCurrentValue: SeriesEditCardProps["getCurrentValue"];
  onUpdate: SeriesEditCardProps["onUpdate"];
}) {
  return (
    <div className={sectionClass}>
      <h4 className={h4Class}>Información básica</h4>

      <div>
        <label className={labelClass}>Título</label>
        <input
          type="text"
          value={getCurrentValue("titulo") || ""}
          onChange={(e) => onUpdate("titulo", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Año</label>
          <input
            type="number"
            value={getCurrentValue("año") || ""}
            onChange={(e) =>
              onUpdate("año", parseInt(e.target.value) || undefined)
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Rating</label>
          <input
            type="number"
            min={1}
            max={10}
            step={0.1}
            value={getCurrentValue("rating") || ""}
            onChange={(e) =>
              onUpdate("rating", parseFloat(e.target.value) || undefined)
            }
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>País</label>
        <input
          type="text"
          value={getCurrentValue("pais") || ""}
          onChange={(e) => onUpdate("pais", e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

// Subcomponente: Producción
function ProductionInfo({
  getCurrentValue,
  onUpdate,
}: {
  getCurrentValue: SeriesEditCardProps["getCurrentValue"];
  onUpdate: SeriesEditCardProps["onUpdate"];
}) {
  return (
    <div className={sectionClass}>
      <h4 className={h4Class}>Producción</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Temporadas</label>
          <input
            type="number"
            value={getCurrentValue("temporadas") || ""}
            onChange={(e) =>
              onUpdate("temporadas", parseInt(e.target.value) || undefined)
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Episodios</label>
          <input
            type="number"
            value={getCurrentValue("episodios") || ""}
            onChange={(e) =>
              onUpdate("episodios", parseInt(e.target.value) || undefined)
            }
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Sinopsis</label>
        <textarea
          value={getCurrentValue("sinopsis") || ""}
          onChange={(e) => onUpdate("sinopsis", e.target.value)}
          rows={3}
          className={textareaClass}
        />
      </div>
    </div>
  );
}

// Subcomponente: Información adicional
function AdditionalInfo({
  getCurrentValue,
  onUpdate,
}: {
  getCurrentValue: SeriesEditCardProps["getCurrentValue"];
  onUpdate: SeriesEditCardProps["onUpdate"];
}) {
  return (
    <div className={sectionClass}>
      <h4 className={h4Class}>Información adicional</h4>

      <div>
        <label className={labelClass}>Creador</label>
        <input
          type="text"
          value={getCurrentValue("creador") || ""}
          onChange={(e) => onUpdate("creador", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Productora</label>
        <input
          type="text"
          value={getCurrentValue("productora") || ""}
          onChange={(e) => onUpdate("productora", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Estado</label>
        <select
          value={getCurrentValue("estado") || ""}
          onChange={(e) => onUpdate("estado", e.target.value)}
          className={selectClass}
        >
          <option value="">Seleccionar...</option>
          <option value="EN_EMISION">En emisión</option>
          <option value="FINALIZADA">Finalizada</option>
          <option value="PROXIMAMENTE">Próximamente</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="PAUSADA">Pausada</option>
        </select>
      </div>
    </div>
  );
}

// Subcomponente: Reparto
function CastInfo({
  serieId,
  currentActors,
  onActorsChange,
  actorsLoading,
}: {
  serieId: string;
  currentActors: SerieActor[];
  onActorsChange: (actors: SerieActor[]) => void | Promise<void>;
  actorsLoading: boolean;
}) {
  return (
    <div className={sectionClass}>
      <h4 className={h4Class}>Reparto</h4>

      <ActorsManager
        serieId={serieId}
        currentActors={currentActors}
        onChange={(actors) =>
          onActorsChange(
            actors.map((actor) => ({
              ...actor,
              esParejaPrincipal: actor.esParejaPrincipal ?? false,
              actor: {
                id: actor.actor.id,
                nombre: actor.actor.nombre,
                apellido: actor.actor.apellido ?? "",
                nacionalidad: actor.actor.nacionalidad ?? "",
              },
            }))
          )
        }
      />

      {actorsLoading && (
        <div className="text-sm text-violet-600">Guardando actores...</div>
      )}
    </div>
  );
}

// Subcomponente: Acciones
function ActionsSection() {
  return (
    <div className={sectionClass}>
      <h4 className={h4Class}>Acciones</h4>

      <div className="space-y-2">
        <button className={buttonClass}>+ Agregar Actor</button>
        <button className={buttonClass}>+ Agregar Género</button>
        <button className={buttonClass}>+ Agregar Plataforma</button>
        <button className={buttonClass}>📝 Edición Completa</button>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <button className={saveButtonClass}>Guardar Cambios</button>
      </div>
    </div>
  );
}
