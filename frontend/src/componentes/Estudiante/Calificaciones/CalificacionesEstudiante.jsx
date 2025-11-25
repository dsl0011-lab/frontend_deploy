import React, { useState, useEffect } from 'react';
import axios from "axios";
import { API_BASE } from '../../Authorization/scripts/Security';

const CalificacionesEstudiante = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('calificaciones');
  const [cursoSeleccionado, setCursoSeleccionado] = useState('todos');

  useEffect(() => {
    cargarDatos();
  }, []);


  const cargarDatos = async () => {
    try {
      setLoading(true);
      const config = {
        withCredentials: true,
      };

      const respCalif = await axios.get(
        (`${API_BASE}/api/calificaciones/notas/`),
        config
      );
      setCalificaciones(respCalif.data);

      const respEstad = await axios.get(
        `${API_BASE}/api/calificaciones/notas/estadisticas/`,
        config
      );
      setEstadisticas(respEstad.data);
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerColorNota = (nota) => {
    if (nota < 5) return 'text-red-600 bg-red-50';
    if (nota < 6) return 'text-orange-600 bg-orange-50';
    if (nota < 7) return 'text-yellow-600 bg-yellow-50';
    if (nota < 9) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const obtenerIconoTipo = (tipo) => {
    const iconos = {
      'EXAMEN': '📝',
      'PROYECTO': '📊',
      'PRACTICA': '💻',
      'PARTICIPACION': '🙋'
    };
    return iconos[tipo] || '📄';
  };

  const calificacionesFiltradas = cursoSeleccionado === 'todos'
    ? calificaciones
    : calificaciones.filter(c => c.curso === parseInt(cursoSeleccionado));

  const cursosUnicos = [...new Set(calificaciones.map(c => c.curso))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Mis Calificaciones</h1>
        <p className="text-gray-400">Consulta tus notas y estadísticas académicas</p>
      </div>

      <div className="flex space-x-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setVistaActual('calificaciones')}
          className={`px-4 py-2 font-medium transition-colors ${
            vistaActual === 'calificaciones'
              ? 'border-b-2 border-blue-600 text-blue-400'
              : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          📚 Calificaciones
        </button>
        <button
          onClick={() => setVistaActual('estadisticas')}
          className={`px-4 py-2 font-medium transition-colors ${
            vistaActual === 'estadisticas'
              ? 'border-b-2 border-blue-600 text-blue-400'
              : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          📊 Estadísticas
        </button>
      </div>

      {vistaActual === 'calificaciones' && (
        <div>
          <div className="mb-4">
            <select
              value={cursoSeleccionado}
              onChange={(e) => setCursoSeleccionado(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los cursos</option>
              {cursosUnicos.map(cursoId => {
                const calif = calificaciones.find(c => c.curso === cursoId);
                return (
                  <option key={cursoId} value={cursoId}>
                    {calif?.curso_nombre}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Evaluación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Calificación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {calificacionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No hay calificaciones registradas
                      </td>
                    </tr>
                  ) : (
                    calificacionesFiltradas.map((calif) => (
                      <tr key={calif.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">
                              {obtenerIconoTipo(calif.tipo_evaluacion)}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {calif.nombre_evaluacion}
                              </div>
                              <div className="text-xs text-gray-400">
                                {calif.tipo_evaluacion}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {calif.curso_nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(calif.fecha_evaluacion).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-lg font-bold ${obtenerColorNota(calif.nota)}`}>
                            {calif.nota}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerColorNota(calif.nota)}`}>
                            {calif.calificacion_texto}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {vistaActual === 'estadisticas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estadisticas.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              No hay estadísticas disponibles. Necesitas tener calificaciones registradas.
            </div>
          ) : (
            estadisticas.map((est) => (
              <div key={est.curso_id} className="bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  {est.curso_nombre}
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Nota Media</span>
                    <span className={`text-3xl font-bold ${obtenerColorNota(est.media_calificaciones)}`}>
                      {est.media_calificaciones}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        est.media_calificaciones >= 9 ? 'bg-green-500' :
                        est.media_calificaciones >= 7 ? 'bg-blue-500' :
                        est.media_calificaciones >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(est.media_calificaciones / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Asistencia</span>
                    <span className={`text-xl font-bold ${
                      est.porcentaje_asistencia >= 80 ? 'text-green-400' :
                      est.porcentaje_asistencia >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {est.porcentaje_asistencia}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        est.porcentaje_asistencia >= 80 ? 'bg-green-500' :
                        est.porcentaje_asistencia >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${est.porcentaje_asistencia}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CalificacionesEstudiante;