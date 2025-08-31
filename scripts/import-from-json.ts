
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Tipos para mejorar la legibilidad del código
type JsonEntry = {
    'Serie/película'?: string;
    'Origen'?: string;
    'Año'?: number;
    'Temp'?: number;
    'Capítulos'?: string | number;
    'Novela'?: boolean;
    'Actores'?: string;
    'Personaje'?: string;
    'Puntos'?: number;
    'Observaciones'?: string;
    '10'?: boolean;
};

async function main() {
    console.log('🌱 Iniciando la importación desde output.json...');

    const jsonPath = path.join(__dirname, '..', 'output.json');
    const jsonData: JsonEntry[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    let currentSerieId: string | null = null;

    for (const entry of jsonData) {
        try {
            // Si la entrada tiene el campo "Serie/película", es una nueva serie.
            if (entry['Serie/película']) {
                console.log(`\n🎬 Procesando serie: ${entry['Serie/película']}`);

                const serieData = {
                    titulo: entry['Serie/película'],
                    año: entry['Año'],
                    pais: entry['Origen'],
                    sinopsis: entry['Observaciones'],
                    rating: entry['Puntos'],
                    temporadas: typeof entry['Temp'] === 'number' ? entry['Temp'] : undefined,
                    // Aquí se podría añadir lógica para parsear 'Capítulos' si es un string
                };

                // First, try to find the serie by titulo
                let existingSerie = await prisma.serie.findUnique({
                    where: { titulo: serieData.titulo }
                });

                const newSerie = await prisma.serie.upsert({
                    where: { id: existingSerie ? existingSerie.id : '' }, // Use id if found, else empty string to force create
                    update: serieData,
                    create: serieData,
                });
                currentSerieId = newSerie.id;
                console.log(`   ✅ Serie creada/actualizada con ID: ${currentSerieId}`);

                // Si la serie tiene un actor en la misma línea
                if (entry['Actores'] && entry['Actores'] !== '-') {
                    await processActor(entry, currentSerieId);
                }

            } else if (currentSerieId && entry['Actores'] && entry['Actores'] !== '-') {
                // Si no es una nueva serie, es un actor de la serie anterior.
                await processActor(entry, currentSerieId);
            }
        } catch (error) {
            console.error(`❌ Error procesando la entrada: ${JSON.stringify(entry)}`, error);
        }
    }

    console.log('\n🌿 Importación completada!');
}

async function processActor(entry: JsonEntry, serieId: string) {
    const actorName = entry['Actores'];
    if (!actorName) return;

    console.log(`   👤 Procesando actor: ${actorName}`);

    const actor = await prisma.actor.upsert({
        where: { nombre: actorName },
        update: { nombre: actorName },
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
            personaje: entry['Personaje'],
        },
        create: {
            serieId: serieId,
            actorId: actor.id,
            personaje: entry['Personaje'],
            tipoRol: 'PRINCIPAL', // Asumimos PRINCIPAL, se puede ajustar
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
