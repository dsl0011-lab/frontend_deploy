import { apiFetch } from "../Profesor/api";

export async function listarConversaciones() {
  return apiFetch("/mensajeria/conversaciones/");
}

export async function crearConversacion({ asunto = "", usernames = [], participantes = [] }) {
  return apiFetch("/mensajeria/conversaciones/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ asunto, usernames, participantes }),
  });
}

export async function getMensajes(conversacionId) {
  return apiFetch(`/mensajeria/conversaciones/${conversacionId}/mensajes/`);
}

export async function enviarMensaje(conversacionId, texto) {
  return apiFetch(`/mensajeria/conversaciones/${conversacionId}/mensajes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ texto }),
  });
}

export async function marcarLeidos(conversacionId) {
  return apiFetch(`/mensajeria/conversaciones/${conversacionId}/marcar-leidos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({})
  });
}

export async function getDirectorio() {
  return apiFetch('/mensajeria/directorio/');
}

export async function actualizarConversacion(id, data) {
  return apiFetch(`/mensajeria/conversaciones/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data || {}),
  });
}

export async function eliminarConversacion(id) {
  return apiFetch(`/mensajeria/conversaciones/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
}
