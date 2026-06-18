import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { addMinutesToTime, calcularMinutosEntre } from '@/lib/time-utils';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

interface Equipo {
  id: number;
  nombre: string;
}

interface EquipoSerie {
  equipo_id: number;
  equipo_nombre: string;
  serie_id: number;
  serie_nombre: string;
  disciplina_id: number;
  disciplina_nombre: string;
  tipo_competicion: string;
}

interface Sitio {
  id: number;
  nombre: string;
  horario_inicio: string;
  horario_fin: string;
}

interface Partido {
  equipo1_id: number;
  equipo1_nombre: string;
  equipo2_id?: number;
  equipo2_nombre?: string;
  serie_id: number;
  serie_nombre: string;
  fecha_id: string;
  disciplina_id?: number;
  sitio_id?: number;
  sitio_nombre?: string;
  horario?: string;
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { fechaId, disciplinaId, sitioId, seriesIds } = await request.json();

    if (!fechaId || !disciplinaId || !sitioId || !seriesIds || seriesIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'fechaId, disciplinaId, sitioId y al menos una serieId son requeridos',
        },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Obtener información de la fecha actual para saber si es Apertura o Clausura
    const [fechaResult] = await connection.query(
      `SELECT tipo, id FROM TblFecha WHERE id = ?`,
      [fechaId]
    );
    const fechaData = Array.isArray(fechaResult) ? fechaResult[0] : null;
    const tipoFecha = (fechaData?.tipo || 'Apertura').trim(); // Apertura o Clausura

    console.log(`\n📅 TIPO DE FECHA DETECTADO:`);
    console.log(`   fechaData: ${JSON.stringify(fechaData)}`);
    console.log(`   tipoFecha raw: '${fechaData?.tipo}'`);
    console.log(`   tipoFecha trimmed: '${tipoFecha}'`);
    console.log(`   tipoFecha.toLowerCase(): '${tipoFecha.toLowerCase()}'`);
    console.log(`   ¿Es Apertura?: ${tipoFecha.toLowerCase() === 'apertura'}`);

    // Obtener todas las fechas para mapeo Apertura ↔ Clausura
    const [todasLasFechas] = await connection.query(`
      SELECT id, tipo, nombre
      FROM TblFecha
      ORDER BY id ASC
    `);

    let fechasApertura: any[] = [];
    let fechasClausura: any[] = [];
    
    // Manejar posible estructura anidada de MySQL
    let fechasParaProcesar = todasLasFechas;
    if (Array.isArray(todasLasFechas) && Array.isArray(todasLasFechas[0])) {
      fechasParaProcesar = todasLasFechas[0];
    }
    
    if (Array.isArray(fechasParaProcesar)) {
      fechasParaProcesar.forEach((f: any) => {
        const tipoLower = (f.tipo || '').toString().toLowerCase().trim();
        if (tipoLower === 'apertura') {
          fechasApertura.push({...f, id: Number(f.id)});
        } else if (tipoLower === 'clausura') {
          fechasClausura.push({...f, id: Number(f.id)});
        }
      });
    }

    console.log(`📊 Fechas cargadas: ${fechasApertura.length} Apertura, ${fechasClausura.length} Clausura`);
    console.log(`   Apertura: ${fechasApertura.map(f => `${f.id}(${f.nombre})`).join(', ')}`);
    console.log(`   Clausura: ${fechasClausura.map(f => `${f.id}(${f.nombre})`).join(', ')}`);

    // Función simple para obtener fecha equivalente
    const obtenerFechaEquivalente = (idFecha: number, tipo: string): any => {
      const tipoLower = (tipo || '').toString().toLowerCase().trim();
      const idBuscar = Number(idFecha);
      
      if (tipoLower === 'apertura') {
        // Si es Apertura, la Clausura equivalente está en posición del índice
        const indexApertura = fechasApertura.findIndex(f => Number(f.id) === idBuscar);
        
        if (indexApertura >= 0 && indexApertura < fechasClausura.length) {
          const resultado = fechasClausura[indexApertura];
          console.log(`🔗 Apertura ${idBuscar} → Clausura ${resultado.id} (índice ${indexApertura})`);
          return resultado;
        } else {
          console.log(`🔗 NO encontrada Clausura para Apertura ${idBuscar}`);
        }
      } else if (tipoLower === 'clausura') {
        // Si es Clausura, buscar Apertura
        const indexClausura = fechasClausura.findIndex(f => Number(f.id) === idBuscar);
        
        if (indexClausura >= 0 && indexClausura < fechasApertura.length) {
          const resultado = fechasApertura[indexClausura];
          console.log(`🔗 Clausura ${idBuscar} → Apertura ${resultado.id} (índice ${indexClausura})`);
          return resultado;
        } else {
          console.log(`🔗 NO encontrada Apertura para Clausura ${idBuscar}`);
        }
      }
      
      return null;
    };

