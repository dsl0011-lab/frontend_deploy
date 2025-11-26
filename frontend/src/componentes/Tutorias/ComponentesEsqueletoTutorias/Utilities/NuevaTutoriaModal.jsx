import { useContext, useEffect, useState } from "react";
import { getAlumnosCurso } from "../../../Profesor/api";
import ComponentesTutoriaModal from "./ComponentesTutoriaModal";
import { UsuarioContext } from "../../../useContext/UsuarioContext";

const estadosBase = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

const initialForm = {
  alumnoUsername: "",
  alumnoId: "",
  profesor: "",
  cursoId: "",
  asignaturaManual: "",
  fecha: "",
  notas: "",
  estado: "pendiente",
};

export default function NuevaTutoriaModal({ onSave, onClose, cursos = [] }) {
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [errorAlumnos, setErrorAlumnos] = useState("");
  const { usuario } = useContext(UsuarioContext);

  // Para profesores, las tutorías nuevas deben salir directamente como "confirmada"
  useEffect(() => {
    if (usuario?.role === "T") {
      setForm((prev) => ({ ...prev, estado: "confirmada" }));
    }
  }, [usuario]);


  useEffect(() => {
    if (usuario?.role === "T") {
      if (!form?.cursoId) {
        setForm((prev) => ({ ...prev, alumnoId: "" }));
        return;
      }
      let alive = true;
      setLoadingAlumnos(true);
      setErrorAlumnos("");
      getAlumnosCurso(form.cursoId)
        .then((data) => {
          if (!alive) return;
          setAlumnos(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (!alive) return;
          setAlumnos([]);
          setErrorAlumnos(err.message || "No se pudieron cargar los alumnos");
        })
        .finally(() => alive && setLoadingAlumnos(false));
      return () => {
        alive = false;
      };
    } else if (usuario?.role === "S") {

      if (!form?.cursoId) {
        setAlumnos([]);
        setForm((prev) => ({ ...prev, alumnoId: "" }));
        return;
      }
    }

  }, [form?.cursoId, usuario]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "cursoId") {
      setForm((prev) => ({
        ...prev,
        cursoId: value,
        alumnoId: "",
        alumnoUsername: "",
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const asignaturaSeleccionada =
    cursos.find((c) => String(c.id) === form.cursoId)?.nombre || form.asignaturaManual.trim();
    const alumnoUsernameClean = form.alumnoUsername.trim();
    const fechaIso = new Date(form.fecha).toISOString();
    

  if (!asignaturaSeleccionada || !form.fecha) {
      return;
    }

    if(usuario?.role === "T"){
      onSave({
        alumnoId: form.alumnoId ? Number(form.alumnoId) : undefined,
        alumnoUsername: alumnoUsernameClean,
        asignatura: asignaturaSeleccionada,
        fecha: fechaIso,
        estado: form.estado,
        notas: form.notas.trim(),
      })
    }else if(usuario?.role === "S"){
      onSave({
        profesor: form.profesor ? Number(form.profesor) : undefined,
        asignatura: asignaturaSeleccionada,
        fecha: fechaIso,
        estado: form.estado,
        notas: form.notas.trim(),
      })
    }
    setForm(initialForm);
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Nueva tutoria</h2>
        {/* aqui se maneja la logica del formulario para solicitar una nueva tutoria */}
        <ComponentesTutoriaModal
          form={form}
          cursos={cursos}
          alumnos={alumnos}
          loadingAlumnos={loadingAlumnos}
          errorAlumnos={errorAlumnos}
          estados={
            usuario?.role === "T"
              ? estadosBase.filter((e) => e.value === "confirmada")
              : estadosBase
          }
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onClose={onClose}
          usuario={usuario}
        />
      </div>
    </div>
  );
}
