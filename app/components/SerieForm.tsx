// /components/SerieForm.tsx
'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Genero, Tag, EstadoSerie } from '@prisma/client'; // Import necessary types

// Assuming ImageWithFallback is correctly implemented if used
// import ImageWithFallback from './ImageWithFallback';

interface SerieFormData {
  id?: string;
  titulo: string;
  sinopsis: string;
  año: number;
  temporadas: number; // Scalar count of seasons
  poster: string;     // URL or empty string
  banner?: string;    // URL or empty string
  estado: string; // Should match EstadoSerie enum values
  pais: string;
  rating: number;
  trailerUrl: string;

  // New scalar fields
  duracionPromedio: number;
  fechaEstreno: string; // YYYY-MM-DD format
  creador: string;
  productora: string;
  // presupuesto?: number;
  // recaudacion?: number;

  // For handling relations - these will be arrays of IDs
  selectedGenreIds: string[];
  selectedTagIds: string[];
}

interface SerieFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<SerieFormData>; // Make initialData partial for create mode
  allGenres?: Genero[];
  allTags?: Tag[];
}

// A simple multi-select component (can be replaced with a library like react-select)
const MultiSelect = ({ label, options, selectedValues, onChange, placeholder }: {
  label: string;
  options: { id: string; nombre: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 text-left flex justify-between items-center"
      >
        <span className={selectedValues.length === 0 ? 'text-slate-400' : ''}>
          {selectedValues.length > 0
            ? `${selectedValues.length} seleccionado(s)`
            : (placeholder || `Seleccionar ${label.toLowerCase()}`)}
        </span>
        <svg className={`w-5 h-5 text-slate-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <label
              key={option.id}
              className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.id)}
                onChange={() => handleToggle(option.id)}
                className="form-checkbox h-4 w-4 text-violet-600 border-slate-300 dark:border-slate-500 rounded focus:ring-violet-500"
              />
              <span className="ml-3 text-sm text-slate-700 dark:text-slate-200">{option.nombre}</span>
            </label>
          ))}
          {options.length === 0 && <p className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">No hay opciones disponibles.</p>}
        </div>
      )}
    </div>
  );
};


export default function SerieForm({ mode, initialData = {}, allGenres = [], allTags = [] }: SerieFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // General form error

  const [posterPreview, setPosterPreview] = useState<string | null>(initialData?.poster || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.banner || null);

  const [posterError, setPosterError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [isPosterDragging, setIsPosterDragging] = useState(false);
  const [isBannerDragging, setIsBannerDragging] = useState(false);

  const posterFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SerieFormData>({
    titulo: initialData?.titulo || '',
    sinopsis: initialData?.sinopsis || '',
    año: initialData?.año || new Date().getFullYear(),
    temporadas: initialData?.temporadas || 1,
    poster: initialData?.poster || '', // Stores URL or empty string for removal signal
    banner: initialData?.banner || '', // Stores URL or empty string for removal signal
    estado: initialData?.estado || EstadoSerie.EN_EMISION,
    pais: initialData?.pais || '',
    rating: initialData?.rating || 0,
    trailerUrl: initialData?.trailerUrl || '',
    duracionPromedio: initialData?.duracionPromedio || 0,
    fechaEstreno: initialData?.fechaEstreno || '',
    creador: initialData?.creador || '',
    productora: initialData?.productora || '',
    selectedGenreIds: initialData?.selectedGenreIds || [],
    selectedTagIds: initialData?.selectedTagIds || [],
  });

  useEffect(() => {
    if (mode === 'edit') {
      setPosterPreview(initialData?.poster || null);
      setBannerPreview(initialData?.banner || null);
      // Set form data again to ensure all fields including new ones are populated
      setFormData({
        titulo: initialData?.titulo || '',
        sinopsis: initialData?.sinopsis || '',
        año: initialData?.año || new Date().getFullYear(),
        temporadas: initialData?.temporadas || 1,
        poster: initialData?.poster || '',
        banner: initialData?.banner || '',
        estado: initialData?.estado || EstadoSerie.EN_EMISION,
        pais: initialData?.pais || '',
        rating: initialData?.rating || 0,
        trailerUrl: initialData?.trailerUrl || '',
        duracionPromedio: initialData?.duracionPromedio || 0,
        fechaEstreno: initialData?.fechaEstreno || '',
        creador: initialData?.creador || '',
        productora: initialData?.productora || '',
        selectedGenreIds: initialData?.selectedGenreIds || [],
        selectedTagIds: initialData?.selectedTagIds || [],
      });
    }
  }, [mode, initialData]);


  // Poster Drag Handlers (similar to your existing logic)
  const handlePosterDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsPosterDragging(true); };
  const handlePosterDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsPosterDragging(false); };
  const handlePosterDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsPosterDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && posterFileInputRef.current) {
      const dt = new DataTransfer(); dt.items.add(files[0]);
      posterFileInputRef.current.files = dt.files;
      const event = new Event('change', { bubbles: true });
      posterFileInputRef.current.dispatchEvent(event);
    }
  };

  // Banner Drag Handlers (similar to your existing logic)
  const handleBannerDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsBannerDragging(true); };
  const handleBannerDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsBannerDragging(false); };
  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsBannerDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && bannerFileInputRef.current) {
      const dt = new DataTransfer(); dt.items.add(files[0]);
      bannerFileInputRef.current.files = dt.files;
      const event = new Event('change', { bubbles: true });
      bannerFileInputRef.current.dispatchEvent(event);
    }
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    imageType: 'poster' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    const setError = imageType === 'poster' ? setPosterError : setBannerError;
    const setPreview = imageType === 'poster' ? setPosterPreview : setBannerPreview;
    const initialImage = imageType === 'poster' ? initialData?.poster : initialData?.banner;
    const fileInputRefCurrent = imageType === 'poster' ? posterFileInputRef.current : bannerFileInputRef.current;

    setError(null);

    if (!file) {
      setPreview(mode === 'edit' ? initialImage || null : null);
      // If file is cleared, we don't automatically clear formData.poster/banner here.
      // The absence of a file in fileInputRef + formData.poster/banner being '' (from handleRemoveImage) signals removal.
      // If user just clears dialog, existing image (if any) remains unless explicitly removed.
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Formato no válido. Usa JPEG, PNG, WEBP o GIF');
      setPreview(mode === 'edit' ? initialImage || null : null);
      if (fileInputRefCurrent) fileInputRefCurrent.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('Imagen muy grande (máximo 2MB)');
      setPreview(mode === 'edit' ? initialImage || null : null);
      if (fileInputRefCurrent) fileInputRefCurrent.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    // Set formData.poster/banner to a placeholder if needed, or rely on fileInputRef for new uploads
    // For now, if a new file is selected, the file itself is the source of truth, not a data URL in formData.
  };

  const handleRemoveImage = (imageType: 'poster' | 'banner') => {
    if (imageType === 'poster') {
      setPosterPreview(null);
      setFormData(prev => ({ ...prev, poster: '' })); // Signal removal for PUT
      if (posterFileInputRef.current) posterFileInputRef.current.value = '';
    } else {
      setBannerPreview(null);
      setFormData(prev => ({ ...prev, banner: '' })); // Signal removal for PUT
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | string[] = value;

    if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value); // Keep as string if empty to allow clearing
    }
    // Specific handling for select or other types can be added here

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleMultiSelectChange = (name: 'selectedGenreIds' | 'selectedTagIds', selectedIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedIds
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setPosterError(null);
    setBannerError(null);

    const submissionFormData = new FormData();

    // Append all simple fields from formData state
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'poster' && key !== 'banner' && key !== 'selectedGenreIds' && key !== 'selectedTagIds') {
        if (value !== null && value !== undefined) { // Ensure value is not null/undefined
          submissionFormData.append(key, String(value));
        }
      }
    });

    // Append selectedGenreIds (as multiple entries or comma-separated string)
    // API needs to be ready to parse this. Sending as multiple entries is often cleaner.
    formData.selectedGenreIds.forEach(id => submissionFormData.append('genreIds[]', id));
    formData.selectedTagIds.forEach(id => submissionFormData.append('tagIds[]', id));

    // Handle poster file
    const posterFile = posterFileInputRef.current?.files?.[0];
    if (posterFile) {
      submissionFormData.append('posterFile', posterFile); // Use a distinct name like 'posterFile'
    } else if (formData.poster === '' && mode === 'edit') {
      submissionFormData.append('poster', ''); // Signal removal of existing poster
    }

    // Handle banner file
    const bannerFile = bannerFileInputRef.current?.files?.[0];
    if (bannerFile) {
      submissionFormData.append('bannerFile', bannerFile); // Use a distinct name like 'bannerFile'
    } else if (formData.banner === '' && mode === 'edit') {
      submissionFormData.append('banner', ''); // Signal removal of existing banner
    }

    const method = mode === 'edit' ? 'PUT' : 'POST';
    const url = mode === 'edit' ? `/api/series/${initialData?.id}` : '/api/series';

    try {
      const res = await fetch(url, {
        method,
        body: submissionFormData,
      });

      setLoading(false);
      if (res.ok) {
        router.push('/series'); // Or to the detail page: /series/${initialData?.id || (await res.json()).id}
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error('Error al guardar la serie:', errorData);
        setFormError(errorData.message || errorData.error || 'Error al guardar la serie.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error en el cliente:', error);
      setFormError('Ocurrió un error en el cliente al intentar guardar.');
    }
  };

  const pageTitle = mode === 'create' ? 'Nueva Serie' : 'Editar Serie';
  const submitText = mode === 'create' ? 'Guardar Serie' : 'Actualizar Serie';
  const submitLoadingText = mode === 'create' ? 'Guardando...' : 'Actualizando...';

  return (
    <div className="container mx-auto p-6 max-w-3xl bg-white dark:bg-slate-800 rounded-xl shadow-lg mt-8 mb-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">{pageTitle}</h1>

      {formError && (<div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">Error: {formError}</div>)}
      {posterError && (<div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">Póster: {posterError}</div>)}
      {bannerError && (<div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">Banner: {bannerError}</div>)}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titulo */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Título *</label>
          <input id="titulo" name="titulo" type="text" required value={formData.titulo} onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>

        {/* Sinopsis */}
        <div>
          <label htmlFor="sinopsis" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Sinopsis</label>
          <textarea id="sinopsis" name="sinopsis" rows={4} value={formData.sinopsis} onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Año */}
          <div>
            <label htmlFor="año" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Año</label>
            <input id="año" name="año" type="number" min="1900" max={new Date().getFullYear() + 10} value={formData.año} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
          {/* Temporadas (count) */}
          <div>
            <label htmlFor="temporadas" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Nº de Temporadas</label>
            <input id="temporadas" name="temporadas" type="number" min="0" value={formData.temporadas} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duración Promedio por Episodio */}
          <div>
            <label htmlFor="duracionPromedio" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Duración Prom. Episodio (min)</label>
            <input id="duracionPromedio" name="duracionPromedio" type="number" min="0" value={formData.duracionPromedio} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
          {/* Fecha de Estreno */}
          <div>
            <label htmlFor="fechaEstreno" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Fecha de Estreno</label>
            <input id="fechaEstreno" name="fechaEstreno" type="date" value={formData.fechaEstreno} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creador */}
          <div>
            <label htmlFor="creador" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Creador(es)</label>
            <input id="creador" name="creador" type="text" value={formData.creador} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
          {/* Productora */}
          <div>
            <label htmlFor="productora" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Productora(s)</label>
            <input id="productora" name="productora" type="text" value={formData.productora} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* País */}
          <div>
            <label htmlFor="pais" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">País</label>
            <input id="pais" name="pais" type="text" value={formData.pais} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
          {/* Estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Estado</label>
            <select id="estado" name="estado" value={formData.estado} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
              {Object.values(EstadoSerie).map(estadoVal => (
                <option key={estadoVal} value={estadoVal}>{estadoVal.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Rating (0-10)</label>
            <input id="rating" name="rating" type="number" min="0" max="10" step="0.1" value={formData.rating} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
          {/* Trailer URL */}
          <div>
            <label htmlFor="trailerUrl" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">URL del Trailer</label>
            <input id="trailerUrl" name="trailerUrl" type="url" value={formData.trailerUrl} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" placeholder="https://www.youtube.com/watch?v=example" />
          </div>
        </div>

        {/* Géneros MultiSelect */}
        <div>
          <MultiSelect
            label="Géneros"
            options={allGenres}
            selectedValues={formData.selectedGenreIds}
            onChange={(selected) => handleMultiSelectChange('selectedGenreIds', selected)}
            placeholder="Seleccionar géneros"
          />
        </div>

        {/* Tags MultiSelect */}
        <div>
          <MultiSelect
            label="Tags"
            options={allTags}
            selectedValues={formData.selectedTagIds}
            onChange={(selected) => handleMultiSelectChange('selectedTagIds', selected)}
            placeholder="Seleccionar tags"
          />
        </div>

        {/* Poster Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Póster</label>
          {posterPreview ? (
            <div className="relative group border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-48 h-72 overflow-hidden rounded-lg shadow-lg bg-slate-200 dark:bg-slate-600">
                  <img src={posterPreview} alt="Previsualización del póster" className="w-full h-full object-cover" />
                </div>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => posterFileInputRef.current?.click()} className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>Cambiar</span>
                  </button>
                  <button type="button" onClick={() => handleRemoveImage('poster')} className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="posterFileInput" onDragOver={handlePosterDragOver} onDragLeave={handlePosterDragLeave} onDrop={handlePosterDrop}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer group transition-all ${isPosterDragging ? 'border-violet-500 bg-violet-100 dark:border-violet-400 dark:bg-slate-650' : 'border-slate-300 dark:border-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className={`w-10 h-10 mb-3 ${isPosterDragging ? 'text-violet-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WEBP hasta 2MB</p>
                </div>
              </label>
            </div>
          )}
          <input id="posterFileInput" ref={posterFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleImageChange(e, 'poster')} className="hidden" />
        </div>

        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Banner</label>
          {bannerPreview ? (
            <div className="relative group border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-full aspect-video overflow-hidden rounded-lg shadow-lg bg-slate-200 dark:bg-slate-600">
                  <img src={bannerPreview} alt="Previsualización del banner" className="w-full h-full object-contain" />
                </div>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => bannerFileInputRef.current?.click()} className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>Cambiar</span>
                  </button>
                  <button type="button" onClick={() => handleRemoveImage('banner')} className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="bannerFileInput" onDragOver={handleBannerDragOver} onDragLeave={handleBannerDragLeave} onDrop={handleBannerDrop}
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer group transition-all ${isBannerDragging ? 'border-violet-500 bg-violet-100 dark:border-violet-400 dark:bg-slate-650' : 'border-slate-300 dark:border-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className={`w-10 h-10 mb-3 ${isBannerDragging ? 'text-violet-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WEBP hasta 2MB</p>
                </div>
              </label>
            </div>
          )}
          <input id="bannerFileInput" ref={bannerFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleImageChange(e, 'banner')} className="hidden" />
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading}
            className="flex-1 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center">
            {loading ? (
              <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {submitLoadingText}</>
            ) : submitText}
          </button>
          <button type="button" onClick={() => router.push('/series')}
            className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

