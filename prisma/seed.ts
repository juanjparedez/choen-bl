import { PrismaClient, EstadoSerie, TipoRolActor, TipoIdiomaSerie } from '@prisma/client';
import { getPosterPath } from '@/lib/getPosterPath';   // ⇠ ajusta el alias


const prisma = new PrismaClient();

// Datos de las series BL (extraídos de tu HomePage)
const blSeriesData = [
  { title: "4 Minutes", year: "2024", imageUrl: "https://placehold.co/600x400/C7D2FE/4338CA?text=4+Minutes" },
  { title: "Top Team", year: "2023", imageUrl: "https://placehold.co/600x400/DDD6FE/4338CA?text=Top+Team" },
  { title: "The Eclipse", year: "2022", imageUrl: "https://placehold.co/600x400/E0E7FF/4338CA?text=The+Eclipse" },
  { title: "My School President", year: "2022", imageUrl: "https://placehold.co/600x400/C7D2FE/4338CA?text=My+School+President" },
  { title: "Semantic Error", year: "2022", imageUrl: "https://placehold.co/600x400/DDD6FE/4338CA?text=Semantic+Error" },
  { title: "Cherry Blossoms After Winter", year: "2022", imageUrl: "Cherry_Blossoms_After_Winter.png" }, // Nombre corregido para la imagen
];