    console.log(`📊 Mapeando fechas: ${fechasApertura.length} Apertura(s), ${fechasClausura.length} Clausura(s)`);

    // Primero, eliminar SOLO los partidos de las series seleccionadas en esta disciplina y fecha
    const seriesPlaceholders = seriesIds.map(() => '?').join(',');
    await connection.query(
      `DELETE FROM TblPartido WHERE fecha_id = ? AND disciplina_id = ? AND serie_id IN (${seriesPlaceholders})`,
      [fechaId, disciplinaId, ...seriesIds]
    );

    // Obtener información de la disciplina
    const [disciplinaResult] = await connection.query(
      `SELECT tipo_competicion, nombre FROM TblDisciplina WHERE id = ?`,
      [disciplinaId]
    );
    const disciplinaData = Array.isArray(disciplinaResult) ? disciplinaResult[0] : null;
    let tipoCompeticion = disciplinaData?.tipo_competicion || 'vs';
    const disciplinaNombre = disciplinaData?.nombre || 'Unknown';

    // Disciplinas individuales: Atletismo, Billar, Cubilete, Inauguración, Natación, Tiro al Sapo
    const disciplinasIndividuales = ['atletismo', 'billar', 'cubilete', 'inauguracion', 'natacion', 'tiro al sapo'];
    const esIndividual = disciplinasIndividuales.some(d => disciplinaNombre.toLowerCase().includes(d));
    
    // Si es individual, forzar tipo_competicion como 'puntos' para generar partidos individuales
    if (esIndividual) {
      tipoCompeticion = 'puntos';
      console.log(`📌 Disciplina individual detectada: ${disciplinaNombre} - Forzando tipo_competicion='puntos'`);
    }

    // Obtener todos los equipos en esta disciplina agrupados por serie (SOLO LAS SELECCIONADAS)
    const placeholders = seriesIds.map(() => '?').join(',');
    const [equiposResult] = await connection.query(
      `SELECT 
        ed.equipo_id,
        e.nombre as equipo_nombre,
        ed.serie_id,
        s.nombre as serie_nombre,
        ed.disciplina_id,
        d.nombre as disciplina_nombre,
        d.tipo_competicion
      FROM TblEquipoDisciplina ed
      JOIN TblEquipo e ON ed.equipo_id = e.id
      JOIN TblSeries s ON ed.serie_id = s.id
      JOIN TblDisciplina d ON ed.disciplina_id = d.id
      WHERE ed.disciplina_id = ? AND e.activa = TRUE AND ed.serie_id IN (${placeholders})
      ORDER BY ed.serie_id`,
      [disciplinaId, ...seriesIds]
    );

    const equipos = Array.isArray(equiposResult) ? (equiposResult as EquipoSerie[]) : [];

