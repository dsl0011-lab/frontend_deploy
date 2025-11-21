import { useState } from "react";

const defaultForm = {
  profesor: "",
  alumno: "",
  fecha: "",
  hora: "",
  estado: "Pendiente",
};

export default function TutoriaForm({ onAddTutoria }) {
  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.profesor.trim() || !formData.alumno.trim()) {
      alert("Completa profesor y alumno para guardar la tutoria");
      return;
    }

    onAddTutoria({
      ...formData,
      profesor: formData.profesor.trim(),
      alumno: formData.alumno.trim(),
      estado: formData.estado.trim() || "Pendiente",
    });

    setFormData(defaultForm);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="text"
          name="profesor"
          placeholder="Profesor"
          value={formData.profesor}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="alumno"
          placeholder="Alumno"
          value={formData.alumno}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="time"
          name="hora"
          value={formData.hora}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <select
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          className="border p-2 rounded md:col-span-2"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>
      <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Agregar tutoria
      </button>
    </form>
  );
}
