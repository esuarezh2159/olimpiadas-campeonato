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

    console.log('🔵 Verificando/creando tabla TblPartidoSubDisciplina...');

    // Simplemente intentar crear la tabla sin verificar
    try {
      await connection.query(`
        CREATE TABLE tblPartidoSubDisciplina (
          id INT AUTO_INCREMENT PRIMARY KEY,
          partido_id INT NOT NULL,
          subdisciplina_id INT NOT NULL,
          puntos INT NOT NULL DEFAULT 0,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (partido_id) REFERENCES TblPartido(id) ON DELETE CASCADE,
          FOREIGN KEY (subdisciplina_id) REFERENCES tblSubDisciplina(id) ON DELETE CASCADE,
          UNIQUE KEY unique_partido_subdisciplina (partido_id, subdisciplina_id)
        )
      `);
      
      console.log('✅ Tabla tblPartidoSubDisciplina creada');
    } catch (createError: any) {
      // Si ya existe, ignorar
      if (createError.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('✅ Tabla tblPartidoSubDisciplina ya existe');
      } else {
        throw createError;
      }
    }

    // Verificar que la tabla existe
    const [tableInfo] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tblPartidoSubDisciplina'`,
      [process.env.DB_NAME]
    );

    if (Array.isArray(tableInfo) && tableInfo.length > 0) {
      console.log('✅ Tabla verificada: tblPartidoSubDisciplina existe');
      return NextResponse.json({
        success: true,
        message: 'Tabla tblPartidoSubDisciplina está lista',
        tableExists: true,
      });
    } else {
      throw new Error('No se pudo crear/verificar tblPartidoSubDisciplina');
    }
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
