import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET - Obtener todas las sub-disciplinas o filtradas por disciplina_id
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const disciplinaId = searchParams.get('disciplinaId');

    connection = await mysql.createConnection(dbConfig);

    let query = `
      SELECT 
        sd.id,
        sd.disciplina_id,
        d.nombre as disciplina_nombre,
        sd.nombre,
        sd.activa,
        sd.fecha_creacion
      FROM tblSubDisciplina sd
      JOIN TblDisciplina d ON sd.disciplina_id = d.id
    `;

    const params: any[] = [];

    if (disciplinaId) {
      query += ' WHERE sd.disciplina_id = ?';
      params.push(parseInt(disciplinaId));
    }

    query += ' ORDER BY d.nombre, sd.nombre';

    const [results] = await connection.query(query, params);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error obteniendo sub-disciplinas:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener sub-disciplinas' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Crear nueva sub-disciplina
export async function POST(request: NextRequest) {
  let connection;
  try {
    const { disciplina_id, nombre } = await request.json();

    if (!disciplina_id || !nombre || nombre.trim() === '') {
      return NextResponse.json(
        { error: 'disciplina_id y nombre son requeridos' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.query(
      `INSERT INTO tblSubDisciplina (disciplina_id, nombre) VALUES (?, ?)`,
      [disciplina_id, nombre.trim()]
    );

    const insertResult = result as any;

    return NextResponse.json({
      success: true,
      message: 'Sub-disciplina creada exitosamente',
      id: insertResult.insertId,
    });
  } catch (error: any) {
    console.error('Error creando sub-disciplina:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Esta sub-disciplina ya existe para esta disciplina' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear sub-disciplina' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Eliminar sub-disciplina
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id es requerido' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.query(
      `DELETE FROM tblSubDisciplina WHERE id = ?`,
      [parseInt(id)]
    );

    return NextResponse.json({
      success: true,
      message: 'Sub-disciplina eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando sub-disciplina:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar sub-disciplina' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
