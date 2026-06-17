import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Obtener lista de usuarios (sin incluir contraseñas)
    const results = await query(
      'SELECT id, usuario, nombre_completo, email, rol, activo, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC',
      []
    ) as any[];

    return NextResponse.json({
      success: true,
      data: results || [],
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
