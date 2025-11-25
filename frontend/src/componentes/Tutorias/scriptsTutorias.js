import { secureFetch } from "../Authorization/scripts/Security";
import { apiFetch } from "../Profesor/api";

async function createTutoriaEstudiante(payload) {
    const endpoint = "/estudiante/tutorias/"
    const res = apiFetch(endpoint, {
        method: "POST",
        body: payload,
    });
    if (res.status === 401) {
        const refreshed = await secureFetch();
        if (refreshed) {
            return apiFetch(endpoint); // reintento una sola vez
        }
    }
    return res
}


async function acepta_rechaza_tutoria(payload, id, role_usuario) {
    let endpoint = ""
    if(role_usuario === "S"){
        endpoint = `/estudiante/tutorias/${id}/`
    }else if(role_usuario === "T"){
        endpoint = `/profesor/tutorias/${id}/`
    }
    const res = apiFetch(endpoint, {
        method: "PATCH",
        body: payload,
    });
    if (res.status === 401) {
        const refreshed = await secureFetch();
        if (refreshed) {
            return apiFetch(endpoint); // reintento una sola vez
        }
    }
    return res
}

// solo el profesor necesita un payload
async function eliminarTutoria(id, role_usuario, payload) {
    let endpoint = ""
    if(role_usuario === "S"){
        endpoint = `/estudiante/tutorias/${id}/`
    }else if(role_usuario === "T"){
        endpoint = `/profesor/tutorias/${id}/`
    }
    const res = apiFetch(endpoint, {
        method: "DELETE",
        body: payload
    });
    if (res.status === 401) {
        const refreshed = await secureFetch();
        if (refreshed) {
            return apiFetch(endpoint); // reintento una sola vez
        }
    }
    return res
}


export { createTutoriaEstudiante, acepta_rechaza_tutoria, eliminarTutoria }