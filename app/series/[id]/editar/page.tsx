// /app/series/[id]/editar/page.tsx

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SerieForm from '../../../components/SerieForm'

export default async function EditSeriePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const serie = await prisma.serie.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      sinopsis: true,
      año: true,
      temporadas: true,
      poster: true,
      estado: true,
      pais: true,
      rating: true,
      trailerUrl: true,
    },
  })

  if (!serie) notFound()

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8">
      <SerieForm
        mode="edit"
        initialData={{
          id: serie.id,
          titulo: serie.titulo,
          sinopsis: serie.sinopsis || '',
          año: serie.año || new Date().getFullYear(),
          temporadas: serie.temporadas || 1,
          poster: serie.poster || '',
          estado: serie.estado || 'EN_EMISION',
          pais: serie.pais || '',
          rating: serie.rating || 0,
          trailerUrl: serie.trailerUrl || '',
        }}
      />
    </div>
  )
}