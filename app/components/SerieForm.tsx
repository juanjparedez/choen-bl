// /components/SerieForm.tsx - Componente reutilizable
'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageWithFallback from './ImageWithFallback' // Assuming this component is correctly implemented

interface SerieData {
  id?: string;
  titulo: string;
  sinopsis: string;
  año: number;
  temporadas: number;
  poster: string; // This will be the URL string from the server or empty
  pais: string;
  estado: string;
  rating: number;
  trailerUrl: string;
}

interface SerieFormProps {
  mode: 'create' | 'edit';
  initialData?: SerieData;
}

export default function SerieForm({ mode, initialData }: SerieFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null); // Stores Data URL for new files or existing URL for old files
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    sinopsis: initialData?.sinopsis || '',
    año: initialData?.año || new Date().getFullYear(),
    temporadas: initialData?.temporadas || 1,
    poster: initialData?.poster || '', // Initial poster URL, if any
    pais: initialData?.pais || '',
    estado: initialData?.estado || 'EN_EMISION',
    rating: initialData?.rating || 0,
    trailerUrl: initialData?.trailerUrl || ''
  })

  // Effect to show existing poster in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.poster) {
      setPreview(initialData.poster);
    }
  }, [mode, initialData?.poster]); // Dependency array refined

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(files[0]); // We only care about the first file for a poster
      fileInputRef.current.files = dt.files;

      // Trigger the change event manually to reuse handleImageChange
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null); // Reset error on new file selection

    if (!file) {
      // No file selected (e.g., user cleared the file input dialog)
      // Revert to initial poster if in edit mode, otherwise null
      setPreview(mode === 'edit' ? initialData?.poster || null : null);
      // Also update formData.poster if it was meant to be cleared
      if (!initialData?.poster) { // If there was no initial poster or in create mode
        setFormData(prev => ({ ...prev, poster: '' }));
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Formato no válido. Usa JPEG, PNG, WEBP o GIF');
      setPreview(mode === 'edit' ? initialData?.poster || null : null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear the invalid file
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('Imagen muy grande (máximo 2MB)');
      setPreview(mode === 'edit' ? initialData?.poster || null : null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear the oversized file
      return;
    }

    // Generate preview for the new file
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Note: formData.poster is NOT updated here with the data URL.
    // It holds the original poster URL or empty string.
    // The actual file for submission is taken from fileInputRef.current.files[0].
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFormData({ ...formData, poster: '' }); // Signal that poster should be removed/is not set
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = new FormData();

      // Append all text fields from formData
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'poster') { // Poster is handled separately
          dataToSend.append(key, String(value));
        }
      });

      const newPosterFile = fileInputRef.current?.files?.[0];

      if (newPosterFile) {
        // A new file has been selected (either by click or drag-drop)
        dataToSend.append('poster', newPosterFile);
      } else if (mode === 'edit' && initialData?.poster && !preview) {
        // In edit mode, there was an initial poster, but now there's no preview
        // (meaning it was removed by handleRemoveImage)
        dataToSend.append('poster', ''); // Send empty string to indicate removal
      }
      // If no new file and ( (mode is create and no preview) or (mode is edit and preview is initialData.poster) )
      // then 'poster' is not appended, and the backend should keep the existing one if any.

      const url = mode === 'create' ? '/api/series' : `/api/series/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        body: dataToSend
      });

      if (res.ok) {
        router.push('/series');
        router.refresh(); // Important for Next.js to refetch data on the target page
      } else {
        const errorData = await res.json();
        setError(errorData.error || `Error al ${mode === 'create' ? 'guardar' : 'actualizar'} la serie`);
      }
    } catch (err) {
      console.error(err); // Log the actual error for debugging
      setError('Error de conexión o al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'create' ? 'Nueva Serie' : 'Editar Serie'
  const submitText = mode === 'create' ? 'Guardar Serie' : 'Actualizar Serie'
  const submitLoadingText = mode === 'create' ? 'Guardando...' : 'Actualizando...'

  return (
    <div className="container mx-auto p-6 max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">{title}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
            Título *
          </label>
          <input
            id="titulo"
            type="text"
            required
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="sinopsis" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
            Sinopsis
          </label>
          <textarea
            id="sinopsis"
            rows={4}
            value={formData.sinopsis}
            onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="año" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Año
            </label>
            <input
              id="año"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 5} // Allow a few years in future
              value={formData.año}
              onChange={(e) => setFormData({ ...formData, año: parseInt(e.target.value) || new Date().getFullYear() })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="temporadas" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Temporadas
            </label>
            <input
              id="temporadas"
              type="number"
              min="1"
              value={formData.temporadas}
              onChange={(e) => setFormData({ ...formData, temporadas: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="pais" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              País de Origen
            </label>
            <input
              id="pais"
              type="text"
              value={formData.pais}
              onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Estado
            </label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
            >
              <option value="EN_EMISION">En emisión</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="PROXIMAMENTE">Próximamente</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="rating" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Rating (0-10)
            </label>
            <input
              id="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="trailerUrl" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              URL del Trailer
            </label>
            <input
              id="trailerUrl"
              type="url"
              value={formData.trailerUrl}
              onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
              placeholder="https://www.youtube.com/watch?v=example"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
            Póster
          </label>

          {preview ? (
            <div className="relative group border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-48 h-72 overflow-hidden rounded-lg shadow-lg bg-slate-200 dark:bg-slate-600">
                  {/* Consider using ImageWithFallback here if it handles placeholders / errors */}
                  {/* Example:
                  <ImageWithFallback
                    src={preview}
                    fallbackSrc="/placeholder-poster.png" // Provide a path to a fallback image
                    alt="Previsualización del póster"
                    className="w-full h-full object-cover"
                    width={192} // w-48 in Tailwind is typically 12rem (192px if 1rem=16px)
                    height={288} // h-72 is 18rem (288px)
                  />
                  */}
                  <img
                    src={preview}
                    alt="Previsualización del póster"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Cambiar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="posterFileInput"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer group transition-all duration-150 ease-in-out
                  ${isDragging
                    ? 'border-violet-500 bg-violet-100 dark:border-violet-400 dark:bg-slate-650 scale-105'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700'
                  }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-violet-500 dark:text-violet-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className={`mb-2 text-sm transition-colors ${isDragging ? 'text-violet-600 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                    <span className="font-semibold">Click para subir</span> o arrastra y suelta
                  </p>
                  <p className={`text-xs transition-colors ${isDragging ? 'text-violet-500 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    PNG, JPG, WEBP hasta 2MB
                  </p>
                </div>
              </label>
            </div>
          )}
          <input
            id="posterFileInput"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {submitLoadingText}
              </>
            ) : (
              submitText
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/series')}
            className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}