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

    console.log('🔵 Iniciando migración: Agregando columna puntos_individuales a TblPartido');

    // Ejecutar el ALTER TABLE
    await connection.query(
      `ALTER TABLE TblPartido ADD COLUMN IF NOT EXISTS puntos_individuales INT NULL DEFAULT NULL`
    );

    console.log('✅ Columna puntos_individuales agregada (o ya existía)');

    // Verificar la estructura
    const [columns] = await connection.query(`DESCRIBE TblPartido`);
    
    console.log('📋 Estructura actual de TblPartido:');
    console.log(columns);

    return NextResponse.json({
      success: true,
      message: 'Migración completada: Columna puntos_individuales agregada a TblPartido',
      columns,
    });
  } catch (error) {
    console.error('❌ Error en migración:', error);
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
