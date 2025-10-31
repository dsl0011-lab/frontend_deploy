//cierra la sesion eliminando el token valido de la cookie HTTP actual del usuario loggeado 
const Logout = () => {
    fetch("http://localhost:8000/api/auth/logout",{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        credentials: "include",
    })
    .then(response => response.json())
    // .then(data => console.log(data))
    .catch(e => console.error("ha ocurrido un error al cerrar sesión", e))
}


const API_BASE = "http://localhost:8000/api"

async function secureFetch(options = {}) {
    const opts = {
        ...options,
        credentials: "include", // <- MUY IMPORTANTE para enviar cookies HttpOnly
        headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        },
    };
    try {
        // Primera petición con el token actual
        const response = await fetch(`${API_BASE}/auth/token/verify_cookie/`, opts);
        // Si la respuesta es OK, devuélvela
        if (response.ok) {
        return response;
        }
        // Si el token expiró o no es válido, intentamos refrescarlo
        if (response.status === 401) {
        console.warn("Token expirado, intentando refrescar...");
        const refreshResponse = await fetch(`${API_BASE}/auth/token/refresh_cookie/`, {
            method: "POST",
            credentials: "include",
        });
        if (refreshResponse.ok) {
            console.log("✅ Token renovado, reintentando petición original...");
            // Repetimos la petición original tras renovar el token
            const retryResponse = await fetch(`${API_BASE}auth/token/verify_cookie/`, opts);
            return retryResponse;
        } else {
            console.error("No se pudo refrescar el token, cerrando sesión...");
            throw new Error("Sesion expirada");
        }
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    } catch (err) {
        console.error("Error en secureFetch:", err);
        throw err;
    }
}

export {Logout, secureFetch } 