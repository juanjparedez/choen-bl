import { PrismaClient, EstadoSerie, TipoRolActor, TipoIdiomaSerie } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar base de datos
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
    { nombre: 'Animación' }, { nombre: 'Documental' }, { nombre: 'Musical' },
    { nombre: 'Escolar' }, { nombre: 'Slice of Life' }, { nombre: 'Supernatural' },
    { nombre: 'Boys Love' }, { nombre: 'Yaoi' }, { nombre: 'Shounen-ai' },
  ];

  const generos = await Promise.all(
    generosData.map(g => prisma.genero.create({ data: g }))
  );
  console.log(`🎬 ${generos.length} géneros creados.`);

  // Crear Plataformas
  const plataformasData = [
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
  ];

  const plataformas = await Promise.all(
    plataformasData.map(p => prisma.plataforma.create({ data: p }))
  );
  console.log(`💻 ${plataformas.length} plataformas creadas.`);

  // Crear Idiomas
  const idiomasData = [
    { nombre: 'Español', codigo: 'es' }, { nombre: 'Inglés', codigo: 'en' },
    { nombre: 'Francés', codigo: 'fr' }, { nombre: 'Japonés', codigo: 'ja' },
    { nombre: 'Portugués', codigo: 'pt' }, { nombre: 'Chino', codigo: 'zh' },
    { nombre: 'Tailandés', codigo: 'th' }, { nombre: 'Coreano', codigo: 'ko' },
    { nombre: 'Taiwanés', codigo: 'tw' }, { nombre: 'Vietnamita', codigo: 'vi' },
  ];

  const idiomas = await Promise.all(
    idiomasData.map(i => prisma.idioma.create({ data: i }))
  );
  console.log(`🗣️ ${idiomas.length} idiomas creados.`);

  // Crear Actores (populares en BL)
  const actoresData = [
    // Actores tailandeses
    {
      nombre: 'Earth Pirapat Watthanasetsiri',
      nacionalidad: 'Tailandia',
      foto: 'earth_pirapat.jpg',
      fechaNac: new Date('1994-02-23'),
      biografia: 'Actor y cantante tailandés conocido por sus papeles en "Water Boyy", "My Dear Loser", "A Tale of Thousand Stars" y "Moonlight Chicken".'
    },
    {
      nombre: 'Mix Sahaphap Wongratch',
      nacionalidad: 'Tailandia',
      foto: 'mix_sahaphap.jpg',
      fechaNac: new Date('1998-07-22'),
      biografia: 'Actor tailandés que saltó a la fama con "A Tale of Thousand Stars". También ha participado en "Fish upon the Sky" y "Moonlight Chicken".'
    },
    {
      nombre: 'Bright Vachirawit',
      nacionalidad: 'Tailandia',
      foto: 'bright_vachirawit.jpg',
      fechaNac: new Date('1997-12-27'),
      biografia: 'Actor, modelo y cantante tailandés. Protagonista de "2gether: The Series", "F4 Thailand: Boys Over Flowers" y "Astrophile".'
    },
    {
      nombre: 'Win Metawin',
      nacionalidad: 'Tailandia',
      foto: 'win_metawin.jpg',
      fechaNac: new Date('1999-02-21'),
      biografia: 'Actor y modelo tailandés conocido por su papel en "2gether: The Series". También ha participado en "Devil Sister" y "F4 Thailand: Boys Over Flowers".'
    },

    // Actores coreanos
    {
      nombre: 'Park Seo Ham',
      nacionalidad: 'Corea del Sur',
      foto: 'park_seoham.jpg',
      fechaNac: new Date('1993-10-28'),
      biografia: 'Actor, modelo y cantante surcoreano. Ex miembro del grupo KNK. Protagonista de "Semantic Error".'
    },
    {
      nombre: 'Park Jae Chan',
      nacionalidad: 'Corea del Sur',
      foto: 'park_jaechan.jpg',
      fechaNac: new Date('2001-12-06'),
      biografia: 'Actor, cantante y compositor surcoreano. Miembro del grupo DKZ. Protagonista de "Semantic Error".'
    },
    {
      nombre: 'Kang Min Hyuk',
      nacionalidad: 'Corea del Sur',
      foto: 'kang_minhyuk.jpg',
      fechaNac: new Date('1998-12-17'),
      biografia: 'Actor y cantante surcoreano. Conocido por "Where Your Eyes Linger" y "Ocean Like Me".'
    },

    // Actores japoneses
    {
      nombre: 'Riku Hagiwara',
      nacionalidad: 'Japón',
      foto: 'riku_hagiwara.jpg',
      fechaNac: new Date('2001-08-12'),
      biografia: 'Actor japonés conocido por sus papeles en "My Beautiful Man", "Takara-kun to Amagi-kun" y "Tokyo in April is...".'
    },
    {
      nombre: 'Yusei Yagi',
      nacionalidad: 'Japón',
      foto: 'yusei_yagi.jpg',
      fechaNac: new Date('2000-03-30'),
      biografia: 'Actor japonés que saltó a la fama con "My Beautiful Man". También ha participado en "Takara-kun to Amagi-kun".'
    },

    // Actores taiwaneses
    {
      nombre: 'Hsu Kai',
      nacionalidad: 'Taiwán',
      foto: 'hsu_kai.jpg',
      fechaNac: new Date('1995-10-24'),
      biografia: 'Actor y modelo taiwanés conocido por "We Best Love", "Plus & Minus" y "About Youth".'
    },
    {
      nombre: 'Sam Lin',
      nacionalidad: 'Taiwán',
      foto: 'sam_lin.jpg',
      fechaNac: new Date('1996-06-01'),
      biografia: 'Actor y músico taiwanés. Protagonista de "We Best Love" y "Plus & Minus".'
    },
  ];

  const actores = await Promise.all(
    actoresData.map(a => prisma.actor.create({ data: a }))
  );
  console.log(`🌟 ${actores.length} actores creados.`);

  // Datos completos de series BL
  const blSeriesData = [
    {
      title: "2gether: The Series",
      year: 2020,
      imageUrl: "2gether_poster.jpg",
      sinopsis: "Tine es un estudiante universitario popular que es acosado por un acosador. Para resolver este problema, decide pedirle a Sarawat, un chico frío pero muy popular, que finja ser su novio. Lo que comienza como una relación falsa se convierte en algo más profundo.",
      temporadas: 1,
      episodios: 13,
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
      ]
    },
    {
      title: "KinnPorsche",
      year: 2022,
      imageUrl: "kinnporsche_poster.jpg",
      sinopsis: "Porsche es un estudiante universitario que trabaja como mesero para mantener a su hermano menor. Un día salva a Kinn, el heredero de una poderosa familia mafiosa, de un intento de secuestro. Impresionado por sus habilidades de lucha, Kinn contrata a Porsche como su guardaespaldas personal, llevándolo a un peligroso mundo de crimen organizado y romance prohibido.",
      temporadas: 1,
      episodios: 14,
      estado: EstadoSerie.FINALIZADA,
      pais: "Tailandia",
      rating: 9.1,
      trailerUrl: "https://youtu.be/b7E8XJcGgno",
      generos: ["Boys Love", "Acción", "Drama", "Crimen", "Thriller"],
      plataformas: [
        { nombre: "iQIYI", url: "https://www.iq.com/play/kinnporsche-1q5u2vq3xu" }
      ],
      idiomas: [
        { codigo: "th", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Mile Phakphum", personaje: "Kinn Anakinn", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Apo Nattawin", personaje: "Porsche Pachara", tipoRol: TipoRolActor.PRINCIPAL }
      ]
    },
    {
      title: "Semantic Error",
      year: 2022,
      imageUrl: "semantic_error_poster.jpg",
      sinopsis: "Chu Sangwoo es un estudiante de diseño gráfico extremadamente rígido y metódico. Cuando un compañero de clase abandona un proyecto grupal, causando que Sangwoo casi repruebe, busca vengarse del responsable: el popular estudiante de informática Jang Jaeyoung. Lo que comienza como una rivalidad se convierte en una atracción inesperada.",
      temporadas: 1,
      episodios: 8,
      estado: EstadoSerie.FINALIZADA,
      pais: "Corea del Sur",
      rating: 8.7,
      trailerUrl: "https://youtu.be/HjPkwoPAEzw",
      generos: ["Boys Love", "Romance", "Comedia", "Escolar"],
      plataformas: [
        { nombre: "Viki", url: "https://www.viki.com/tv/37857c-semantic-error" },
        { nombre: "iQIYI", url: "https://www.iq.com/play/semantic-error-2022-1t6x4nq0r4b" }
      ],
      idiomas: [
        { codigo: "ko", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Park Seo Ham", personaje: "Jang Jaeyoung", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Park Jae Chan", personaje: "Chu Sangwoo", tipoRol: TipoRolActor.PRINCIPAL }
      ]
    },
    {
      title: "Cherry Blossoms After Winter",
      year: 2022,
      imageUrl: "cherry_blossoms_poster.jpg",
      sinopsis: "Haebom y Taesung perdieron a sus padres en un accidente y han vivido juntos bajo el mismo techo desde la escuela primaria. Aunque inicialmente se llevaban mal, con el tiempo desarrollaron sentimientos el uno por el otro. La serie sigue su relación a medida que crecen y enfrentan los desafíos del amor y la vida.",
      temporadas: 1,
      episodios: 10,
      estado: EstadoSerie.FINALIZADA,
      pais: "Corea del Sur",
      rating: 8.0,
      trailerUrl: "https://youtu.be/2I5XQzqR6f4",
      generos: ["Boys Love", "Romance", "Drama", "Slice of Life"],
      plataformas: [
        { nombre: "Viki", url: "https://www.viki.com/tv/38352c-cherry-blossoms-after-winter" }
      ],
      idiomas: [
        { codigo: "ko", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Ok Jin Uk", personaje: "Haebom", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Kang Hui", personaje: "Taesung", tipoRol: TipoRolActor.PRINCIPAL }
      ]
    },
    {
      title: "My School President",
      year: 2022,
      imageUrl: "my_school_president_poster.jpg",
      sinopsis: "Tinn es el presidente del consejo estudiantil que está enamorado en secreto de Gun, el líder de un club de música. Para acercarse a él, Tinn se ofrece como manager del club, pero debe mantener su posición como presidente mientras apoya al grupo musical en su búsqueda de ganar una competencia nacional.",
      temporadas: 1,
      episodios: 12,
      estado: EstadoSerie.FINALIZADA,
      pais: "Tailandia",
      rating: 9.0,
      trailerUrl: "https://youtu.be/FQcBQnFmh9k",
      generos: ["Boys Love", "Romance", "Comedia", "Musical", "Escolar"],
      plataformas: [
        { nombre: "YouTube", url: "https://www.youtube.com/playlist?list=PLUaqc9PYGzbGvXdYtZqSJNsGc3YvD5iJ6" }
      ],
      idiomas: [
        { codigo: "th", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Gemini Norawit", personaje: "Tinn", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Fourth Nattawat", personaje: "Gun", tipoRol: TipoRolActor.PRINCIPAL }
      ]
    },
    {
      title: "My Beautiful Man",
      year: 2021,
      imageUrl: "my_beautiful_man_poster.jpg",
      sinopsis: "Hira, un estudiante solitario y tartamudo, desarrolla una obsesión por Kiyoi, el chico más popular de la escuela. Aunque Kiyoi inicialmente lo trata con desdén, una compleja relación comienza a desarrollarse entre ellos, explorando temas de amor, obsesión y autoaceptación.",
      temporadas: 2,
      episodios: 12,
      estado: EstadoSerie.FINALIZADA,
      pais: "Japón",
      rating: 8.5,
      trailerUrl: "https://youtu.be/0aRq9q7l0k4",
      generos: ["Boys Love", "Drama", "Romance", "Psicológico"],
      plataformas: [
        { nombre: "Viki", url: "https://www.viki.com/tv/37378c-my-beautiful-man" }
      ],
      idiomas: [
        { codigo: "ja", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Riku Hagiwara", personaje: "Hira Kazunari", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Yusei Yagi", personaje: "Kiyoi Sou", tipoRol: TipoRolActor.PRINCIPAL }
      ]
    },
    {
      title: "We Best Love: Fighting Mr. 2nd",
      year: 2021,
      imageUrl: "we_best_love_poster.jpg",
      sinopsis: "Cinco años después de su separación, Zhou Shuyi y Gao Shi De se reencuentran como ejecutivos rivales en la industria financiera. Mientras luchan con sus sentimientos no resueltos y la competencia profesional, deben enfrentar los secretos que los separaron y decidir si vale la pena luchar por su amor.",
      temporadas: 2,
      episodios: 10,
      estado: EstadoSerie.FINALIZADA,
      pais: "Taiwán",
      rating: 8.8,
      trailerUrl: "https://youtu.be/2I5XQzqR6f4",
      generos: ["Boys Love", "Romance", "Drama", "Negocios"],
      plataformas: [
        { nombre: "WeTV", url: "https://wetv.vip/play/1jlpqzwy3f0f6hx" },
        { nombre: "Viki", url: "https://www.viki.com/tv/36762c-we-best-love-fighting-mr-2nd" }
      ],
      idiomas: [
        { codigo: "tw", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Sam Lin", personaje: "Zhou Shuyi", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "Hsu Kai", personaje: "Gao Shi De", tipoRol: TipoRolActor.PRINCIPAL }
      ]
    },
    {
      title: "The Eclipse",
      year: 2022,
      imageUrl: "the_eclipse_poster.jpg",
      sinopsis: "En una escuela estricta gobernada por un misterioso consejo estudiantil, Ayan es un nuevo estudiante transferido que sospecha que la escuela está relacionada con la muerte de su tío. Al investigar, forma una alianza incómoda con Akk, el líder del consejo estudiantil, descubriendo secretos oscuros y una atracción inesperada.",
      temporadas: 1,
      episodios: 12,
      estado: EstadoSerie.FINALIZADA,
      pais: "Tailandia",
      rating: 8.6,
      trailerUrl: "https://youtu.be/3Qx5t9J7Z8o",
      generos: ["Boys Love", "Misterio", "Sobrenatural", "Drama", "Escolar"],
      plataformas: [
        { nombre: "YouTube", url: "https://www.youtube.com/playlist?list=PLUaqc9PYGzbFkQdFdHdG6hWZ2T7T8y2wJ" },
        { nombre: "GagaOOLala", url: "https://www.gagaoolala.com/en/videos/2791/the-eclipse-2022-s1e01" }
      ],
      idiomas: [
        { codigo: "th", tipo: TipoIdiomaSerie.AUDIO },
        { codigo: "es", tipo: TipoIdiomaSerie.SUBTITULOS }
      ],
      actores: [
        { nombre: "Khaotung Thanawat", personaje: "Ayan", tipoRol: TipoRolActor.PRINCIPAL },
        { nombre: "First Kanaphan", personaje: "Akk", tipoRol: TipoRolActor.PRINCIPAL }
      ]
    },
    {
      title: "I Told Sunset About You",
      year: 2020,
      imageUrl: "itsay_poster.jpg",
      sinopsis: "Dos adolescentes de Phuket, Teh y Oh-aew, que fueron amigos en la infancia pero se separaron debido a un malentendido, se reencuentran en una clase de preparación para la universidad. Mientras se preparan para ingresar a la misma facultad de comunicación, reviven viejos sentimientos y descubren nuevos aspectos de su identidad sexual.",
      temporadas: 1,
      episodios: 5,
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
      ]
    },
    {
      title: "Bad Buddy",
      year: 2021,
      imageUrl: "bad_buddy_poster.jpg",
      sinopsis: "Pran y Pat son vecinos cuyas familias han sido rivales durante años. Obligados a ser enemigos desde niños, su relación da un giro inesperado cuando terminan en la misma universidad. A medida que pasan más tiempo juntos, descubren que sus sentimientos podrían ser más profundos que el odio que se supone deben sentir.",
      temporadas: 1,
      episodios: 12,
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
      ]
    }
  ];

  // Función para obtener IDs de géneros por nombre
  const getGeneroIds = (nombres: string[]) => {
    return generos
      .filter(g => nombres.includes(g.nombre))
      .map(g => ({ generoId: g.id }));
  };

  // Función para obtener IDs de idiomas por código
  const getIdiomaIds = (items: { codigo: string, tipo: TipoIdiomaSerie }[]) => {
    return items.map(item => {
      const idioma = idiomas.find(i => i.codigo === item.codigo);
      return idioma ? {
        idiomaId: idioma.id,
        tipo: item.tipo
      } : null;
    }).filter(Boolean) as { idiomaId: string, tipo: TipoIdiomaSerie }[];
  };

  // Función para obtener IDs de plataformas con datos adicionales
  const getPlataformaData = (items: { nombre: string, url?: string }[]) => {
    return items.map(item => {
      const plataforma = plataformas.find(p => p.nombre === item.nombre);
      return plataforma ? {
        plataformaId: plataforma.id,
        urlSerieEnPlataforma: item.url || null
      } : null;
    }).filter(Boolean) as { plataformaId: string, urlSerieEnPlataforma: string | null }[];
  };

  // Función para obtener datos de actores con personajes
  const getActorData = (items: { nombre: string, personaje: string, tipoRol: TipoRolActor }[]) => {
    return items.map(item => {
      const actor = actores.find(a => a.nombre === item.nombre);
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
  };

  // Crear Series
  console.log('📺 Creando series BL...');
  for (const serieData of blSeriesData) {
    const serie = await prisma.serie.create({
      data: {
        titulo: serieData.title,
        sinopsis: serieData.sinopsis,
        año: serieData.year,
        temporadas: serieData.temporadas,
        poster: serieData.imageUrl,
        estado: serieData.estado,
        pais: serieData.pais,
        rating: serieData.rating,
        trailerUrl: serieData.trailerUrl,
        generos: {
          create: getGeneroIds(serieData.generos)
        },
        idiomas: {
          create: getIdiomaIds(serieData.idiomas)
        },
        plataformas: {
          create: getPlataformaData(serieData.plataformas)
        },
        actores: {
          create: getActorData(serieData.actores)
        }
      }
    });
    console.log(`➕ Serie creada: ${serieData.title} (${serie.id})`);
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