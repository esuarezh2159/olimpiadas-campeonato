import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario, password, nombre_completo, email, rol, createdByUserId } = body;

    // Validar campos requeridos
    if (!usuario || !password || !nombre_completo || !email || !rol) {
      return NextResponse.json(
        { error: 'Todos los campos (usuario, password, nombre_completo, email, rol) son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el rol sea válido
    const validRoles = ['admin', 'viewer'];
    if (!validRoles.includes(rol)) {
      return NextResponse.json(
        { error: `El rol debe ser uno de: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await query(
      'SELECT id FROM usuarios WHERE usuario = ?',
      [usuario]
    ) as any[];

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    // Crear nuevo usuario
    const results = await query(
      'INSERT INTO usuarios (usuario, contraseña, nombre_completo, email, rol, activo, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [usuario, password, nombre_completo, email, rol, true]
    ) as any;

    if (!results.insertId) {
      throw new Error('No se pudo crear el usuario');
    }

    // Retornar el usuario creado (sin contraseña)
    return NextResponse.json({
      success: true,
      user: {
        id: results.insertId,
        usuario,
        nombre_completo,
        email,
        rol,
        activo: true,
      },
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
