'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevaSerieForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    sinopsis: '',
    año: new Date().getFullYear(),
    temporadas: 1,
    poster: '',
    pais: '',
    estado: 'EN_EMISION',
    rating: 0,
    trailerUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        router.push('/series')
        router.refresh()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Nueva Serie</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Título *</label>
          <input
            type="text"
            required
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sinopsis</label>
          <textarea
            rows={4}
            value={formData.sinopsis}
            onChange={(e) => setFormData({...formData, sinopsis: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Año</label>
            <input
              type="number"
              min="1900"
              max="2030"
              value={formData.año}
              onChange={(e) => setFormData({...formData, año: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Temporadas</label>
            <input
              type="number"
              min="1"
              value={formData.temporadas}
              onChange={(e) => setFormData({...formData, temporadas: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">País de Origen</label>
            <input
              type="text"
              value={formData.pais}
              onChange={(e) => setFormData({...formData, pais: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EN_EMISION">En emisión</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="PROXIMAMENTE">Próximamente</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">URL del Trailer</label>
            <input
              type="url"
              value={formData.trailerUrl}
              onChange={(e) => setFormData({...formData, trailerUrl: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL del Poster</label>
          <input
            type="url"
            value={formData.poster}
            onChange={(e) => setFormData({...formData, poster: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
          {formData.poster && (
            <img src={formData.poster} alt="Preview" className="mt-2 h-32 object-cover rounded" />
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Serie'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/series')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}