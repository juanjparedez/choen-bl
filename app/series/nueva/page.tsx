import SerieForm from "../../components/SerieForm";

export default function NuevaSeriePage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8">
      <SerieForm mode="create" />
    </div>
  )
}