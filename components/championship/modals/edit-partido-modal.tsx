'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditPartidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partido: any;
  equipos: any[];
  onSave: (updatedPartido: any) => Promise<void>;
  onDelete: (partidoId: number) => Promise<void>;
}

export function EditPartidoModal({
  isOpen,
  onClose,
  partido,
  equipos,
  onSave,
  onDelete,
}: EditPartidoModalProps) {
  const [equipo1Id, setEquipo1Id] = useState<string>('');
  const [equipo2Id, setEquipo2Id] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchEquipo1, setSearchEquipo1] = useState('');
  const [searchEquipo2, setSearchEquipo2] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  useEffect(() => {
    if (partido) {
      setEquipo1Id(String(partido.equipo1_id));
      setEquipo2Id(String(partido.equipo2_id));
      setError('');
    }
  }, [partido]);

  const handleSave = async () => {
    if (!equipo1Id || !equipo2Id) {
      setError('Ambos equipos son requeridos');
      return;
    }

    if (equipo1Id === equipo2Id && partido.tipo_competicion === 'vs') {
      setError('No puedes asignar el mismo equipo para ambos lados');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...partido,
        equipo1_id: parseInt(equipo1Id),
        equipo2_id: parseInt(equipo2Id),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(partido.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  // Debug: Log para verificar equipos
  useEffect(() => {
    console.log('📍 EditPartidoModal - Equipos recibidos:', equipos);
    console.log('📍 Equipo1Id:', equipo1Id, 'Equipo2Id:', equipo2Id);
  }, [equipos, equipo1Id, equipo2Id]);

  // Filtrar equipos válidos (que tengan id y nombre)
  const equiposValidos = equipos.filter(e => e && e.id && e.nombre);

  const equiposFiltrados1 = equiposValidos.filter(e => 
    (e.nombre || '').toLowerCase().includes(searchEquipo1.toLowerCase())
  );

  const equiposFiltrados2 = equiposValidos.filter(e => 
    (e.nombre || '').toLowerCase().includes(searchEquipo2.toLowerCase())
  );

  const equipo1Nombre = equiposValidos.find(e => e.id === parseInt(equipo1Id))?.nombre || '';
  const equipo2Nombre = equiposValidos.find(e => e.id === parseInt(equipo2Id))?.nombre || '';

  if (!partido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">⚽ Editar Matchup del Partido</DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto space-y-6 pr-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showDeleteConfirm ? (
            <div className="space-y-6 py-8 text-center">
              <p className="text-lg font-semibold text-slate-900">
                ¿Eliminar este partido?
              </p>
              <p className="text-3xl font-bold">
                <span className="text-slate-700">{partido.equipo1_nombre}</span>
                <span className="text-slate-400 mx-3">vs</span>
                <span className="text-slate-700">{partido.equipo2_nombre}</span>
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
                <p>⚠️ Esta acción no se puede deshacer</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Eliminando...' : '🗑️ Eliminar'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Información del Partido */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">📋 Información</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 text-xs">Disciplina</p>
                    <p className="font-semibold text-slate-900">{partido.disciplina_nombre}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Serie</p>
                    <p className="font-semibold text-slate-900">{partido.serie_nombre}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Fecha</p>
                    <p className="font-semibold text-slate-900">{partido.fecha_nombre}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Horario</p>
                    <p className="font-semibold text-slate-900">{partido.horario_inicio}</p>
                  </div>
                </div>
              </div>

              {/* Selección de Equipos */}
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200 space-y-6">
                <h3 className="font-semibold text-slate-900 text-center text-lg">
                  Seleccionar Equipos
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  {/* Equipo 1 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Equipo 1</Label>
                    <div className="relative z-50">
                      <input
                        type="text"
                        placeholder="Buscar equipo..."
                        value={searchEquipo1}
                        onChange={(e) => {
                          setSearchEquipo1(e.target.value);
                          setShowDropdown1(true);
                        }}
                        onFocus={() => setShowDropdown1(true)}
                        onBlur={() => {
                          // Delay para permitir que se registre el click en el dropdown
                          setTimeout(() => setShowDropdown1(false), 200);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showDropdown1 && equipos.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-md mt-1 z-50 shadow-lg max-h-48 overflow-y-auto">
                          {equiposFiltrados1.length > 0 ? (
                            equiposFiltrados1.map(eq => (
                              <button
                                key={eq.id}
                                type="button"
                                onClick={() => {
                                  setEquipo1Id(String(eq.id));
                                  setSearchEquipo1('');
                                  setShowDropdown1(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-blue-100 text-sm border-b border-slate-100 last:border-b-0 cursor-pointer"
                              >
                                {eq.nombre}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-slate-500 text-sm">
                              No hay equipos
                            </div>
                          )}
                        </div>
                      )}
                      {equipo1Id && equipo1Nombre && (
                        <div className="mt-2 bg-white rounded p-3 border-2 border-blue-300">
                          <p className="text-xs text-slate-600">Seleccionado</p>
                          <p className="font-bold text-blue-600">{equipo1Nombre}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Equipo 2 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Equipo 2</Label>
                    <div className="relative z-50">
                      <input
                        type="text"
                        placeholder="Buscar equipo..."
                        value={searchEquipo2}
                        onChange={(e) => {
                          setSearchEquipo2(e.target.value);
                          setShowDropdown2(true);
                        }}
                        onFocus={() => setShowDropdown2(true)}
                        onBlur={() => {
                          // Delay para permitir que se registre el click en el dropdown
                          setTimeout(() => setShowDropdown2(false), 200);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showDropdown2 && equipos.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-md mt-1 z-50 shadow-lg max-h-48 overflow-y-auto">
                          {equiposFiltrados2.length > 0 ? (
                            equiposFiltrados2.map(eq => (
                              <button
                                key={eq.id}
                                type="button"
                                onClick={() => {
                                  setEquipo2Id(String(eq.id));
                                  setSearchEquipo2('');
                                  setShowDropdown2(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-blue-100 text-sm border-b border-slate-100 last:border-b-0 cursor-pointer"
                              >
                                {eq.nombre}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-slate-500 text-sm">
                              No hay equipos
                            </div>
                          )}
                        </div>
                      )}
                      {equipo2Id && equipo2Nombre && (
                        <div className="mt-2 bg-white rounded p-3 border-2 border-blue-300">
                          <p className="text-xs text-slate-600">Seleccionado</p>
                          <p className="font-bold text-blue-600">{equipo2Nombre}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {equipo1Id && equipo2Id && (
                  <div className="pt-6 border-t-2 border-blue-200 text-center">
                    <p className="text-xs text-slate-600 mb-2">Preview del Partido</p>
                    <p className="text-2xl font-bold">
                      <span className="text-blue-600">{equipo1Nombre}</span>
                      <span className="text-slate-400 mx-3">vs</span>
                      <span className="text-blue-600">{equipo2Nombre}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  🗑️ Eliminar
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !equipo1Id || !equipo2Id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Guardando...' : '✓ Guardar'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
