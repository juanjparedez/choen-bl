import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Tipos para mejorar la legibilidad del código
type JsonEntry = {
  "Serie/película"?: string;
  Origen?: string;
  Año?: number;
  Temp?: number;
  Capítulos?: string | number;
  Novela?: boolean;
  Actores?: string;
  Personaje?: string;
  Puntos?: number;
  Observaciones?: string;
  "10"?: boolean;
};

// CAMBIO 4: Función para limpiar nombres de actores (ej: "Suradej Pinnirat (Bas)" -> "Suradej Pinnirat")
function cleanActorName(name: string): string {
  return name.replace(/\s\(.*\)/, "").trim();
}

// CAMBIO 5: Función para parsear el número de episodios
function parseEpisodios(
  capitulos: string | number | undefined
): number | undefined {
  if (typeof capitulos === "number") {
    return capitulos;
  }
  if (typeof capitulos === "string") {
    const parsed = parseInt(capitulos, 10);
    return isNaN(parsed) ? undefined : parsed; // Si no es un número (ej: "Peli"), devuelve undefined
  }
  return undefined;
}

async function main() {
  console.log("🌱 Iniciando la importación desde output.json...");
  const jsonPath = path.join(__dirname, "..", "output.json");
  const jsonData: JsonEntry[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  let currentSerieId: string | null = null;

  for (const entry of jsonData) {
    try {
      // Si la entrada tiene el campo "Serie/película", es una nueva serie.
      if (entry["Serie/película"]) {
        // CAMBIO 1: Generar un título único para evitar colisiones
        let uniqueTitulo = entry["Serie/película"];
        if (entry["Temp"] && entry["Temp"] > 1) {
          uniqueTitulo = `${uniqueTitulo} (Temp ${entry["Temp"]})`;
        } else if (String(entry["Capítulos"]).toLowerCase() === "peli") {
          // Opcional: una lógica similar para películas si el título se repite
          // uniqueTitulo = `${uniqueTitulo} (Movie)`;
        }

        console.log(`\n🎬 Procesando serie: ${uniqueTitulo}`);

        const serieData = {
          titulo: uniqueTitulo,
          año: entry["Año"],
          pais: entry["Origen"],
          sinopsis: entry["Observaciones"],
          rating: entry["Puntos"],
          temporadas:
            typeof entry["Temp"] === "number" ? entry["Temp"] : undefined,
          episodios: parseEpisodios(entry["Capítulos"]), // CAMBIO 5
        };

        // CAMBIO 2: Simplificar la lógica de creación/actualización con un solo `upsert`
        const newSerie = await prisma.serie.upsert({
          where: { id: serieData.titulo }, // Usa el título único para buscar
          update: serieData, // Si existe, actualízala
          create: serieData, // Si no existe, créala
        });

        currentSerieId = newSerie.id;
        console.log(
          `   ✅ Serie '${uniqueTitulo}' creada/actualizada con ID: ${currentSerieId}`
        );

        // Si la serie tiene un actor en la misma línea
        if (entry["Actores"] && entry["Actores"] !== "-") {
          await processActor(entry, currentSerieId);
        }
      } else if (
        currentSerieId &&
        entry["Actores"] &&
        entry["Actores"] !== "-"
      ) {
        // Si no es una nueva serie, es un actor de la serie anterior.
        await processActor(entry, currentSerieId);
      }
    } catch (error) {
      console.error(
        `❌ Error procesando la entrada: ${JSON.stringify(entry)}`,
        error
      );
    }
  }
  console.log("\n🌿 Importación completada!");
}

async function processActor(entry: JsonEntry, serieId: string) {
  const actorNameRaw = entry["Actores"];
  if (!actorNameRaw) return;

  const actorName = cleanActorName(actorNameRaw); // CAMBIO 4
  console.log(`   👤 Procesando actor: ${actorName}`);

  // CAMBIO 3: Simplificar la lógica de creación/actualización del actor
  const actor = await prisma.actor.upsert({
    where: { id: actorName }, // CORRECTO: 'id' es único
    update: {},
    create: { nombre: actorName },
  });

  await prisma.actorSerie.upsert({
    where: {
      serieId_actorId: {
        serieId: serieId,
        actorId: actor.id,
      },
    },
    update: {
      personaje: entry["Personaje"],
    },
    create: {
      serieId: serieId,
      actorId: actor.id,
      personaje: entry["Personaje"],
      tipoRol: "PRINCIPAL", // Asumimos PRINCIPAL, se puede ajustar
    },
  });
  console.log(`      ✔️ Actor "${actorName}" vinculado a la serie.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
