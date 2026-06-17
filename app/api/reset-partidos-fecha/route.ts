import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const { fechaId, disciplinaId } = await request.json();

    if (!fechaId || !disciplinaId) {
      return NextResponse.json(
        { success: false, error: 'fechaId y disciplinaId son requeridos' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Obtener información de la disciplina
    const [disciplinaResult] = await connection.query(
      'SELECT nombre FROM TblDisciplina WHERE id = ?',
      [disciplinaId]
    );
    const disciplinaData = Array.isArray(disciplinaResult) ? disciplinaResult[0] : null;
    const disciplinaNombre = disciplinaData?.nombre || 'Unknown';

    // Eliminar todos los partidos de esta disciplina en esta fecha (incluyendo Clausura equivalente)
    const [fechaResult] = await connection.query(
      'SELECT tipo FROM TblFecha WHERE id = ?',
      [fechaId]
    );
    const fechaData = Array.isArray(fechaResult) ? fechaResult[0] : null;
    const tipoFecha = (fechaData?.tipo || 'Apertura').toString().toLowerCase().trim();

    let fechasAEliminar = [fechaId];

    // Si es Apertura, también eliminar Clausura equivalente
    if (tipoFecha === 'apertura') {
      const [todasLasFechas] = await connection.query('SELECT id, tipo FROM TblFecha ORDER BY id');
      const fechas = Array.isArray(todasLasFechas) ? todasLasFechas : [];
      
      const apertura = fechas.filter(f => f.tipo?.toString().toLowerCase().trim() === 'apertura');
      const clausura = fechas.filter(f => f.tipo?.toString().toLowerCase().trim() === 'clausura');
      
      const indexApertura = apertura.findIndex(f => f.id === fechaId);
      if (indexApertura >= 0 && indexApertura < clausura.length) {
        fechasAEliminar.push(clausura[indexApertura].id);
      }
    }

    console.log(`🗑️ Eliminando partidos de ${disciplinaNombre} de fechas: ${fechasAEliminar.join(', ')}`);

    for (const fId of fechasAEliminar) {
      await connection.query(
        'DELETE FROM TblPartido WHERE fecha_id = ? AND disciplina_id = ?',
        [fId, disciplinaId]
      );
    }

    console.log(`✅ Partidos eliminados correctamente`);

    return NextResponse.json({
      success: true,
      message: `Partidos de ${disciplinaNombre} eliminados de ${fechasAEliminar.length} fecha(s)`,
      fechasEliminadas: fechasAEliminar,
    });
  } catch (error) {
    console.error('Error eliminando partidos:', error);
    return NextResponse.json(
      { success: false, error: 'Error en el servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
