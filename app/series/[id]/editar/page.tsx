// /app/series/[id]/editar/page.tsx

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SerieForm from '../../../components/SerieForm'; // Adjusted path if needed
import { Genero, Tag } from '@prisma/client';

export default async function EditSeriePage({
  params: paramsPromise
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await paramsPromise;

  // Fetch the series to edit, including its related genres and tags
  const serie = await prisma.serie.findUnique({
    where: { id },
    include: {
      generos: { include: { genero: true } }, // Include to get current genres
      tags: { include: { tag: true } },       // Include to get current tags
      // Include other relations if you plan to edit them directly here
    },
  });

  if (!serie) {
    notFound();
  }

  // Fetch all available genres and tags for selection
  const allGenres = await prisma.genero.findMany({ orderBy: { nombre: 'asc' } });
  const allTags = await prisma.tag.findMany({ orderBy: { nombre: 'asc' } });

  // Prepare initialData for the form
  // Ensure all fields expected by SerieForm's initialData are covered
  const initialSerieData = {
    id: serie.id,
    titulo: serie.titulo || '',
    sinopsis: serie.sinopsis || '',
    año: serie.año || new Date().getFullYear(),
    temporadas: serie.temporadas || 1, // This is likely the scalar count
    poster: serie.poster || '',
    banner: serie.banner || '',
    estado: serie.estado || 'EN_EMISION',
    pais: serie.pais || '',
    rating: serie.rating || 0,
    trailerUrl: serie.trailerUrl || '',

    // New scalar fields from seed
    duracionPromedio: serie.duracionPromedio || 0,
    fechaEstreno: serie.fechaEstreno ? serie.fechaEstreno.toISOString().split('T')[0] : '', // Format as YYYY-MM-DD for date input
    creador: serie.creador || '',
    productora: serie.productora || '',
    // presupuesto: serie.presupuesto ? parseFloat(serie.presupuesto.toString()) : 0, // If you add these
    // recaudacion: serie.recaudacion ? parseFloat(serie.recaudacion.toString()) : 0,

    // IDs of currently associated genres and tags
    selectedGenreIds: serie.generos?.map(g => g.generoId) || [],
    selectedTagIds: serie.tags?.map(st => st.tagId) || [],

    // Pass all available options for multi-selects
    // These are not part of 'initialData' strictly, but props for SerieForm
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8">
      <SerieForm
        mode="edit"
        initialData={initialSerieData}
        allGenres={allGenres} // Pass all available genres
        allTags={allTags}     // Pass all available tags
      />
    </div>
  );
}
