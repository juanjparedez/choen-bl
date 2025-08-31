import { PrismaClient, EstadoSerie, TipoRolActor, TipoIdiomaSerie, MediaItem, MediaTipo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar base de datos
  console.log('🧹 Limpiando base de datos...');
  const tablas = [
    'SerieRating', 'Watchlist', 'MediaItem', 'Episodio', 'Temporada',
    'ActorSerie', 'GeneroSerie', 'IdiomaSerie', 'PlataformaSerie', 'SerieTag',
    'Serie', 'Actor', 'Genero', 'Plataforma', 'Idioma', 'Tag', 'User'
  ];

  for (const tabla of tablas) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${tabla}";`);
    console.log(`🗑️ Tabla ${tabla} limpiada`);
  }
  console.log('🧹 Base de datos completamente limpiada.');

  // Crear Géneros
  const generosData = [
    'Drama', 'Comedia', 'Acción', 'Thriller', 'Ciencia Ficción', 'Fantasía',
    'Crimen', 'Misterio', 'Romance', 'Animación', 'Documental', 'Musical',
    'Escolar', 'LGBT', 'Supernatural', 'Boys Love', 'Yaoi', 'Hentai',
  ];

  const generos = await prisma.genero.createMany({
    data: generosData.map(nombre => ({ nombre }))
  });
  console.log(`🎬 ${generos.count} géneros creados.`);

  // Crear Plataformas
  const plataformas = await prisma.plataforma.createMany({
    data: [
      { nombre: 'Netflix', logo: 'netflix_logo.png' },
      { nombre: 'HBO Max', logo: 'hbo_logo.png' },
      { nombre: 'Disney+', logo: 'disney_logo.png' },
      { nombre: 'Prime Video', logo: 'prime_logo.png' },
      { nombre: 'Apple TV+', logo: 'apple_logo.png' },
      { nombre: 'Star+', logo: 'star_logo.png' },
      { nombre: 'Viki', logo: 'viki_logo.png' },
      { nombre: 'YouTube', logo: 'youtube_logo.png' },
      { nombre: 'GagaOOLala', logo: 'gagaoolala_logo.png' },
      { nombre: 'iQIYI', logo: 'iqiyi_logo.png' },
      { nombre: 'WeTV', logo: 'wetv_logo.png' },
    ],
  });
  console.log(`💻 ${plataformas.count} plataformas creadas.`);

  // Crear Idiomas
  const idiomas = await prisma.idioma.createMany({
    data: [
      { nombre: 'Español', codigo: 'es' }, { nombre: 'Inglés', codigo: 'en' },
      { nombre: 'Francés', codigo: 'fr' }, { nombre: 'Japonés', codigo: 'ja' },
      { nombre: 'Portugués', codigo: 'pt' }, { nombre: 'Chino', codigo: 'zh' },
      { nombre: 'Tailandés', codigo: 'th' }, { nombre: 'Coreano', codigo: 'ko' },
      { nombre: 'Taiwanés', codigo: 'tw' }, { nombre: 'Vietnamita', codigo: 'vi' },
    ],
  });
  console.log(`🗣️ ${idiomas.count} idiomas creados.`);

  // Crear Actores (populares en BL)
  const actoresData = [
    {
      nombre: 'Earth Pirapat Watthanasetsiri',
      nacionalidad: 'Tailandia',
      foto: 'earth_pirapat.jpg',
      fechaNac: new Date('1994-02-23'),
      biografia: 'Actor y cantante tailandés conocido por sus papeles en "Water Boyy", "My Dear Loser", "A Tale of Thousand Stars" y "Moonlight Chicken".'
    },
  ];

  const actores = await prisma.actor.createMany({
    data: actoresData
  });
  console.log(`🌟 ${actores.count} actores creados.`);

  // Crear Tags personalizables
  const tagsData = [
    { nombre: "Universitarios", descripcion: "Ambientado en la universidad" },
    { nombre: "Falso noviazgo", descripcion: "Relación falsa que se vuelve real" },
    { nombre: "Popular/nerd", descripcion: "Personaje popular que se enamora de un personaje nerd" },
    { nombre: "Enemy to lovers", descripcion: "De enemigos a amantes" },
    { nombre: "Músicos", descripcion: "Personajes que tienen una banda" },
    { nombre: "Diferencia de edad", descripcion: "Relación con gran diferencia de edad" },
    { nombre: "Diferencia de altura", descripcion: "Relación con gran diferencia de altura" },
    { nombre: "Rico/Pobre", descripcion: "Relación entre un personaje rico y uno pobre" },
    { nombre: "Bad boy/Good boy", descripcion: "Relación entre un personaje bueno y uno malo" },
    { nombre: "Histriónico/Reservado", descripcion: "Relación entre un personaje histriónico y otro reservado" },
    { nombre: "Escolar", descripcion: "Ambientado en la secundaria" },
    { nombre: "Policial/Detectives", descripcion: "Personajes policías o detectives" },
    { nombre: "Doctor/Dentista/Veterinario", descripcion: "Personajes doctores, dentistas o veterinarios" },
    { nombre: "Artista", descripcion: "Personajes artistas" },
    { nombre: "Idols", descripcion: "Personajes idols" },
    { nombre: "Vidas pasadas/Almas gemelas", descripcion: "Vidas pasadas/Almas gemeleas" },
    { nombre: "Viajes en el tiempo", descripcion: "Los personajes viajan al pasado o al futuro" },
    { nombre: "De época", descripcion: "Ambientado en una época antigua" },
    { nombre: "Fantasmas", descripcion: "Relación de algún personajes con un fantasma" },
    { nombre: "Make up", descripcion: "Algún personaje es maquillador o le gusta maquillarse" },
    { nombre: "Robots", descripcion: "Algún personaje es un robot" },
    { nombre: "Pelea", descripcion: "Los personajes practican algun arte marcial" },
    { nombre: "gangsters", descripcion: "Los personajes son gansters" },
    { nombre: "Chefs", descripcion: "Algún personajes es chef" },
    { nombre: "Fetiches", descripcion: "Algún personaje tiene un tipo de fetiche" },
    { nombre: "Friends to lovers", descripcion: "De amigos a novios" },
    { nombre: "Vampiros", descripcion: "Algún personaje es vampiro" },
    { nombre: "Jefe/Empleado", descripcion: "Relación entre un jefe y un empleado" },
    { nombre: "Atletas", descripcion: "Algún personaje es atleta" },
    { nombre: "Escritores", descripcion: "Algún personaje es escritor" },
    { nombre: "Omegaverse", descripcion: "Los personajes cumplen con roles del mundo omegaverse" },
    { nombre: "Bromance", descripcion: "Los personajes tienen un bromance" },
    { nombre: "Motos/Autos", descripcion: "Las motos y/o autos cumplen un papel importante" },
    { nombre: "+18", descripcion: "Contiene escenas +18" }, // Si rompe ver acá
    { nombre: "Pastelería/Cafetería", descripcion: "Algún personaje es dueño o empleado de una pastelería o cafetería" },
    { nombre: "Mafia", descripcion: "Algún personaje es parte o es perseguido por la mafia" },
    { nombre: "Abogados", descripcion: "Algún personaje es abogado" },
    { nombre: "Ladrones", descripcion: "Algún personaje es ladrón" },
    { nombre: "BDSM", descripcion: "Algún personaje practica el BDSM" },
    { nombre: "Asesinos", descripcion: "Algún personaje es asesino" },
    { nombre: "Paternidad", descripcion: "Los personajes son o serán padres" },
    { nombre: "Oficina", descripcion: "Ambientado en una oficina" },
    { nombre: "Profesor/Alumno", descripcion: "Relación de un profesor con un alumno" },
    { nombre: "Boda", descripcion: "Los personajes se casarán" },
  ];

  const tags = await prisma.tag.createMany({
    data: tagsData
  });
  console.log(`🏷️ ${tags.count} tags creados.`);

  // Obtener todos los datos necesarios para relaciones
  const allGeneros = await prisma.genero.findMany();
  const allIdiomas = await prisma.idioma.findMany();
  const allPlataformas = await prisma.plataforma.findMany();
  const allActores = await prisma.actor.findMany();
  const allTags = await prisma.tag.findMany();

  // Datos completos de series BL con temporadas, episodios y galería
  const blSeriesData = [
    {
      title: "2gether: The Series",
      year: 2020,
      imageUrl: "2gether_poster.jpg",
      sinopsis: "Tine es un estudiante universitario popular que es acosado por un acosador. Para resolver este problema, decide pedirle a Sarawat, un chico frío pero muy popular, que finja ser su novio. Lo que comienza como una relación falsa se convierte en algo más profundo.",
      temporadas: 1,
      episodios: 13,
      duracionPromedio: 45,
      estado: EstadoSerie.FINALIZADA,
      pais: "Tailandia",
      rating: 8.2,
      trailerUrl: "https://youtu.be/45Xa0IKHk0E",
      generos: ["Boys Love", "Romance", "Comedia", "Escolar"],
      plataformas: [
        { nombre: "YouTube", url: "https://www.youtube.com/playlist?list=PLUaqc9PYGzbH6XGAiEBh3lA8jHk9Y9FwI" },
        { nombre: "Viki", url: "https://www.viki.com/tv/36850c-2gether-the-series" }
      ],
      idiomas: [
        { codigo: "th", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Bright Vachirawit", personaje: "Sarawat Guntithanon", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Win Metawin", personaje: "Tine Teepakorn", tipoRol: TipoRolActor.PRINCIPAL }
      ],
      temporadasInfo: [
        {
          numeroTemporada: 1,
          titulo: "Temporada 1",
          sinopsis: "La temporada inicial donde Tine y Sarawat comienzan su relación fingida",
          episodios: [
            { numeroEpisodio: 1, titulo: "El comienzo", duracion: 45, fechaEmision: new Date('2020-02-21') },
            { numeroEpisodio: 2, titulo: "Continuación", duracion: 45, fechaEmision: new Date('2020-02-28') }
          ]
        }
      ],
      galeria: [
        { url: "2gether_screenshot1.jpg", tipo: MediaTipo.SCREENSHOT, descripcion: "Escena principal" },
        { url: "2gether_screenshot2.jpg", tipo: MediaTipo.BTS, descripcion: "Detrás de cámaras" }
      ],
      tags: ["Universidad", "Falso noviazgo", "Popular"]
    },
    {
      title: "I Told Sunset About You",
      year: 2020,
      imageUrl: "itsay_poster.jpg",
      sinopsis: "Dos adolescentes de Phuket, Teh y Oh-aew, que fueron amigos en la infancia pero se separaron debido a un malentendido, se reencuentran en una clase de preparación para la universidad. Mientras se preparan para ingresar a la misma facultad de comunicación, reviven viejos sentimientos y descubren nuevos aspectos de su identidad sexual.",
      temporadas: 1,
      episodios: 5,
      duracionPromedio: 50,
      estado: EstadoSerie.FINALIZADA,
      pais: "Tailandia",
      rating: 9.3,
      trailerUrl: "https://youtu.be/QXU1O2k5Ipo",
      generos: ["Boys Love", "Romance", "Drama", "Coming of Age"],
      plataformas: [
        { nombre: "Netflix", url: "https://www.netflix.com/title/81437994" },
        { nombre: "LINE TV", url: "https://www.linetv.tw/drama/10880" }
      ],
      idiomas: [
        { codigo: "th", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Billkin Putthipong", personaje: "Teh", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "PP Krit", personaje: "Oh-aew", tipoRol: TipoRolActor.PRINCIPAL }
      ],
      temporadasInfo: [
        {
          numeroTemporada: 1,
          titulo: "Temporada 1",
          sinopsis: "El reencuentro de dos amigos de la infancia",
          episodios: [
            { numeroEpisodio: 1, titulo: "Reencuentro", duracion: 50, fechaEmision: new Date('2020-10-22') },
            { numeroEpisodio: 2, titulo: "Confusión", duracion: 50, fechaEmision: new Date('2020-10-29') }
          ]
        }
      ],
      galeria: [
        { url: "itsay_screenshot1.jpg", tipo: MediaTipo.SCREENSHOT, descripcion: "Playa de Phuket" },
        { url: "itsay_bts1.jpg", tipo: MediaTipo.BTS, descripcion: "Filmando en locación" }
      ],
      tags: ["Coming of Age", "Amigos a Amantes", "Drama"]
    },
    {
      title: "Bad Buddy",
      year: 2021,
      imageUrl: "bad_buddy_poster.jpg",
      sinopsis: "Pran y Pat son vecinos cuyas familias han sido rivales durante años. Obligados a ser enemigos desde niños, su relación da un giro inesperado cuando terminan en la misma universidad. A medida que pasan más tiempo juntos, descubren que sus sentimientos podrían ser más profundos que el odio que se supone deben sentir.",
      temporadas: 1,
      episodios: 12,
      duracionPromedio: 45,
      estado: EstadoSerie.FINALIZADA,
      pais: "Tailandia",
      rating: 9.4,
      trailerUrl: "https://youtu.be/BcRZLbhYQYk",
      generos: ["Boys Love", "Enemigos a Amantes", "Comedia", "Romance", "Escolar"],
      plataformas: [
        { nombre: "YouTube", url: "https://www.youtube.com/playlist?list=PLUaqc9PYGzbGcL6R8WXJvW8X0Z1Y7z1x5" }
      ],
      idiomas: [
        { codigo: "th", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Ohm Pawat", personaje: "Pat", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Nanon Korapat", personaje: "Pran", tipoRol: TipoRolActor.PRINCIPAL }
      ],
      temporadasInfo: [
        {
          numeroTemporada: 1,
          titulo: "Temporada 1",
          sinopsis: "La rivalidad que se convierte en amor",
          episodios: [
            { numeroEpisodio: 1, titulo: "Enemigos", duracion: 45, fechaEmision: new Date('2021-10-29') },
            { numeroEpisodio: 2, titulo: "Confesión", duracion: 45, fechaEmision: new Date('2021-11-05') }
          ]
        }
      ],
      galeria: [
        { url: "badbuddy_screenshot1.jpg", tipo: MediaTipo.SCREENSHOT, descripcion: "Escena de confrontación" },
        { url: "badbuddy_promo1.jpg", tipo: MediaTipo.PROMO, descripcion: "Póster promocional" }
      ],
      tags: ["Enemigos a Amantes", "Universidad", "Comedia Romántica"]
    },
    {
      title: "Love in the air",
      year: 2021,
      imageUrl: "bad_buddy_poster.jpg",
      sinopsis: "Pran y Pat son vecinos cuyas familias han sido rivales durante años. Obligados a ser enemigos desde niños, su relación da un giro inesperado cuando terminan en la misma universidad. A medida que pasan más tiempo juntos, descubren que sus sentimientos podrían ser más profundos que el odio que se supone deben sentir.",
      temporadas: 1,
      episodios: 12,
      duracionPromedio: 45,
      estado: EstadoSerie.FINALIZADA,
      pais: "Tailandia",
      rating: 9.4,
      trailerUrl: "https://youtu.be/BcRZLbhYQYk",
      generos: ["Yaoi", "Enemigos a Amantes", "Comedia", "Romance", "Escolar"],
      plataformas: [
        { nombre: "YouTube", url: "https://www.youtube.com/playlist?list=PLUaqc9PYGzbGcL6R8WXJvW8X0Z1Y7z1x5" }
      ],
      idiomas: [
        { codigo: "th", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Ohm Pawat", personaje: "Pat", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Nanon Korapat", personaje: "Pran", tipoRol: TipoRolActor.PRINCIPAL }
      ],
      temporadasInfo: [
        {
          numeroTemporada: 1,
          titulo: "Temporada 1",
          sinopsis: "La rivalidad que se convierte en amor",
          episodios: [
            { numeroEpisodio: 1, titulo: "Enemigos", duracion: 45, fechaEmision: new Date('2021-10-29') },
            { numeroEpisodio: 2, titulo: "Confesión", duracion: 45, fechaEmision: new Date('2021-11-05') }
          ]
        }
      ],
      galeria: [
        { url: "badbuddy_screenshot1.jpg", tipo: MediaTipo.SCREENSHOT, descripcion: "Escena de confrontación" },
        { url: "badbuddy_promo1.jpg", tipo: MediaTipo.PROMO, descripcion: "Póster promocional" }
      ],
      tags: ["Enemy to lovers", "Universitarios", "Motos/Autos", "Diferencia de altura", "Diferencia de edad", "+18",]
    }
  ];

  // Crear Series con transacciones para integridad
  console.log('📺 Creando series BL...');
  for (const serieData of blSeriesData) {
    await prisma.$transaction(async (tx) => {
      // Crear serie principal
      const serie = await tx.serie.create({
        data: {
          titulo: serieData.title,
          sinopsis: serieData.sinopsis,
          año: serieData.year,
          temporadas: serieData.temporadas,
          duracionPromedio: serieData.duracionPromedio,
          poster: serieData.imageUrl,
          estado: serieData.estado,
          pais: serieData.pais,
          rating: serieData.rating,
          trailerUrl: serieData.trailerUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      // Crear relaciones
      // Géneros
      const generoIds = serieData.generos
        .map(nombre => allGeneros.find(g => g.nombre === nombre)?.id)
        .filter(id => id !== undefined) as string[];

      await tx.generoSerie.createMany({
        data: generoIds.map(generoId => ({
          serieId: serie.id,
          generoId
        }))
      });

      // Idiomas
      const idiomaData = serieData.idiomas.map(item => {
        const idioma = allIdiomas.find(i => i.codigo === item.codigo);
        return idioma ? { idiomaId: idioma.id, tipo: item.tipo } : null;
      }).filter(Boolean) as { idiomaId: string, tipo: TipoIdiomaSerie }[];

      await tx.idiomaSerie.createMany({
        data: idiomaData.map(item => ({
          serieId: serie.id,
          idiomaId: item.idiomaId,
          tipo: item.tipo
        }))
      });

      // Plataformas
      const plataformaData = serieData.plataformas.map(item => {
        const plataforma = allPlataformas.find(p => p.nombre === item.nombre);
        return plataforma ? {
          plataformaId: plataforma.id,
          urlSerieEnPlataforma: item.url || null
        } : null;
      }).filter(Boolean) as { plataformaId: string, urlSerieEnPlataforma: string | null }[];

      await tx.plataformaSerie.createMany({
        data: plataformaData.map(item => ({
          serieId: serie.id,
          plataformaId: item.plataformaId,
          urlSerieEnPlataforma: item.urlSerieEnPlataforma
        }))
      });

      // Actores
      const actorData = serieData.actores.map(item => {
        const actor = allActores.find(a => a.nombre === item.nombre);
        return actor ? {
          actorId: actor.id,
          personaje: item.personaje,
          tipoRol: item.tipoRol
        } : null;
      }).filter(Boolean) as {
        actorId: string,
        personaje: string,
        tipoRol: TipoRolActor
      }[];

      await tx.actorSerie.createMany({
        data: actorData.map(actor => ({
          serieId: serie.id,
          actorId: actor.actorId,
          personaje: actor.personaje,
          tipoRol: actor.tipoRol
        }))
      });

      // Tags
      const tagIds = serieData.tags
        .map(nombre => allTags.find(t => t.nombre === nombre)?.id)
        .filter(id => id !== undefined) as string[];

      await tx.serieTag.createMany({
        data: tagIds.map(tagId => ({
          serieId: serie.id,
          tagId
        }))
      });

      // Crear temporadas y episodios
      for (const temporadaData of serieData.temporadasInfo) {
        const temporada = await tx.temporada.create({
          data: {
            serieId: serie.id,
            numeroTemporada: temporadaData.numeroTemporada,
            titulo: temporadaData.titulo,
            sinopsis: temporadaData.sinopsis,
            fechaEstreno: temporadaData.episodios[0]?.fechaEmision,
            fechaFin: temporadaData.episodios[temporadaData.episodios.length - 1]?.fechaEmision
          }
        });

        await tx.episodio.createMany({
          data: temporadaData.episodios.map(episodio => ({
            temporadaId: temporada.id,
            numeroEpisodio: episodio.numeroEpisodio,
            titulo: episodio.titulo,
            sinopsis: episodio.titulo, // Usar título como sinopsis temporal
            duracion: episodio.duracion,
            fechaEmision: episodio.fechaEmision
          }))
        });
      }

      // Crear galería de medios
      await tx.mediaItem.createMany({
        data: serieData.galeria.map((media, index) => ({
          serieId: serie.id,
          url: media.url,
          tipo: media.tipo,
          descripcion: media.descripcion,
          orden: index
        }))
      });

      console.log(`➕ Serie creada: ${serieData.title} (${serie.id})`);
    });
  }

  console.log(`✅ ${blSeriesData.length} series BL creadas con éxito!`);
  console.log('🌿 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });