//cierra la sesion eliminando el token valido de la cookie HTTP actual del usuario loggeado 
const Logout = () => {
    fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    })
        .then(response => response.json())
        .catch(e => console.error("ha ocurrido un error al cerrar sesión", e))
}


const API_BASE = "http://localhost:8000/api"

async function secureFetch() {
    try {
        const res = await fetch(`${API_BASE}/auth/token/refresh_cookie/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        });
        return res.ok; // true si refrescó correctamente
    } catch (e) {
        console.error("Error al refrescar token:", e);
        return false;
    }
}


export { Logout, secureFetch } 