for (const serieData of blSeriesData) {
  const poster = await getPosterPath(serieData.title);

  await prisma.serie.create({
    data: {
      titulo: serieData.title,
      poster,
      sinopsis: `Una emocionante serie titulada "${serieData.title}". Descubre más sobre esta historia.`,
      año: parseInt(serieData.year),
      temporadas: 1, // Valor predeterminado
      estado: parseInt(serieData.year) < new Date().getFullYear() ? EstadoSerie.FINALIZADA : EstadoSerie.EN_EMISION,
      pais: (serieData.title === "Semantic Error" || serieData.title === "Cherry Blossoms After Winter") ? "Corea del Sur" : "Tailandia", // Asignación de ejemplo
      rating: parseFloat((Math.random() * (9.5 - 7.0) + 7.0).toFixed(1)), // Rating aleatorio entre 7.0 y 9.5
      trailerUrl: null, // Puedes añadir URLs si las tienes
    }
  });
}

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar base de datos (orden específico para evitar errores de FK)
  console.log('🧹 Limpiando relaciones...');
  await prisma.actorSerie.deleteMany({});
  await prisma.generoSerie.deleteMany({});
  await prisma.plataformaSerie.deleteMany({});
  await prisma.idiomaSerie.deleteMany({});

  console.log('🧹 Limpiando entidades principales...');
  await prisma.serie.deleteMany({});
  await prisma.actor.deleteMany({});
  await prisma.genero.deleteMany({});
  await prisma.plataforma.deleteMany({});
  await prisma.idioma.deleteMany({});
  console.log('🧹 Base de datos limpiada.');

  // Crear Géneros
  const generosData = [
    { nombre: 'Drama' }, { nombre: 'Comedia' }, { nombre: 'Acción' },
    { nombre: 'Thriller' }, { nombre: 'Ciencia Ficción' }, { nombre: 'Fantasía' },
    { nombre: 'Crimen' }, { nombre: 'Misterio' }, { nombre: 'Romance' },
    { nombre: 'Animación' }, { nombre: 'Documental' },
    { nombre: 'Boys Love' }, // Género añadido
  ];
  const generos = await Promise.all(
    generosData.map(g => prisma.genero.create({ data: g }))
  );
  console.log(`🎬 ${generos.length} géneros creados.`);
  const generoBoysLove = generos.find(g => g.nombre === 'Boys Love');
  if (!generoBoysLove) {
    console.error("❌ No se pudo encontrar o crear el género 'Boys Love'.");
    process.exit(1);
  }

  // Crear Plataformas (datos de ejemplo, puedes ajustarlos)
  const plataformasData = [
    { nombre: 'Netflix' }, { nombre: 'HBO Max' }, { nombre: 'Disney+' },
    { nombre: 'Prime Video' }, { nombre: 'Apple TV+' }, { nombre: 'Star+' },
    { nombre: 'Viki' }, { nombre: 'YouTube' }, { nombre: 'GagaOOLala' } // Plataformas comunes para BL
  ];
  const plataformas = await Promise.all(
    plataformasData.map(p => prisma.plataforma.create({ data: p }))
  );
  console.log(`💻 ${plataformas.length} plataformas creadas.`);
  const plataformaViki = plataformas.find(p => p.nombre === 'Viki'); // Plataforma de ejemplo para BL

  // Crear Idiomas (datos de ejemplo)
  const idiomasData = [
    { nombre: 'Español', codigo: 'es' }, { nombre: 'Inglés', codigo: 'en' },
    { nombre: 'Francés', codigo: 'fr' }, { nombre: 'Japonés', codigo: 'ja' },
    { nombre: 'Portugués', codigo: 'pt' },
    { nombre: 'Tailandés', codigo: 'th' }, { nombre: 'Coreano', codigo: 'ko' } // Idiomas comunes para BL
  ];
  const idiomas = await Promise.all(
    idiomasData.map(i => prisma.idioma.create({ data: i }))
  );
  console.log(`🗣️ ${idiomas.length} idiomas creados.`);
  const idiomaTailandes = idiomas.find(i => i.codigo === 'th');
  const idiomaCoreano = idiomas.find(i => i.codigo === 'ko');
  const idiomaEspanol = idiomas.find(i => i.codigo === 'es');

  // Crear Actores (datos de ejemplo, puedes añadir actores de BL aquí)
  const actoresData = [
    // Puedes añadir actores específicos de las series BL si los tienes
    { nombre: 'Earth Pirapat Watthanasetsiri', nacionalidad: 'Tailandia', foto: 'https://placehold.co/200x300/A78BFA/FFFFFF?text=Earth+P.', fechaNac: new Date('1994-02-23'), biografia: 'Actor tailandés conocido por sus papeles en series BL.' },
    { nombre: 'Mix Sahaphap Wongratch', nacionalidad: 'Tailandia', foto: 'https://placehold.co/200x300/818CF8/FFFFFF?text=Mix+S.', fechaNac: new Date('1998-07-22'), biografia: 'Actor tailandés, popular en el género BL.' },
    { nombre: 'Park Seo Ham', nacionalidad: 'Corea del Sur', foto: 'https://placehold.co/200x300/F472B6/FFFFFF?text=Park+Seo+Ham', fechaNac: new Date('1993-10-28'), biografia: 'Actor y cantante surcoreano.' },
    { nombre: 'Park Jae Chan', nacionalidad: 'Corea del Sur', foto: 'https://placehold.co/200x300/3B82F6/FFFFFF?text=Park+Jae+Chan', fechaNac: new Date('2001-12-06'), biografia: 'Actor y cantante surcoreano, miembro de DKZ.' },
  ];
  const actores = await Promise.all(
    actoresData.map(a => prisma.actor.create({ data: a }))
  );
  console.log(`🌟 ${actores.length} actores creados.`);

  // Crear Series BL del HomePage
  console.log('📺 Creando series de Mundo BL...');
  for (const serieData of blSeriesData) {
    const anioActual = new Date().getFullYear();
    const estadoSerie = parseInt(serieData.year) < anioActual ? EstadoSerie.FINALIZADA : EstadoSerie.EN_EMISION;

    await prisma.serie.create({
      data: {
        titulo: serieData.title,
        sinopsis: `Una emocionante serie Boys Love titulada "${serieData.title}". Descubre más sobre esta historia.`, // Sinopsis genérica
        año: parseInt(serieData.year),
        temporadas: 1, // Valor predeterminado
        poster: serieData.imageUrl,
        // El campo 'estado' en tu schema.prisma es String?, no EstadoSerie.
        // Si lo cambias a Enum, usa: estado: estadoSerie
        estado: estadoSerie.toString(), // Usamos el valor string del enum
        pais: (serieData.title === "Semantic Error" || serieData.title === "Cherry Blossoms After Winter") ? "Corea del Sur" : "Tailandia", // Asignación de ejemplo
        rating: parseFloat((Math.random() * (9.5 - 7.0) + 7.0).toFixed(1)), // Rating aleatorio entre 7.0 y 9.5
        trailerUrl: null, // Puedes añadir URLs si las tienes
        generos: {
          create: [{ generoId: generoBoysLove.id }]
        },
        // Opcional: Conectar plataformas e idiomas si tienes datos
        plataformas: plataformaViki && (serieData.title === "Semantic Error" || serieData.title === "The Eclipse") ? { // Ejemplo de conexión
          create: [{ plataformaId: plataformaViki.id, urlSerieEnPlataforma: `https://viki.com/${serieData.title.toLowerCase().replace(/\s+/g, '-')}` }]
        } : undefined,
        idiomas: idiomaEspanol && (idiomaTailandes || idiomaCoreano) ? { // Ejemplo de conexión
          create: [
            { idiomaId: (serieData.title === "Semantic Error" || serieData.title === "Cherry Blossoms After Winter") ? idiomaCoreano!.id : idiomaTailandes!.id, tipo: TipoIdiomaSerie.AUDIO },
            { idiomaId: idiomaEspanol.id, tipo: TipoIdiomaSerie.SUBTITULOS }
          ]
        } : undefined,
        // Opcional: Conectar actores si tienes datos
        // actores: { create: [ { actorId: actorEjemplo.id, personaje: 'Personaje Principal', tipoRol: TipoRolActor.PRINCIPAL } ] }
      }
    });
    console.log(`➕ Serie creada: ${serieData.title}`);
  }
  console.log(`✅ ${blSeriesData.length} series de Mundo BL creadas.`);
  console.log('✅ Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
