import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET - Obtener todos los partidos o filtrados por fecha
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const fechaId = searchParams.get('fechaId');

    connection = await mysql.createConnection(dbConfig);

    let query = `
      SELECT 
        p.id,
        p.fecha_id,
        f.nombre as fecha_nombre,
        f.fecha,
        p.disciplina_id,
        d.nombre as disciplina_nombre,
        p.serie_id,
        s.nombre as serie_nombre,
        p.equipo1_id,
        e1.nombre as equipo1_nombre,
        p.equipo2_id,
        e2.nombre as equipo2_nombre,
        p.goles_equipo1,
        p.goles_equipo2,
        COALESCE(p.puntos_individuales, 0) as puntos_individuales,
        p.estado,
        COALESCE(st.nombre, 'Sin asignar') as sitio_nombre,
        COALESCE(p.horario_inicio, '14:00:00') as horario_inicio,
        d.tipo_competicion,
        p.fecha_creacion
      FROM TblPartido p
      JOIN TblFecha f ON p.fecha_id = f.id
      JOIN TblDisciplina d ON p.disciplina_id = d.id
      JOIN TblSeries s ON p.serie_id = s.id
      JOIN TblEquipo e1 ON p.equipo1_id = e1.id
      LEFT JOIN TblEquipo e2 ON p.equipo2_id = e2.id
      LEFT JOIN TblSitio st ON p.sitio_id = st.id
    `;

    const params: any[] = [];

    if (fechaId) {
      query += ' WHERE p.fecha_id = ?';
      params.push(fechaId);
    }

    query += ' ORDER BY f.fecha ASC, s.nombre ASC, p.id ASC';

    const [results] = await connection.query(query, params);

    // Si se solicita orden aleatorio, hacer shuffle de los resultados
    const randomOrder = searchParams.get('randomOrder') === 'true';
    if (randomOrder && Array.isArray(results)) {
      const shuffled = [...results];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return NextResponse.json({
        success: true,
        data: shuffled,
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error obteniendo partidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener partidos' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Actualizar resultado, equipos u otros datos de un partido
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { goles_equipo1, goles_equipo2, puntos_individuales, estado, equipo1_id, equipo2_id, horario_inicio } = body;

    console.log('🔵 PUT /api/partidos - Actualizando partido');
    console.log('  ID:', id);
    console.log('  Body recibido:', body);

    if (!id) {
      console.log('❌ No hay ID');
      return NextResponse.json(
        { error: 'ID del partido es requerido' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Construir dinámicamente la query UPDATE según qué campos se envíen
    const updateFields: string[] = [];
    const values: any[] = [];

    if (goles_equipo1 !== undefined) {
      updateFields.push('goles_equipo1 = ?');
      values.push(goles_equipo1);
    }
    if (goles_equipo2 !== undefined) {
      updateFields.push('goles_equipo2 = ?');
      values.push(goles_equipo2);
    }
    if (puntos_individuales !== undefined) {
      updateFields.push('puntos_individuales = ?');
      values.push(puntos_individuales);
    }
    if (estado !== undefined) {
      updateFields.push('estado = ?');
      values.push(estado);
    }
    if (equipo1_id !== undefined) {
      updateFields.push('equipo1_id = ?');
      values.push(equipo1_id);
    }
    if (equipo2_id !== undefined) {
      updateFields.push('equipo2_id = ?');
      values.push(equipo2_id);
    }
    if (horario_inicio !== undefined) {
      updateFields.push('horario_inicio = ?');
      values.push(horario_inicio);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    values.push(id);

    const updateQuery = `UPDATE TblPartido SET ${updateFields.join(', ')} WHERE id = ?`;

    console.log('  Valores a actualizar:', values);

    await connection.query(updateQuery, values);

    console.log('✅ Partido actualizado correctamente');

    return NextResponse.json({
      success: true,
      message: 'Partido actualizado correctamente',
    });
  } catch (error) {
    console.error('❌ Error actualizando partido:', error);
    return NextResponse.json(
      { error: 'Error al actualizar partido', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Eliminar un partido
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del partido es requerido' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.query('DELETE FROM TblPartido WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Partido eliminado correctamente',
    });
  } catch (error) {
    console.error('Error eliminando partido:', error);
    return NextResponse.json(
      { error: 'Error al eliminar partido' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
