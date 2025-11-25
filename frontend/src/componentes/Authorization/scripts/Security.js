//cierra la sesion eliminando el token valido de la cookie HTTP actual del usuario loggeado 
const API_BASE = "http://localhost:8000/"


const Logout = () => {
    localStorage.removeItem("usuarioGuardado")
    let cookie = document.cookie
    cookie = cookie.split(";").flat().find(item => item.startsWith(" recordarDatos"))
    if(!cookie){
        fetch(`${API_BASE}/api/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
        .then(response => response.json())
        .catch(e => console.error("ha ocurrido un error al cerrar sesión", e))
    }
}



async function secureFetch() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/token/refresh_cookie/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        });
        const data = await res.json()
        return data
    } catch (e) {
        console.error("Error al refrescar token:", e);
        return false;
    }
}



export { Logout, secureFetch, API_BASE } 