/*
 * Carga de datos de demo para PadeLink.
 *
 * Uso:  npm run seed
 *
 * ATENCIÓN: borra TODOS los datos de la base configurada (DB_NAME, por defecto bd_padelink)
 * y la vuelve a llenar con usuarios, clubes, clases, inscripciones y reseñas de ejemplo.
 * No corre si NODE_ENV=production.
 *
 * Cuentas de demo (todas con la contraseña DEMO_PASSWORD de abajo):
 *   - Admin:    admin@padelink.test
 *   - Profesor: laura.gomez@padelink.test   (y el resto: nombre.apellido@padelink.test)
 *   - Alumno:   juan.perez@padelink.test    (y el resto: nombre.apellido@padelink.test)
 */
import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Usuario, UserRole } from '../usuario/entities/usuario.entity';
import { Profesor, ManoDominante } from '../profesor/entities/profesor.entity';
import { Alumno, Genero, Posicion } from '../alumno/entities/alumno.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Club } from '../club/entities/club.entity';
import { Clase, EstadoEnum, TipoEnum } from '../clase/entities/clase.entity';
import { Resenia } from '../resenia/entities/resenia.entity';

const DEMO_PASSWORD = 'Padelink2026!';

// --- Variables de entorno (lee el .env si existe, igual que la app) ---
function cargarEnv() {
  const archivo = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(archivo)) return;
  for (const linea of fs.readFileSync(archivo, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

// --- Aleatorio con semilla: siempre genera los mismos datos ---
let semilla = 20261022;
function rand() {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296;
  return semilla / 4294967296;
}
const entre = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const elegir = <T>(lista: readonly T[]): T => lista[Math.floor(rand() * lista.length)];
const mezclar = <T>(lista: T[]): T[] => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const email = (nombre: string, apellido: string) =>
  `${sinAcentos(nombre)}.${sinAcentos(apellido).replace(/\s+/g, '')}@padelink.test`;
const telefono = () => `+54 9 341 ${entre(400, 699)}-${entre(1000, 9999)}`;

// --- Datos base ---
const CLUBES = [
  { nombre: 'Rosario Padel Center', ciudad: 'Rosario', ubicacion: 'Av. Pellegrini 2150', descripcion: '6 canchas techadas de cristal, vestuarios y bar.' },
  { nombre: 'La Red Padel Club', ciudad: 'Rosario', ubicacion: 'Bv. Oroño 3400', descripcion: 'Canchas panorámicas y escuela para todos los niveles.' },
  { nombre: 'Punta Padel', ciudad: 'Funes', ubicacion: 'Hipólito Yrigoyen 1820', descripcion: 'Club al aire libre con 4 canchas y estacionamiento.' },
  { nombre: 'Golden Padel', ciudad: 'Rosario', ubicacion: 'Av. Eva Perón 7300', descripcion: 'Complejo con iluminación LED y torneos semanales.' },
  { nombre: 'Padel Norte', ciudad: 'Granadero Baigorria', ubicacion: 'San Martín 1200', descripcion: '3 canchas techadas, ideal para clases grupales.' },
  { nombre: 'Victoria Padel', ciudad: 'Villa Gobernador Gálvez', ubicacion: 'Av. Filippini 450', descripcion: 'Club de barrio con muy buen ambiente.' },
  { nombre: 'Club Atlético Fisherton', ciudad: 'Rosario', ubicacion: 'Morrison 8900', descripcion: 'Club social con 2 canchas de pádel de césped sintético.' },
  { nombre: 'Padel Box Centro', ciudad: 'Rosario', ubicacion: 'Mitre 1450', descripcion: 'Canchas céntricas, abierto hasta medianoche.' },
  { nombre: 'A domicilio', ciudad: 'Rosario', ubicacion: 'A convenir con el profesor', descripcion: 'El profesor va a la cancha que elija el alumno.' },
];

const PROFESORES = [
  { nombre: 'Laura', apellido: 'Gómez', calidad: 4.7, bio: 'Profesora nacional con 10 años de experiencia. Especialista en técnica de volea y bandeja.' },
  { nombre: 'Martín', apellido: 'Fernández', calidad: 4.5, bio: 'Ex jugador de primera categoría. Clases dinámicas enfocadas en táctica y posicionamiento.' },
  { nombre: 'Sofía', apellido: 'Rodríguez', calidad: 4.8, bio: 'Me encanta enseñar desde cero. Paciencia y mucha práctica de golpes básicos.' },
  { nombre: 'Diego', apellido: 'Martínez', calidad: 3.9, bio: 'Entrenador de competición. Preparo jugadores para torneos amateurs.' },
  { nombre: 'Valentina', apellido: 'López', calidad: 4.3, bio: 'Clases para mujeres y grupos mixtos. Foco en salida de pared y globo.' },
  { nombre: 'Federico', apellido: 'Sánchez', calidad: 4.1, bio: 'Profesor de educación física y pádel. Combino técnica con preparación física.' },
  { nombre: 'Camila', apellido: 'Díaz', calidad: 4.6, bio: 'Jugadora federada. Clases personalizadas con análisis de video.' },
  { nombre: 'Nicolás', apellido: 'Romero', calidad: 3.6, bio: 'Clases relajadas para disfrutar del pádel y mejorar de a poco.' },
  { nombre: 'Lucía', apellido: 'Torres', calidad: 4.4, bio: 'Especialista en niños y adolescentes. También doy clases a adultos principiantes.' },
  { nombre: 'Matías', apellido: 'Álvarez', calidad: 4.0, bio: 'Me enfoco en el remate y el juego de ataque. Nivel intermedio y avanzado.' },
  { nombre: 'Agustina', apellido: 'Ruiz', calidad: 4.9, bio: 'Campeona provincial 2024. Clases de alto rendimiento y estrategia de partido.' },
  { nombre: 'Tomás', apellido: 'Benítez', calidad: 3.8, bio: 'Profesor joven y dinámico. Muchas clases libres para armar partidos.' },
];

const NOMBRES_M = ['Juan', 'Pedro', 'Lucas', 'Santiago', 'Mateo', 'Joaquín', 'Facundo', 'Gonzalo', 'Ignacio', 'Franco', 'Bruno', 'Emiliano', 'Julián', 'Ramiro', 'Agustín', 'Leandro', 'Pablo', 'Andrés', 'Germán', 'Hernán'];
const NOMBRES_F = ['Ana', 'María', 'Julieta', 'Florencia', 'Carolina', 'Micaela', 'Paula', 'Rocío', 'Milagros', 'Belén', 'Antonella', 'Victoria', 'Daniela', 'Natalia', 'Agostina', 'Josefina', 'Candela', 'Martina', 'Abril', 'Luciana'];
const APELLIDOS = ['Pérez', 'García', 'Castro', 'Morales', 'Herrera', 'Medina', 'Aguirre', 'Ríos', 'Molina', 'Rojas', 'Sosa', 'Acosta', 'Ortiz', 'Silva', 'Navarro', 'Ramos', 'Vega', 'Giménez', 'Ponce', 'Luna', 'Cabrera', 'Domínguez', 'Ferreyra', 'Godoy', 'Ibarra'];
const NIVELES = ['basico', 'intermedio', 'avanzado'] as const;

const DESCRIPCIONES: Record<string, string[]> = {
  basico: ['Primeros pasos: empuñadura, derecha y revés.', 'Clase para principiantes, sin experiencia previa.', 'Fundamentos y reglas básicas del juego.'],
  intermedio: ['Trabajo de volea y salida de pared.', 'Bandeja y posicionamiento en la red.', 'Táctica de pareja y comunicación.'],
  avanzado: ['Remate por 3 y por 4, víbora.', 'Estrategia de partido y lectura del rival.', 'Entrenamiento intensivo para torneos.'],
};

const COMENTARIOS: Record<number, string[]> = {
  5: ['Excelente profe, muy clara para explicar.', 'Las mejores clases que tomé, mejoré muchísimo.', 'Súper recomendable, muy buena onda y paciencia.', 'Muy profesional, siempre puntual y con la clase planificada.'],
  4: ['Muy buena clase, aprendí bastante.', 'Buen profe, me ayudó mucho con la volea.', 'Recomendable, aunque a veces el grupo era grande.', 'Muy buena experiencia, volvería sin dudas.'],
  3: ['Estuvo bien, aunque esperaba más correcciones.', 'Clase correcta, nada fuera de lo común.', 'Buena predisposición pero la clase fue algo desordenada.'],
  2: ['Llegó tarde y la clase se cortó antes.', 'Poca atención individual.'],
  1: ['No me gustó, casi no hubo explicación.'],
};

async function main() {
  cargarEnv();
  if (process.env.NODE_ENV === 'production') {
    throw new Error('El seed no se puede correr en producción');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'bd_padelink',
    entities: [Usuario, Profesor, Alumno, Admin, Club, Clase, Resenia],
    synchronize: true, // deja las tablas iguales a las entidades actuales
  });
  await dataSource.initialize();
  console.log(`Conectado a ${dataSource.options.database}`);

  // 1. Vaciar todas las tablas y reiniciar los ids
  const tablas = dataSource.entityMetadatas.flatMap((m) => [m.tableName, ...m.manyToManyRelations.map((r) => r.joinTableName)]);
  const unicas = [...new Set(tablas.filter(Boolean))].map((t) => `"${t}"`).join(', ');
  await dataSource.query(`TRUNCATE ${unicas} RESTART IDENTITY CASCADE`);
  console.log('Base vaciada');

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const usuarioRepo = dataSource.getRepository(Usuario);

  // 2. Admin
  const adminUser = await usuarioRepo.save(usuarioRepo.create({
    nombre: 'Admin', apellido: 'PadeLink', email: 'admin@padelink.test', password: hash,
    telefono: telefono(), tipoUsuario: UserRole.ADMIN,
  }));
  await dataSource.getRepository(Admin).save({ usuario_id: adminUser.id, usuarioId: adminUser });

  // 3. Clubes
  const clubes = await dataSource.getRepository(Club).save(CLUBES);
  const clubesConCancha = clubes.filter((c) => c.nombre !== 'A domicilio');
  const clubDomicilio = clubes.find((c) => c.nombre === 'A domicilio')!;

  // 4. Profesores
  const profesorRepo = dataSource.getRepository(Profesor);
  const profesores: { entidad: Profesor; calidad: number }[] = [];
  for (const p of PROFESORES) {
    const user = await usuarioRepo.save(usuarioRepo.create({
      nombre: p.nombre, apellido: p.apellido, email: email(p.nombre, p.apellido), password: hash,
      telefono: telefono(), tipoUsuario: UserRole.PROFESOR,
    }));
    const entidad = await profesorRepo.save(profesorRepo.create({
      usuario_id: user.id,
      bio: p.bio,
      precioClaseIndividual: entre(18, 32) * 1000,
      precioClaseGrupal: entre(9, 16) * 1000,
      manoDominante: rand() < 0.8 ? ManoDominante.diestro : ManoDominante.zurdo,
    }));
    profesores.push({ entidad, calidad: p.calidad });
  }

  // 5. Alumnos (el primero es juan.perez@padelink.test, cuenta de demo)
  const alumnoRepo = dataSource.getRepository(Alumno);
  const alumnos: Alumno[] = [];
  const usados = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const femenino = i === 0 ? false : rand() < 0.45;
    let nombre = i === 0 ? 'Juan' : elegir(femenino ? NOMBRES_F : NOMBRES_M);
    let apellido = i === 0 ? 'Pérez' : elegir(APELLIDOS);
    while (usados.has(email(nombre, apellido))) {
      nombre = elegir(femenino ? NOMBRES_F : NOMBRES_M);
      apellido = elegir(APELLIDOS);
    }
    usados.add(email(nombre, apellido));

    const edad = entre(18, 58);
    const nacimiento = new Date(2026 - edad, entre(0, 11), entre(1, 28));
    const user = await usuarioRepo.save(usuarioRepo.create({
      nombre, apellido, email: email(nombre, apellido), password: hash,
      telefono: telefono(), tipoUsuario: UserRole.ALUMNO,
    }));
    alumnos.push(await alumnoRepo.save(alumnoRepo.create({
      usuario_id: user.id,
      fecha_nacimiento: nacimiento.toISOString().slice(0, 10),
      edad,
      nivel: i === 0 ? 'intermedio' : elegir(NIVELES),
      mano_dominante: rand() < 0.85 ? ManoDominante.diestro : ManoDominante.zurdo,
      genero: femenino ? Genero.FEMENINO : Genero.MASCULINO,
      posicion: rand() < 0.5 ? Posicion.DRIVE : Posicion.REVES,
    })));
  }

  // 6. Clases: 5 por profesor entre 3 semanas atrás y 4 semanas adelante
  const claseRepo = dataSource.getRepository(Clase);
  const hoy = new Date('2026-10-22T00:00:00-03:00');
  const ocupados = new Map<number, Set<string>>(); // alumno -> horarios ya tomados
  const tomoClaseCon = new Map<number, Set<number>>(); // profesor -> alumnos que tomaron clase
  let totalClases = 0;
  let canceladas = 0;

  for (const { entidad: profesor } of profesores) {
    tomoClaseCon.set(profesor.usuario_id, new Set());
    for (let k = 0; k < 5; k++) {
      const dias = entre(-21, 28);
      const hora = elegir([8, 9, 10, 11, 17, 18, 19, 20, 21]);
      const fecha = new Date(hoy.getTime() + dias * 86400000);
      fecha.setUTCHours(hora + 3, elegir([0, 30]), 0, 0); // hora local de Argentina (UTC-3)

      const tipo = rand() < 0.6 ? TipoEnum.GRUPAL : TipoEnum.LIBRE;
      const capacidad = tipo === TipoEnum.LIBRE ? 4 : elegir([4, 4, 6, 6, 8]);
      const nivel = elegir(NIVELES);
      const club = rand() < 0.1 ? clubDomicilio : elegir(clubesConCancha);
      const cancelada = dias > 0 && canceladas < 4 && rand() < 0.08;

      // Las clases pasadas y algunas futuras se llenan; el resto queda con lugares
      const llenado = dias < 0 ? 0.6 + rand() * 0.4 : rand();
      let cantidad = cancelada ? 0 : Math.round(capacidad * llenado);
      if (!cancelada && rand() < 0.2) cantidad = capacidad;

      const clave = fecha.toISOString();
      const candidatos = mezclar(alumnos).filter((a) => !ocupados.get(a.usuario_id)?.has(clave));
      const inscriptos = candidatos.slice(0, Math.min(cantidad, capacidad));
      for (const a of inscriptos) {
        if (!ocupados.has(a.usuario_id)) ocupados.set(a.usuario_id, new Set());
        ocupados.get(a.usuario_id)!.add(clave);
        if (dias < 0) tomoClaseCon.get(profesor.usuario_id)!.add(a.usuario_id);
      }

      await claseRepo.save(claseRepo.create({
        profesor, club, fecha_hora: fecha, duracion_minutos: elegir([60, 60, 90, 90, 120]),
        nivel, capacidad_maxima: capacidad, descripcion: elegir(DESCRIPCIONES[nivel]),
        tipo_clase: tipo, alumnos_inscritos: inscriptos,
        estado: cancelada ? EstadoEnum.CANCELADA
          : inscriptos.length >= capacidad ? EstadoEnum.COMPLETA : EstadoEnum.DISPONIBLE,
      }));
      totalClases++;
      if (cancelada) canceladas++;
    }
  }

  // Juan Pérez (cuenta de demo) tiene al menos una clase pasada con Laura Gómez, así puede reseñarla
  // en la demo, y una reserva futura para mostrar en su panel.
  const juan = alumnos[0];
  const laura = profesores[0].entidad;
  const sofia = profesores[2].entidad;
  const demoPasada = new Date(hoy.getTime() - 5 * 86400000); demoPasada.setUTCHours(21, 0, 0, 0);
  const demoFutura = new Date(hoy.getTime() + 3 * 86400000); demoFutura.setUTCHours(22, 0, 0, 0);
  await claseRepo.save(claseRepo.create({
    profesor: laura, club: clubesConCancha[0], fecha_hora: demoPasada, duracion_minutos: 90, nivel: 'intermedio',
    capacidad_maxima: 4, descripcion: 'Bandeja y posicionamiento en la red.', tipo_clase: TipoEnum.GRUPAL,
    alumnos_inscritos: [juan, ...alumnos.slice(1, 3)], estado: EstadoEnum.DISPONIBLE,
  }));
  await claseRepo.save(claseRepo.create({
    profesor: sofia, club: clubesConCancha[1], fecha_hora: demoFutura, duracion_minutos: 60, nivel: 'intermedio',
    capacidad_maxima: 6, descripcion: 'Trabajo de volea y salida de pared.', tipo_clase: TipoEnum.GRUPAL,
    alumnos_inscritos: [juan, alumnos[3]], estado: EstadoEnum.DISPONIBLE,
  }));
  totalClases += 2;
  tomoClaseCon.get(laura.usuario_id)!.add(juan.usuario_id);
  for (const a of alumnos.slice(1, 3)) tomoClaseCon.get(laura.usuario_id)!.add(a.usuario_id);

  // 7. Reseñas: ~70% de los alumnos que tomaron clase con un profesor lo reseñan.
  // Juan no reseña a Laura, para poder mostrar cómo se deja una reseña en la demo.
  const reseniaRepo = dataSource.getRepository(Resenia);
  let totalResenias = 0;
  for (const { entidad: profesor, calidad } of profesores) {
    const ids = [...tomoClaseCon.get(profesor.usuario_id)!];
    const calificaciones: number[] = [];
    for (const alumnoId of ids) {
      if (alumnoId === juan.usuario_id) continue;
      if (rand() > 0.7) continue;
      const nota = Math.max(1, Math.min(5, Math.round(calidad + (rand() - 0.5) * 2)));
      const alumno = alumnos.find((a) => a.usuario_id === alumnoId)!;
      const fecha = new Date(hoy.getTime() - entre(0, 20) * 86400000);
      await reseniaRepo.save(reseniaRepo.create({
        profesor, alumno, calificacion: nota,
        comentario: rand() < 0.85 ? elegir(COMENTARIOS[nota]) : undefined,
        fecha_creacion: fecha,
      }));
      calificaciones.push(nota);
      totalResenias++;
    }
    const promedio = calificaciones.length ? calificaciones.reduce((s, n) => s + n, 0) / calificaciones.length : 0;
    await profesorRepo.update(profesor.usuario_id, { promedioCalificacion: Number(promedio.toFixed(2)) });
  }

  console.log('Datos de demo cargados:');
  console.log(`  1 admin, ${profesores.length} profesores, ${alumnos.length} alumnos`);
  console.log(`  ${clubes.length} clubes, ${totalClases} clases (${canceladas} canceladas), ${totalResenias} reseñas`);
  console.log(`  Contraseña de todas las cuentas: ${DEMO_PASSWORD}`);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Error al cargar los datos de demo:', err);
  process.exit(1);
});
