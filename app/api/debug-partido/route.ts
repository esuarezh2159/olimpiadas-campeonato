import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const partidoId = searchParams.get('partidoId') || '174';

    connection = await mysql.createConnection(dbConfig);

    console.log(`\n🔍 === DEBUGGING PARTIDO ${partidoId} ===`);

    // Obtener datos del partido
    const [partidoDataArray] = await connection.query(
      `SELECT 
        p.id,
        p.equipo1_id,
        p.equipo2_id,
        p.goles_equipo1,
        p.goles_equipo2,
        COALESCE(p.puntos_individuales, 0) as puntos_individuales,
        p.estado,
        d.nombre as disciplina,
        d.tipo_competicion
      FROM TblPartido p
      LEFT JOIN TblDisciplina d ON p.disciplina_id = d.id
      WHERE p.id = ?`,
      [partidoId]
    );

    const partidoData = (Array.isArray(partidoDataArray) && partidoDataArray.length > 0 ? partidoDataArray[0] : null) as any;
    console.log('📋 Datos del partido:', partidoData);

    // Obtener puntos por sub-disciplina
    const [puntosPorSubDisc] = await connection.query(
      `SELECT 
        psd.id,
        psd.subdisciplina_id,
        psd.puntos,
        sd.nombre as subdisciplina_nombre
      FROM tblPartidoSubDisciplina psd
      LEFT JOIN tblSubDisciplina sd ON psd.subdisciplina_id = sd.id
      WHERE psd.partido_id = ?`,
      [partidoId]
    );

    const puntos = Array.isArray(puntosPorSubDisc) ? puntosPorSubDisc : [];
    console.log('📊 Puntos por sub-disciplina:', puntos);

    // Calcular suma
    let sumaTotal = 0;
    puntos.forEach((row: any) => {
      sumaTotal += row.puntos || 0;
    });

    console.log('➕ Suma total:', sumaTotal);

    return NextResponse.json({
      success: true,
      partidoId,
      partido: partidoData,
      puntosPorSubDisciplina: puntos,
      sumaTotal,
      estado: {
        tieneSubDisciplinas: puntos.length > 0,
        puntosPorSubDisciplinaCount: puntos.length,
        puntoIndividualEnBD: partidoData?.puntos_individuales,
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
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
