import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function POST(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Crear tabla tblSubDisciplina
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tblSubDisciplina (
        id INT AUTO_INCREMENT PRIMARY KEY,
        disciplina_id INT NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        activa BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (disciplina_id) REFERENCES TblDisciplina(id) ON DELETE CASCADE,
        UNIQUE KEY unique_disciplina_nombre (disciplina_id, nombre),
        INDEX idx_disciplina (disciplina_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Tabla tblSubDisciplina creada exitosamente');

    // Obtener IDs de disciplinas
    const [disciplinas] = await connection.query(
      `SELECT id, nombre FROM TblDisciplina WHERE nombre IN ('Atletismo', 'Natacion', 'Fulbito', 'Basquetbol')`
    );

    const disciplinasMap = new Map<string, number>();
    if (Array.isArray(disciplinas)) {
      (disciplinas as any[]).forEach((d: any) => {
        disciplinasMap.set(d.nombre.toLowerCase(), d.id);
      });
    }

    console.log('📋 Disciplinas encontradas:', Object.fromEntries(disciplinasMap));

    // Sub-disciplinas por disciplina
    const subDisciplinas = {
      atletismo: [
        '100 metros planos',
        '200 metros planos',
        'Lanzamiento de Bala',
        'Lanzamiento de Disco',
        'Posta 4 x 100',
      ],
      natacion: [
        '25 metros espalda',
        '25 metros pecho',
        '25 metros libre',
        '4 x 25 libre',
      ],
      fulbito: ['Categoría Única'],
      basquetbol: ['Categoría Única'],
    };

    let insertados = 0;
    let duplicados = 0;

    // Insertar sub-disciplinas
    for (const [disciplinaKey, subDisciplinasList] of Object.entries(subDisciplinas)) {
      const disciplinaId = disciplinasMap.get(disciplinaKey);
      
      if (!disciplinaId) {
        console.log(`⚠ Disciplina no encontrada: ${disciplinaKey}`);
        continue;
      }

      for (const subDisciplina of subDisciplinasList) {
        try {
          await connection.query(
            `INSERT INTO tblSubDisciplina (disciplina_id, nombre) VALUES (?, ?)`,
            [disciplinaId, subDisciplina]
          );
          insertados++;
          console.log(`✓ Sub-disciplina insertada: ${subDisciplina} (Disciplina: ${disciplinaKey})`);
        } catch (error: any) {
          if (error.code === 'ER_DUP_ENTRY') {
            duplicados++;
            console.log(`⚠ Sub-disciplina duplicada: ${subDisciplina}`);
          } else {
            throw error;
          }
        }
      }
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      message: `Tabla tblSubDisciplina creada. ${insertados} sub-disciplinas insertadas, ${duplicados} duplicadas.`,
      insertados,
      duplicados,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear tabla de sub-disciplinas' 
      },
      { status: 500 }
    );
  }
}
