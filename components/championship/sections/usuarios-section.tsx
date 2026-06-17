'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Usuario {
  id: number;
  usuario: string;
  nombre_completo: string;
  email: string;
  rol: string;
  activo: boolean;
  fecha_creacion: string;
}

export function UsuariosSection() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    nombre_completo: '',
    email: '',
    rol: 'viewer',
  });

  // Cargar usuarios
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      rol: value,
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/usuarios/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear usuario');
        return;
      }

      setSuccessMessage(`Usuario "${formData.usuario}" creado exitosamente`);
      setFormData({
        usuario: '',
        password: '',
        nombre_completo: '',
        email: '',
        rol: 'viewer',
      });
      
      // Recargar lista de usuarios
      fetchUsuarios();
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-600 mt-2">Crea y gestiona usuarios del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de creación */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Crear Nuevo Usuario</CardTitle>
            <CardDescription>Completa el formulario para crear un nuevo usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  name="usuario"
                  placeholder="Ej: juan.lopez"
                  value={formData.usuario}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre_completo">Nombre Completo</Label>
                <Input
                  id="nombre_completo"
                  name="nombre_completo"
                  placeholder="Ej: Juan López García"
                  value={formData.nombre_completo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ej: juan@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Ingresa una contraseña segura"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={handleRoleChange}>
                  <SelectTrigger id="rol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador - Acceso Total</SelectItem>
                    <SelectItem value="viewer">Visualizador - Dashboard y Posiciones</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.rol === 'admin' 
                    ? '✓ Acceso a todas las secciones del sistema'
                    : '✓ Solo puede ver Dashboard y Posiciones'}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Creando usuario...' : 'Crear Usuario'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>Total: {usuarios.length} usuario(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {usuarios.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No hay usuarios registrados</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {usuarios.map(usuario => (
                  <div
                    key={usuario.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{usuario.usuario}</p>
                        <p className="text-sm text-slate-600">{usuario.nombre_completo}</p>
                        <p className="text-xs text-slate-500">{usuario.email}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          usuario.rol === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {usuario.rol === 'admin' ? 'Administrador' : 'Visualizador'}
                        </span>
                        <p className="text-xs text-slate-500 mt-2">
                          {usuario.activo ? '✓ Activo' : '✗ Inactivo'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
