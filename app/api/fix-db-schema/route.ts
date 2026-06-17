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

    console.log('🔵 === INICIANDO FIX DE SCHEMA ===');

    // Paso 1: Verificar estructura actual
    console.log('\n📋 Paso 1: Verificar estructura de TblPartido');
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TblPartido' AND TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );
    
    console.log('Columnas actuales:', columns);

    // Paso 2: Verificar si puntos_individuales existe
    const puntoColumnExists = (columns as any[]).some(col => col.COLUMN_NAME === 'puntos_individuales');
    console.log(`\npuntos_individuales existe: ${puntoColumnExists}`);

    // Paso 3: Si no existe, agregarlo
    if (!puntoColumnExists) {
      console.log('\n🔧 Paso 3: Agregando columna puntos_individuales');
      try {
        await connection.query(
          `ALTER TABLE TblPartido ADD COLUMN puntos_individuales INT NULL DEFAULT NULL AFTER goles_equipo2`
        );
        console.log('✅ Columna agregada exitosamente');
      } catch (alterError: any) {
        // Si ya existe, ignorar el error
        if (alterError.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️ Columna ya existe (error ignorado)');
        } else {
          throw alterError;
        }
      }
    } else {
      console.log('✅ Columna ya existe, no es necesario agregarla');
    }

    // Paso 4: Verificar estructura final
    console.log('\n📋 Paso 4: Verificar estructura final');
    const [finalColumns] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TblPartido' AND TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );
    
    console.log('Columnas finales:', finalColumns);

    return NextResponse.json({
      success: true,
      message: 'Schema fijo correctamente',
      columnasIniciales: columns,
      columnasFinales: finalColumns,
      puntoColumnAgregada: !puntoColumnExists,
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
