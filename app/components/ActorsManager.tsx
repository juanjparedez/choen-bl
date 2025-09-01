"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; // 🔧 CAMBIO: usar Image de Next
import { X, Plus, Search, User, Star } from "lucide-react";

interface Actor {
  nacionalidad: string; // requerido
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  pais?: string;
  foto?: string;
}

interface SerieActor {
  id?: string;
  actor: Actor;
  personaje: string;
  tipoRol: "PROTAGONISTA" | "ANTAGONISTA" | "SECUNDARIO" | "INVITADO";
  esParejaPrincipal?: boolean;
}

interface ActorsManagerProps {
  serieId?: string;
  currentActors: SerieActor[];
  onChange: (actors: SerieActor[]) => void;
}

const TIPO_ROL_OPTIONS = [
  {
    value: "PROTAGONISTA",
    label: "Protagonista",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "ANTAGONISTA",
    label: "Antagonista",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "SECUNDARIO",
    label: "Secundario",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "INVITADO", label: "Invitado", color: "bg-gray-100 text-gray-800" },
];

export default function ActorsManager({
  serieId,
  currentActors,
  onChange,
}: ActorsManagerProps) {
  const [actors, setActors] = useState<SerieActor[]>(currentActors);
  const [availableActors, setAvailableActors] = useState<Actor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showNewActorForm, setShowNewActorForm] = useState(false);

  // Cargar actores disponibles
  useEffect(() => {
    const loadActors = async () => {
      try {
        // 🔧 CAMBIO: usar serieId para que no quede “unused” y de paso filtrar
        const qs = serieId ? `?serieId=${encodeURIComponent(serieId)}` : "";
        const response = await fetch(`/api/actores${qs}`);
        const data = await response.json();
        setAvailableActors(data);
      } catch (error) {
        console.error("Error loading actors:", error);
      }
    };
    loadActors();
  }, [serieId]);

  // Filtrar actores disponibles
  const filteredActors = availableActors.filter(
    (actor) =>
      `${actor.nombre} ${actor.apellido}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !actors.some((sa) => sa.actor.id === actor.id)
  );

  const addActor = (actor: Actor) => {
    const newSerieActor: SerieActor = {
      actor,
      personaje: "",
      tipoRol: "SECUNDARIO",
      esParejaPrincipal: false,
    };

    const newActors = [...actors, newSerieActor];
    setActors(newActors);
    onChange(newActors);
    setSearchQuery("");
    setEditingIndex(newActors.length - 1);
  };

  const updateActor = (index: number, updates: Partial<SerieActor>) => {
    const newActors = actors.map((actor, i) =>
      i === index ? { ...actor, ...updates } : actor
    );
    setActors(newActors);
    onChange(newActors);
  };

  const removeActor = (index: number) => {
    const newActors = actors.filter((_, i) => i !== index);
    setActors(newActors);
    onChange(newActors);
  };

  const createNewActor = async (actorData: Omit<Actor, "id">) => {
    try {
      const response = await fetch("/api/actores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actorData),
      });

      if (response.ok) {
        const newActor: Actor = await response.json();
        setAvailableActors((prev) => [...prev, newActor]);
        addActor(newActor);
        setShowNewActorForm(false);
      }
    } catch (error) {
      console.error("Error creating actor:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Actores y Personajes ({actors.length})
        </h3>
        <button
          onClick={() => setShowNewActorForm(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-violet-600 text-white rounded-md hover:bg-violet-700"
        >
          <Plus size={16} />
          Nuevo Actor
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar actor para agregar..."
          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          onFocus={() => setIsSearching(true)}
        />

        {/* Dropdown resultados */}
        {isSearching && searchQuery && filteredActors.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {filteredActors.slice(0, 10).map((actor) => (
              <button
                key={actor.id}
                onClick={() => {
                  addActor(actor);
                  setIsSearching(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                  {actor.foto ? (
                    // 🔧 CAMBIO: <img> → <Image />
                    <Image
                      src={actor.foto}
                      alt={actor.nombre}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {actor.nombre} {actor.apellido}
                  </div>
                  {actor.nacionalidad && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {actor.nacionalidad}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {actors.map((serieActor, index) => (
          <ActorCard
            key={`${serieActor.actor.id}-${index}`}
            serieActor={serieActor}
            // 🔧 CAMBIO: ActorCard ya no recibe `index`
            isEditing={editingIndex === index}
            onEdit={() =>
              setEditingIndex(editingIndex === index ? null : index)
            }
            onUpdate={(updates) => updateActor(index, updates)}
            onRemove={() => removeActor(index)}
          />
        ))}
      </div>

      {/* Form nuevo actor */}
      {showNewActorForm && (
        <NewActorForm
          onSubmit={createNewActor}
          onCancel={() => setShowNewActorForm(false)}
        />
      )}

      {/* Estado vacío */}
      {actors.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <User size={48} className="mx-auto mb-4 opacity-50" />
          <p>No hay actores asignados</p>
          <p className="text-sm">Busca y agrega actores arriba</p>
        </div>
      )}
    </div>
  );
}

function ActorCard({
  serieActor,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
}: {
  serieActor: SerieActor;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<SerieActor>) => void;
  onRemove: () => void;
}) {
  const { actor } = serieActor;
  const roleOption = TIPO_ROL_OPTIONS.find(
    (opt) => opt.value === serieActor.tipoRol
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
            {actor.foto ? (
              // 🔧 CAMBIO: <img> → <Image />
              <Image
                src={actor.foto}
                alt={actor.nombre}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User size={24} className="text-slate-400" />
            )}
          </div>

          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {actor.nombre} {actor.apellido}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {serieActor.personaje && (
                <span className="text-slate-600 dark:text-slate-400">
                  como {serieActor.personaje}
                </span>
              )}
              {roleOption && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${roleOption.color}`}
                >
                  {roleOption.label}
                </span>
              )}
              {serieActor.esParejaPrincipal && (
                // 🔧 CAMBIO: lucide no acepta title → aria-label
                <Star
                  size={14}
                  className="text-yellow-500"
                  aria-label="Pareja principal"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
          <button
            onClick={onRemove}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Panel edición */}
      {isEditing && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre del Personaje
              </label>
              <input
                type="text"
                value={serieActor.personaje}
                onChange={(e) => onUpdate({ personaje: e.target.value })}
                placeholder="Ej: Kim Tae-kyung"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipo de Rol
              </label>
              <select
                value={serieActor.tipoRol}
                onChange={(e) =>
                  onUpdate({ tipoRol: e.target.value as SerieActor["tipoRol"] })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {TIPO_ROL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!serieActor.esParejaPrincipal}
                  onChange={(e) =>
                    onUpdate({ esParejaPrincipal: e.target.checked })
                  }
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Es parte de la pareja principal
                </span>
                <Star
                  size={16}
                  className="text-yellow-500"
                  aria-label="Pareja principal"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewActorForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (actor: Omit<Actor, "id">) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nacionalidad: "", // 🔧 CAMBIO: agregar campo requerido
    fechaNacimiento: "",
    pais: "",
    foto: "",
  });

  const handleSubmit = () => {
    if (formData.nombre && formData.apellido) {
      // 🔧 CAMBIO: incluir nacionalidad
      const { nombre, apellido, nacionalidad, fechaNacimiento, pais, foto } =
        formData;
      onSubmit({ nombre, apellido, nacionalidad, fechaNacimiento, pais, foto });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Crear Nuevo Actor
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, nombre: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, apellido: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* 🔧 CAMBIO: Nacionalidad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nacionalidad *
            </label>
            <input
              type="text"
              value={formData.nacionalidad}
              onChange={(e) =>
                setFormData((p) => ({ ...p, nacionalidad: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              País
            </label>
            <input
              type="text"
              value={formData.pais}
              onChange={(e) =>
                setFormData((p) => ({ ...p, pais: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) =>
                setFormData((p) => ({ ...p, fechaNacimiento: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !formData.nombre || !formData.apellido || !formData.nacionalidad
              }
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Crear Actor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
