import { secureFetch } from "../Authorization/scripts/Security";
import { apiFetch } from "../Profesor/api";

export async function createTutoriaEstudiante(payload) {
    const url = "/estudiante/tutoria/"
    const res = apiFetch("/estudiante/tutoria/", {
        method: "POST",
        body: payload,
    });
    if (res.status === 401) {
        const refreshed = await secureFetch();
        if (refreshed) {
            return apiFetch(url); // reintento una sola vez
        }
    }
    return res
}