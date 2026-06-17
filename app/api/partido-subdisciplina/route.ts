import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET - Obtener puntos por sub-disciplina de un partido
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const partidoId = searchParams.get('partidoId');

    if (!partidoId) {
      return NextResponse.json(
        { error: 'partidoId es requerido' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [results] = await connection.query(
      `SELECT 
        psd.id,
        psd.partido_id,
        psd.subdisciplina_id,
        psd.puntos,
        sd.nombre as subdisciplina_nombre
       FROM tblPartidoSubDisciplina psd
       JOIN tblSubDisciplina sd ON psd.subdisciplina_id = sd.id
       WHERE psd.partido_id = ?
       ORDER BY sd.nombre ASC`,
      [partidoId]
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error obteniendo puntos por sub-disciplina:', error);
    return NextResponse.json(
      { error: 'Error al obtener puntos' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Crear/actualizar puntos por sub-disciplina
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { partidoId, puntosPorSubDisciplina } = body;

    if (!partidoId || !puntosPorSubDisciplina) {
      return NextResponse.json(
        { error: 'partidoId y puntosPorSubDisciplina son requeridos' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Para cada sub-disciplina, insertar o actualizar
    for (const [subDisciplinaId, puntos] of Object.entries(puntosPorSubDisciplina)) {
      await connection.query(
        `INSERT INTO tblPartidoSubDisciplina (partido_id, subdisciplina_id, puntos)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE puntos = ?`,
        [partidoId, subDisciplinaId, puntos, puntos]
      );
    }

    console.log(`✅ Puntos por sub-disciplina guardados para partido ${partidoId}`);

    return NextResponse.json({
      success: true,
      message: 'Puntos guardados correctamente',
    });
  } catch (error) {
    console.error('Error guardando puntos por sub-disciplina:', error);
    return NextResponse.json(
      { error: 'Error al guardar puntos' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
