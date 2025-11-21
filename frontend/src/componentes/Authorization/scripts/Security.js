//cierra la sesion eliminando el token valido de la cookie HTTP actual del usuario loggeado 
const API_BASE = "http://localhost:8000/api"



const Logout = () => {
    let cookie = document.cookie
    cookie = cookie.split(";").flat().find(item => item.startsWith(" recordarDatos"))
    if(!cookie){
        fetch("http://localhost:8000/api/auth/logout", {
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
        const res = await fetch(`${API_BASE}/auth/token/refresh_cookie/`, {
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



function encontrarCookieDatosGuardados(){
    let cookie = document.cookie;
    return cookie = cookie.split(";").flat().find(item => item.startsWith(" recordarDatos"));
}



function cookieGuardarDatos(recordarCookie){
    let cookie = encontrarCookieDatosGuardados()
    if(cookie === undefined && recordarCookie){
        document.cookie = `recordarDatos=true;max-age=${60*60*24*365};path=/`
    }else if(cookie !== undefined && !recordarCookie){
        document.cookie = "recordarDatos=;max-age=0;path=/"
    }
}

export { Logout, secureFetch, cookieGuardarDatos, encontrarCookieDatosGuardados } 