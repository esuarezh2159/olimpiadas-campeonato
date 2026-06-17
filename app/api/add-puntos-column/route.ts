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
    connection = await mysql.createConnection(dbConfig);

    console.log('🔵 Iniciando migración: Agregando columna puntos_individuales...');

    // Primero, verificar la estructura actual de la tabla
    const [tableInfo] = await connection.query(
      `DESCRIBE TblPartido`
    );
    console.log('📋 Estructura actual de TblPartido:');
    console.log(tableInfo);

    // Verificar si la columna ya existe
    const columnaExiste = (tableInfo as any[]).some(col => col.Field === 'puntos_individuales');
    
    if (columnaExiste) {
      console.log('✅ La columna puntos_individuales ya existe');
      return NextResponse.json({
        success: true,
        message: 'Columna puntos_individuales ya existe',
        columnaExiste: true,
      });
    }

    console.log('🔧 Agregando columna puntos_individuales...');

    // Agregar la columna
    await connection.query(
      `ALTER TABLE TblPartido ADD COLUMN puntos_individuales INT NULL DEFAULT NULL`
    );

    console.log('✅ Columna puntos_individuales agregada exitosamente');

    // Verificar que se agregó correctamente
    const [newTableInfo] = await connection.query(
      `DESCRIBE TblPartido`
    );
    
    const columnaAhora = (newTableInfo as any[]).find(col => col.Field === 'puntos_individuales');
    console.log('✅ Columna agregada:', columnaAhora);

    return NextResponse.json({
      success: true,
      message: 'Columna puntos_individuales agregada a TblPartido',
      columnaExiste: true,
      detalles: columnaAhora,
    });
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
