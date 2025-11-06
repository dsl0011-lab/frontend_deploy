import { Routes, Route } from 'react-router-dom';
// src/componentes/useContext/AppContent.jsx
import { useContext } from 'react';
import { UsuarioContext } from './UsuarioContext';
import Dashboard from '../Dashboard/Dashboard';
import PrivateRoute from '../Authorization/PrivateRoute';
import ProfileCard from '../Dashboard/ProfileCard';

// --- Profesor ---
import RequireRole from '../Profesor/RequireRole';
import LayoutProfesor from '../Profesor/LayoutProfesor';
import CursosPage from '../Profesor/CursosPage';
import CursoDetallePage from '../Profesor/CursoDetallePage';
import TareasPage from '../Profesor/TareasPage';
import CalificacionesPage from '../Profesor/CalificacionesPage';

// --- Estudiante ---
import LayoutEstudiante from '../Estudiante/LayoutEstudiante';
import RequireRoleStudent from '../Estudiante/RequireRoleEstudiante';
import CursosPageStudent from '../Estudiante/CursosPageEstudiante';
import CursoDetallePageEstudiante from '../Estudiante/CursoDetallePageEstudiante';
import TareasEstudiante from '../Estudiante/TareasEstudiante';

function AppContent() {

  const { usuario } = useContext(UsuarioContext)

  return (
    <>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path='/' element={<Dashboard />}>
            <Route path='perfil' element={<ProfileCard />} />
            {/* ruta para mostra el componente profesor */}
            <Route
              path="profesor"
              element={
                <RequireRole role="T" user={usuario}>
                  <LayoutProfesor />
                </RequireRole>
              }
            >
              <Route index element={<CursosPage />} />
              <Route path="cursos/:id" element={<CursoDetallePage />} />
              <Route path="tareas" element={<TareasPage />} />
              <Route path="calificaciones" element={<CalificacionesPage />} />
            </Route>
            {/* ruta para mostrar el componente estudiante */}
            <Route
            path='estudiante'
            element={
              <RequireRoleStudent role="S" user={usuario}>
                <LayoutEstudiante />
              </RequireRoleStudent>
            }
            >
              <Route index element={<CursosPageStudent />} />
              <Route path="cursos/:id" element={<CursoDetallePageEstudiante />} />
              <Route path='tareas' element={<TareasEstudiante />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  )
}
export default AppContent