    if (equipos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No hay equipos en esta disciplina',
        },
        { status: 400 }
      );
    }

    // Obtener sitios para esta disciplina
    let sitiosParaUsar: Sitio[] = [];
    
    if (sitioId) {
      // Si se especificó un sitio, usar solo ese
      const [sitioResult] = await connection.query(
        `SELECT id, nombre, TIME_FORMAT(horario_inicio, '%H:%i') as horario_inicio, TIME_FORMAT(horario_fin, '%H:%i') as horario_fin
         FROM TblSitio WHERE id = ? AND activa = TRUE`,
        [sitioId]
      );
      sitiosParaUsar = Array.isArray(sitioResult) ? (sitioResult as Sitio[]) : [];
    } else {
      // Obtener todos los sitios para distribuir
      const [sitiosResult] = await connection.query(
        `SELECT id, nombre, TIME_FORMAT(horario_inicio, '%H:%i') as horario_inicio, TIME_FORMAT(horario_fin, '%H:%i') as horario_fin
         FROM TblSitio WHERE disciplina_id = ? AND activa = TRUE`,
        [disciplinaId]
      );
      sitiosParaUsar = Array.isArray(sitiosResult) ? (sitiosResult as Sitio[]) : [];
    }

    // Obtener equipos en AMBAS disciplinas (Futbito y Basquetbol)
    const [equiposEnAmbasDisciplinasResult] = await connection.query(`
      SELECT DISTINCT ed1.equipo_id
      FROM TblEquipoDisciplina ed1
      JOIN TblEquipoDisciplina ed2 ON ed1.equipo_id = ed2.equipo_id
      JOIN TblDisciplina d1 ON ed1.disciplina_id = d1.id
      JOIN TblDisciplina d2 ON ed2.disciplina_id = d2.id
      WHERE LOWER(d1.nombre) = 'fulbito' AND LOWER(d2.nombre) = 'basquetbol'
        AND ed1.serie_id = ed2.serie_id
    `);
    
    const equiposEnAmbasDisciplinas = new Set<number>();
    if (Array.isArray(equiposEnAmbasDisciplinasResult)) {
      equiposEnAmbasDisciplinasResult.forEach((row: any) => {
        equiposEnAmbasDisciplinas.add(row.equipo_id);
      });
    }
    
    console.log(`📋 Equipos en AMBAS disciplinas (Futbito + Basquetbol): ${equiposEnAmbasDisciplinas.size}`);

    // Agrupar equipos por serie
    const seriesMap = new Map<number, Equipo[]>();
    const serieNamesMap = new Map<number, string>();
    
    equipos.forEach((eq) => {
      if (!seriesMap.has(eq.serie_id)) {
        seriesMap.set(eq.serie_id, []);
        serieNamesMap.set(eq.serie_id, eq.serie_nombre);
      }
      seriesMap.get(eq.serie_id)!.push({
        id: eq.equipo_id,
        nombre: eq.equipo_nombre,
      });
    });

    // Helper function to shuffle array
    const shuffleArray = (arr: any[]): any[] => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Helper function para separar equipos en ambas disciplinas vs sueltos
    const separarEquipos = (equiposEnSerie: Equipo[]): { enAmbas: Equipo[]; sueltos: Equipo[] } => {
      const enAmbas: Equipo[] = [];
      const sueltos: Equipo[] = [];
      
      equiposEnSerie.forEach(eq => {
        if (equiposEnAmbasDisciplinas.has(eq.id)) {
          enAmbas.push(eq);
        } else {
          sueltos.push(eq);
        }
      });
      
      return { enAmbas, sueltos };
    };

    // Generar partidos (Chocolate) para cada serie con horarios escalonados
    const partidos: Partido[] = [];
    const matchCountPerSitio = new Map<number, number>();
    const equiposPorHorario = new Map<string, Set<number>>(); // Track equipo_id por horario
    let equiposDuplicadosSkipped = 0;
    let conflictosPrevenidos = 0;

    console.log(`🔍 INICIANDO GENERACIÓN DE ${disciplinaNombre} - DISCIPLINA ID: ${disciplinaId}`);
    console.log(`📊 Total de equipos obtenidos de BD: ${equipos.length}`);
    console.log(`📊 Es Futbito? ${disciplinaNombre.toLowerCase() === 'fulbito'} | Es Basquetbol? ${disciplinaNombre.toLowerCase() === 'basquetbol'}`);

    // Usar for...of en lugar de forEach para permitir await
    for (const [serieId, equiposEnSerie] of seriesMap.entries()) {
      const serieName = serieNamesMap.get(serieId) || '';
      
      console.log(`\n📍 SERIE: ${serieName} (ID: ${serieId})`);
      console.log(`   ANTES shuffle: [${equiposEnSerie.map(e => e.id).join(', ')}]`);
      
      // Determinar si hacer shuffle basado en la disciplina
      let equiposMezclados: Equipo[];
      
      if (disciplinaNombre.toLowerCase() === 'fulbito') {
        // FUTBITO: Separar equipos en ambas disciplinas vs sueltos
        const { enAmbas, sueltos } = separarEquipos(equiposEnSerie);
        
        console.log(`   📊 Equipos en AMBAS disciplinas: [${enAmbas.map(e => e.id).join(', ')}]`);
        console.log(`   📊 Equipos SUELTOS (solo en Futbito): [${sueltos.map(e => e.id).join(', ')}]`);
        
        // Barajear equipos en ambas disciplinas primero
        const enAmbasMezclados = shuffleArray(enAmbas);
        const sueltosMezclados = shuffleArray(sueltos);
        
        // Combinar: primero los de ambas disciplinas, luego los sueltos
        equiposMezclados = [...enAmbasMezclados, ...sueltosMezclados];
        
        console.log(`   ✅ Barajando equipos para Futbito (primero en ambas, luego sueltos)`);
        console.log(`   DESPUÉS shuffle: [${equiposMezclados.map(e => e.id).join(', ')}]`);
      } else if (disciplinaNombre.toLowerCase() === 'basquetbol') {
        // BASQUETBOL: NO hacer shuffle, usar orden original
        equiposMezclados = equiposEnSerie;
        console.log(`   ⚠️ NO barajando para Basquetbol - usará matchups de Fulbito barajado`);
        console.log(`   SIN shuffle (fulbito): [${equiposMezclados.map(e => e.id).join(', ')}]`);
      } else {
        // Otras disciplinas: separar y barajear como Futbito
        const { enAmbas, sueltos } = separarEquipos(equiposEnSerie);
        const enAmbasMezclados = shuffleArray(enAmbas);
        const sueltosMezclados = shuffleArray(sueltos);
        equiposMezclados = [...enAmbasMezclados, ...sueltosMezclados];
        
        console.log(`   ✅ Barajando equipos (primero en ambas, luego sueltos)`);
        console.log(`   DESPUÉS shuffle: [${equiposMezclados.map(e => e.id).join(', ')}]`);
      }

      // Declarar matchupsAGenerar al inicio para que esté disponible en todo el scope de la serie
      let matchupsAGenerar: Array<{ eq1: Equipo; eq2: Equipo; horarioFutbol?: string; sitioFutbolId?: number }> = [];

      if (tipoCompeticion === 'puntos') {
        // Para puntos, cada equipo es un "turno" individual, escalonado cada 45 minutos
        let horarioActual = sitiosParaUsar.length > 0 ? sitiosParaUsar[0].horario_inicio : '08:00';
        
        for (let i = 0; i < equiposMezclados.length; i++) {
          const horarioKey = `${horarioActual}`;
          if (!equiposPorHorario.has(horarioKey)) {
            equiposPorHorario.set(horarioKey, new Set());
          }
          equiposPorHorario.get(horarioKey)!.add(equiposMezclados[i].id);

          partidos.push({
            equipo1_id: equiposMezclados[i].id,
            equipo1_nombre: equiposMezclados[i].nombre,
            equipo2_id: equiposMezclados[i].id,
            equipo2_nombre: equiposMezclados[i].nombre,
            serie_id: serieId,
            serie_nombre: serieName,
            fecha_id: fechaId,
            disciplina_id: disciplinaId,
            sitio_id: sitiosParaUsar.length > 0 ? sitiosParaUsar[0].id : undefined,
            sitio_nombre: sitiosParaUsar.length > 0 ? sitiosParaUsar[0].nombre : undefined,
            horario: horarioActual,
          });
          
          // Escalonar 45 minutos para el siguiente turno individual
          horarioActual = addMinutesToTime(horarioActual, 45);
        }
      } else if (disciplinaNombre.toLowerCase() === 'basquetbol') {
        // BASQUETBOL CON MATCHUPS DE FUTBITO: Recuperar TODOS los matchups de Futbito
        console.log(`🏀 BASQUETBOL: Recuperando TODOS los matchups de Futbito desde BD para la serie ${serieName}...`);

        // Obtener TODOS los partidos de Futbito para esta serie en esta fecha (CON NOMBRES)
        const [futbolPartidos] = await connection.query(
          `SELECT p.equipo1_id, p.equipo2_id, 
                  e1.nombre as equipo1_nombre, e2.nombre as equipo2_nombre,
                  p.sitio_id, TIME_FORMAT(p.horario_inicio, '%H:%i') as horario_futbol
          FROM TblPartido p
          JOIN TblDisciplina d ON p.disciplina_id = d.id
          JOIN TblEquipo e1 ON p.equipo1_id = e1.id
          JOIN TblEquipo e2 ON p.equipo2_id = e2.id
          WHERE p.fecha_id = ? 
            AND p.serie_id = ?
            AND LOWER(d.nombre) = 'fulbito'
            AND p.equipo1_id != p.equipo2_id
          ORDER BY p.horario_inicio`,
          [fechaId, serieId]
        );

        if (Array.isArray(futbolPartidos) && futbolPartidos.length > 0) {
          console.log(`✓ Se recuperaron ${futbolPartidos.length} matchups de Futbito`);
          
          for (const futbolMatchup of futbolPartidos) {
            const eq1NombreFutbol = futbolMatchup.equipo1_nombre;
            const eq2NombreFutbol = futbolMatchup.equipo2_nombre;
            const horarioFutbol = futbolMatchup.horario_futbol;
            const sitioFutbolId = futbolMatchup.sitio_id;
            
            console.log(`📍 Buscando en Basquetbol: "${eq1NombreFutbol}" vs "${eq2NombreFutbol}"...`);
            
            // Buscar equipos por NOMBRE en Basquetbol (en la misma serie)
            const eq1Basquet = equiposMezclados.find(e => e.nombre === eq1NombreFutbol);
            const eq2Basquet = equiposMezclados.find(e => e.nombre === eq2NombreFutbol);
            
            if (eq1Basquet && eq2Basquet) {
              // Ambos equipos encontrados por nombre - agregar al matchup
              matchupsAGenerar.push({
                eq1: eq1Basquet,
                eq2: eq2Basquet,
                horarioFutbol: horarioFutbol,
                sitioFutbolId: sitioFutbolId,
              });
              console.log(`✓ Matchup encontrado: ${eq1Basquet.id} (${eq1Basquet.nombre}) vs ${eq2Basquet.id} (${eq2Basquet.nombre})`);
            } else {
              const equipoFaltante = !eq1Basquet ? eq1NombreFutbol : eq2NombreFutbol;
              console.log(`⚠ Equipo NO encontrado en Basquetbol: "${equipoFaltante}"`);
            }
          }
        } else {
          console.log(`⚠ NO se encontraron partidos de Futbito para esta serie`);
          console.log(`💡 FALLBACK: Generando matchups de Basquetbol independientemente...`);
          
          // Fallback: Si no hay partidos de Futbito, generar Basquetbol como una disciplina VS normal
          let matchCount = Math.floor(equiposMezclados.length / 2);
          for (let i = 0; i < matchCount; i++) {
            matchupsAGenerar.push({
              eq1: equiposMezclados[i * 2],
              eq2: equiposMezclados[i * 2 + 1],
              horarioFutbol: undefined,
            });
          }
          
          console.log(`📌 Se generaron ${matchupsAGenerar.length} matchups de Basquetbol (sin horarios de Futbito)`);
          console.log(`⚠️ AVISO: Para mejor escalonamiento, genera Futbito primero`);
        }
        
        // AHORA generar los partidos de Basquetbol usando los matchups recuperados
        console.log(`🔗 Usando ${matchupsAGenerar.length} matchups para Basquetbol...`);
        
        for (let i = 0; i < matchupsAGenerar.length; i++) {
          const matchup = matchupsAGenerar[i];
          
          // Usar el sitio de Futbito si está disponible, sino usar el sitio especificado para Basquetbol
          let sitio = null;
          if (matchup.sitioFutbolId && sitiosParaUsar.length > 0) {
            sitio = sitiosParaUsar.find(s => s.id === matchup.sitioFutbolId);
          }
          if (!sitio && sitiosParaUsar.length > 0) {
            sitio = sitiosParaUsar[0];
          }
          
          if (!sitio) {
            partidos.push({
              equipo1_id: matchup.eq1.id,
              equipo1_nombre: matchup.eq1.nombre,
              equipo2_id: matchup.eq2.id,
              equipo2_nombre: matchup.eq2.nombre,
              serie_id: serieId,
              serie_nombre: serieName,
              fecha_id: fechaId,
              disciplina_id: disciplinaId,
              sitio_id: undefined,
              sitio_nombre: undefined,
              horario: '08:00',
            });
            continue;
          }

          const horarioFutbol = matchup.horarioFutbol || sitio.horario_inicio;
          const currentHorario = addMinutesToTime(horarioFutbol, 90);

          // VALIDACIÓN: Verificar tiempo escalonado mínimo (90 minutos) SOLO si viene de Futbito
          if (matchup.horarioFutbol) {
            const minutosEntre = calcularMinutosEntre(horarioFutbol, currentHorario);
            
            if (minutosEntre < 90) {
              console.log(`⚠ Conflicto prevenido: ${matchup.eq1.nombre} tiene partido Futbito a ${horarioFutbol}, Basquetbol a ${currentHorario} (${minutosEntre} minutos de diferencia - necesita 90)`);
              conflictosPrevenidos++;
              continue;
            }
          }

          const eq1 = matchup.eq1.id;
          const eq2 = matchup.eq2.id;
          const horarioKey = `${currentHorario}`;
          const equiposEnHorario = equiposPorHorario.get(horarioKey) || new Set();
          
          if (equiposEnHorario.has(eq1) || equiposEnHorario.has(eq2)) {
            console.log(`⚠ Saltando partido ${matchup.eq1.nombre} vs ${matchup.eq2.nombre} en horario ${currentHorario} (equipo ya tiene partido simultáneo)`);
            equiposDuplicadosSkipped++;
            continue;
          }

          if (!equiposPorHorario.has(horarioKey)) {
            equiposPorHorario.set(horarioKey, new Set());
          }
          equiposPorHorario.get(horarioKey)!.add(eq1);
          equiposPorHorario.get(horarioKey)!.add(eq2);

          console.log(`✓ BASQUETBOL JALADO: ${matchup.eq1.id} vs ${matchup.eq2.id}`);
          if (matchup.horarioFutbol) {
            console.log(`   Futbito: ${horarioFutbol} (Sitio: ${sitio.nombre})`);
          }
          console.log(`   Basquetbol: ${currentHorario} (Sitio: ${sitio.nombre})`);

          partidos.push({
            equipo1_id: matchup.eq1.id,
            equipo1_nombre: matchup.eq1.nombre,
            equipo2_id: matchup.eq2.id,
            equipo2_nombre: matchup.eq2.nombre,
            serie_id: serieId,
            serie_nombre: serieName,
            fecha_id: fechaId,
            disciplina_id: disciplinaId,
            sitio_id: sitio.id,
            sitio_nombre: sitio.nombre,
            horario: currentHorario,
          });
        }
      } else {
        // FUTBITO O DISCIPLINAS VS (sin matchups de Futbito)
        let matchCount = Math.floor(equiposMezclados.length / 2);
        let equipoSuelto: Equipo | null = null;
        
        // Detectar si hay equipo suelto (número impar de equipos)
        if (equiposMezclados.length % 2 === 1) {
          equipoSuelto = equiposMezclados[equiposMezclados.length - 1];
          console.log(`📌 Equipo suelto detectado: ${equipoSuelto.id} en serie ${serieName}`);
        }
        
        // Generar matchups de Futbito
        for (let i = 0; i < matchCount; i++) {
          matchupsAGenerar.push({
            eq1: equiposMezclados[i * 2],
            eq2: equiposMezclados[i * 2 + 1],
          });
        }
        
        // REGLA ESPECIAL: INVITADOS - Generar 1 matchup por fecha, eliminando de fechas siguientes
        if (serieName.toLowerCase() === 'invitados' && matchupsAGenerar.length > 1) {
          console.log(`\n⭐ REGLA ESPECIAL: INVITADOS con ${matchupsAGenerar.length} matchups`);
          
          // Verificar si hay fechas siguientes programadas
          const tipoActual = tipoFecha.toLowerCase();
          const fechasDisponibles = tipoActual === 'apertura' ? fechasApertura : fechasClausura;
          const indexActual = fechasDisponibles.findIndex(f => Number(f.id) === Number(fechaId));
          const hayFechasSiguientes = indexActual >= 0 && indexActual < fechasDisponibles.length - 1;
          
          if (hayFechasSiguientes) {
            console.log(`   ✓ Hay fechas siguientes programadas`);
            console.log(`   Generaré 1 matchup en esta fecha: ${matchupsAGenerar[0].eq1.id} vs ${matchupsAGenerar[0].eq2.id}`);
            console.log(`   Eliminaré este matchup de las fechas siguientes`);
            
            // Guardar el matchup que vamos a usar
            const matchupActual = matchupsAGenerar[0];
            matchupsAGenerar = [matchupActual];
            
            // Eliminar este matchup de todas las fechas siguientes para INVITADOS
            const fechaSiguiente = indexActual + 1 < fechasDisponibles.length ? fechasDisponibles[indexActual + 1] : null;
            if (fechaSiguiente) {
              console.log(`   Eliminando matchup ${matchupActual.eq1.id} vs ${matchupActual.eq2.id} de Fecha ${fechaSiguiente.id} (INVITADOS)`);
              
              // Eliminar el partido de la fecha siguiente
              await connection.query(
                `DELETE FROM TblPartido 
                 WHERE fecha_id = ? 
                   AND disciplina_id = ? 
                   AND serie_id = ? 
                   AND ((equipo1_id = ? AND equipo2_id = ?) OR (equipo1_id = ? AND equipo2_id = ?))`,
                [fechaSiguiente.id, disciplinaId, serieId, matchupActual.eq1.id, matchupActual.eq2.id, matchupActual.eq2.id, matchupActual.eq1.id]
              );
            }
          } else {
            console.log(`   ⚠️ NO hay fechas siguientes - Generaré TODOS los ${matchupsAGenerar.length} matchups en esta fecha`);
            console.log(`   Matchups a generar: ${matchupsAGenerar.map(m => `${m.eq1.id}vs${m.eq2.id}`).join(', ')}`);
          }
        }
        
        // Log de matchups separados
        const matchupsEnAmbas = matchupsAGenerar.filter(m => 
          equiposEnAmbasDisciplinas.has(m.eq1.id) && equiposEnAmbasDisciplinas.has(m.eq2.id)
        );
        const matchupsSueltos = matchupsAGenerar.filter(m => 
          !equiposEnAmbasDisciplinas.has(m.eq1.id) || !equiposEnAmbasDisciplinas.has(m.eq2.id)
        );
        
        console.log(`\n  ⚽ MATCHUPS EN AMBAS DISCIPLINAS: ${matchupsEnAmbas.length}`);
        matchupsEnAmbas.forEach(m => {
          console.log(`     ✓ ${m.eq1.id} vs ${m.eq2.id}`);
        });
        
        console.log(`\n  🎯 MATCHUPS CON EQUIPOS SUELTOS: ${matchupsSueltos.length}`);
        matchupsSueltos.forEach(m => {
          console.log(`     • ${m.eq1.id} vs ${m.eq2.id}`);
        });
        
        // Procesar cada matchup
        for (let i = 0; i < matchupsAGenerar.length; i++) {
          const matchup = matchupsAGenerar[i];
          const sitioIndex = i % (sitiosParaUsar.length > 0 ? sitiosParaUsar.length : 1);
          const sitio = sitiosParaUsar[sitioIndex];
          
          if (!sitio) {
            partidos.push({
              equipo1_id: matchup.eq1.id,
              equipo1_nombre: matchup.eq1.nombre,
              equipo2_id: matchup.eq2.id,
              equipo2_nombre: matchup.eq2.nombre,
              serie_id: serieId,
              serie_nombre: serieName,
              fecha_id: fechaId,
              disciplina_id: disciplinaId,
              sitio_id: undefined,
              sitio_nombre: undefined,
              horario: '08:00',
            });
            continue;
          }

          // VALIDACIÓN: Verificar que no sea un vs prohibido
          const eq1 = matchup.eq1.id;
          const eq2 = matchup.eq2.id;

          // Para Futbito, usar escalonamiento normal del sitio
          const currentMatchCount = matchCountPerSitio.get(sitio.id) || 0;
          const currentHorario = addMinutesToTime(sitio.horario_inicio, currentMatchCount * 45);

          // VALIDACIÓN: Verificar que ninguno de los dos equipos ya esté jugando en este horario
          const horarioKey = `${currentHorario}`;
          const equiposEnHorario = equiposPorHorario.get(horarioKey) || new Set();
          
          if (equiposEnHorario.has(eq1) || equiposEnHorario.has(eq2)) {
            console.log(`⚠ Conflicto prevenido: ${matchup.eq1.id} tiene partido Futbito a 14:00, Basquetbol a 14:00 (0 minutos de diferencia - necesita 90)`);
            equiposDuplicadosSkipped++;
            continue;
          }

          // Registrar equipos en este horario
          if (!equiposPorHorario.has(horarioKey)) {
            equiposPorHorario.set(horarioKey, new Set());
          }
          equiposPorHorario.get(horarioKey)!.add(eq1);
          equiposPorHorario.get(horarioKey)!.add(eq2);

          // Incrementar contador para el siguiente partido en este sitio
          const nextMatchCount = matchCountPerSitio.get(sitio.id) || 0;
          matchCountPerSitio.set(sitio.id, nextMatchCount + 1);

          partidos.push({
            equipo1_id: matchup.eq1.id,
            equipo1_nombre: matchup.eq1.nombre,
            equipo2_id: matchup.eq2.id,
            equipo2_nombre: matchup.eq2.nombre,
            serie_id: serieId,
            serie_nombre: serieName,
            fecha_id: fechaId,
            disciplina_id: disciplinaId,
            sitio_id: sitio.id,
            sitio_nombre: sitio.nombre,
            horario: currentHorario,
          });
        }
      }
    }

    // Guardar los partidos en la base de datos
    for (const partido of partidos) {
      const horaPartido = partido.horario ? `${partido.horario}:00` : null;
      
      await connection.query(
        `INSERT INTO TblPartido (fecha_id, disciplina_id, serie_id, equipo1_id, equipo2_id, estado, sitio_id, horario_inicio)
         VALUES (?, ?, ?, ?, ?, 'Programado', ?, ?)`,
        [fechaId, disciplinaId, partido.serie_id, partido.equipo1_id, partido.equipo2_id, partido.sitio_id || null, horaPartido]
      );
    }

    console.log(`✅ ${partidos.length} partidos de ${disciplinaNombre} generados en Apertura (Fecha ID: ${fechaId})`);

    // Si es APERTURA, generar automáticamente la CLAUSURA equivalente (para TODAS las disciplinas)
    if (tipoFecha.toLowerCase() === 'apertura') {
      console.log(`\n🔍 Intentando generar Clausura automática...`);
      console.log(`   Disciplina: ${disciplinaNombre}`);
      console.log(`   Fecha actual (Apertura): ID ${fechaId}`);
      
      const fechaClausuraEquivalente = obtenerFechaEquivalente(fechaId, 'apertura');
      
      if (fechaClausuraEquivalente) {
        console.log(`\n📋 GENERANDO CLAUSURA AUTOMÁTICA`);
        console.log(`   Fecha equivalente: ID ${fechaClausuraEquivalente.id} - ${fechaClausuraEquivalente.nombre} (Clausura)`);
        
        // Obtener todos los partidos que acabamos de crear en Apertura (INCLUYENDO individuales)
        const [partidosAperturaCreados] = await connection.query(`
          SELECT 
            p.equipo1_id,
            p.equipo2_id,
            p.serie_id,
            p.sitio_id,
            p.horario_inicio
          FROM TblPartido p
          WHERE p.fecha_id = ?
            AND p.disciplina_id = ?
            AND p.serie_id IN (${seriesIds.map(() => '?').join(',')})
          ORDER BY p.serie_id
        `, [fechaId, disciplinaId, ...seriesIds]);

        if (Array.isArray(partidosAperturaCreados) && partidosAperturaCreados.length > 0) {
          console.log(`✓ Se encontraron ${partidosAperturaCreados.length} partidos de Apertura para duplicar en Clausura`);
          
          // Primero, eliminar partidos anteriores de Clausura (si existen)
          const seriesPlaceholdersClaus = seriesIds.map(() => '?').join(',');
          await connection.query(
            `DELETE FROM TblPartido WHERE fecha_id = ? AND disciplina_id = ? AND serie_id IN (${seriesPlaceholdersClaus})`,
            [fechaClausuraEquivalente.id, disciplinaId, ...seriesIds]
          );

          // Crear partidos de Clausura - INCLUYENDO sitio_id y horario_inicio
          for (const partidoApertura of partidosAperturaCreados) {
            let clausuraEquipo1 = partidoApertura.equipo1_id;
            let clausuraEquipo2 = partidoApertura.equipo2_id;
            
            // Si NO es individual (equipo1_id !== equipo2_id), INVERTIR el VS
            if (clausuraEquipo1 !== clausuraEquipo2) {
              // INVERTIDO: equipo2 pasa a ser equipo1, equipo1 pasa a ser equipo2
              const temp = clausuraEquipo1;
              clausuraEquipo1 = clausuraEquipo2;
              clausuraEquipo2 = temp;
            }
            // Si ES individual (equipo1_id === equipo2_id), MANTENER igual
            
            await connection.query(
              `INSERT INTO TblPartido (fecha_id, disciplina_id, serie_id, equipo1_id, equipo2_id, estado, sitio_id, horario_inicio)
               VALUES (?, ?, ?, ?, ?, 'Programado', ?, ?)`,
              [
                fechaClausuraEquivalente.id,
                disciplinaId,
                partidoApertura.serie_id,
                clausuraEquipo1,
                clausuraEquipo2,
                partidoApertura.sitio_id || null,
                partidoApertura.horario_inicio || null
              ]
            );
          }

          console.log(`✅ ${partidosAperturaCreados.length} partidos de Clausura creados`);
          
          // Log del tipo de replicación
          if (tipoCompeticion === 'puntos') {
            console.log(`   (Disciplina individual - Sin inversión de VS)`);
          } else {
            console.log(`   (Disciplina VS - Con inversión de VS)`);
          }
        } else {
          console.log(`⚠ No se encontraron partidos recién creados para duplicar en Clausura`);
        }
      } else {
        console.log(`⚠ No existe fecha equivalente de Clausura para esta Apertura`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        partidos,
        total: partidos.length,
        equiposDuplicadosSkipped,
        tipo_competicion: tipoCompeticion,
        tipo_fecha: tipoFecha,
        message: tipoFecha.toLowerCase() === 'apertura' 
          ? `${partidos.length} partidos generados en Apertura + automáticamente en Clausura equivalente con VS invertido`
          : `${partidos.length} partidos generados. ${equiposDuplicadosSkipped > 0 ? `${equiposDuplicadosSkipped} partidos saltados (equipos con conflicto de horario)` : ''}`,
        next_step: 'Llamar a /api/aplicar-chocolateo con { fechaId } para escalonar horarios entre disciplinas',
      },
    });
  } catch (error) {
    console.error('Error generando partidos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
