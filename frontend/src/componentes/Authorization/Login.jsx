import { useCallback, useContext, useEffect, useState } from "react";
import { LoadingContext } from "../useContext/LoadingContext";
import HelpElement from "./HelpElement";
import { cookieGuardarDatos, encontrarCookieDatosGuardados } from "./scripts/Security";
import { UsuarioContext } from "../useContext/UsuarioContext";


const Login = ({ setFlipped, funcUsuario }) => {
    //cambiar URL del endpoint en cuestion
    const URL = "http://localhost:8000/api/auth/token/"
    const automatico_inicio_url = "http://localhost:8000/api/auth/inicioAutomatico" 
    const { setLoading } = useContext(LoadingContext)
    const [error, setError] = useState(false)
    const [help, setHelp] = useState(false)
    const [form, setForm] = useState({
        username: "",
        password: ""
    })
    const [datosRecordados, setDatosRecordados] = useState(null)
    const { setUsuario } = useContext(UsuarioContext);

    const recordarDatos = () => {
        if (datosRecordados === null) {
            setDatosRecordados(true)
        } else {
            setDatosRecordados(prev => !prev)
        }
    }


    useEffect(() => {
        if (datosRecordados === null) return
        cookieGuardarDatos(datosRecordados)
    }, [datosRecordados])


    useEffect(() => {
        let cookie = encontrarCookieDatosGuardados()
        if (cookie) {
            async function inicioAutomatico() {
                try {
                    const res = await fetch(automatico_inicio_url, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                    });
                    const data = await res.json()
                    console.log("dentro de loggin",data.usuario)
                    funcUsuario(data.usuario)
                } catch (e) {
                    console.error("Error al iniciar sesión:", e);
                    return false;
                }
            }
            inicioAutomatico()
        }
    }, [setUsuario, funcUsuario])


    const saveForm = useCallback((e) => {
        e.preventDefault();
        if (datosRecordados) {
            setForm({
                username: e.target.usernameR.value,
                password: e.target.passwordL.value,
                recordar: true
            })
        } else if (!datosRecordados) {
            setForm({
                username: e.target.usernameR.value,
                password: e.target.passwordL.value
            })
        }
    }, [datosRecordados])

    useEffect(() => {
        if (form.username !== "" && form.password !== "") {
            const sendForm = async () => {
                try {
                    const datosEnviados = await fetch(URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: 'include',
                        body: JSON.stringify(form)
                    });
                    setLoading(true)
                    const data = await datosEnviados.json().catch(() => null)
                    if (!datosEnviados.ok) return setError(true)
                    if (data) return funcUsuario(data)
                } catch {
                    setError(true)
                } finally {
                    setLoading(false)
                }
            }
            sendForm();
        }
    }, [form, funcUsuario, setLoading])

    return (
        <>
            <div className="w-full h-full relative">
                <h1 className="text-2xl font-bold w-full h-fit leading-tight tracking-tight dark:text-white p-2">Inicio de Sesión</h1>
                {error !== false && <p className="text-white pl-2 pr-2">Ha ocurrido un error, vuelve a intentarlo más tarde.</p>}
                <form onSubmit={(e) => saveForm(e)} className="w-full h-full flex flex-col items-center justify-start pt-4 gap-6 text-sm sm:text-base">
                    <input type="text" name="usernameR" id="usernameR" placeholder="Ingresa nick/username" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 sm:max-w-96 h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                    <input type="password" name="passwordL" id="passwordL" placeholder="Ingresa tu contraseña" autoComplete="off" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 sm:max-w-96 h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        onFocus={() => setHelp(true)} onBlur={() => setHelp(false)} pattern={`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}[\\]:;"'<>,.?/~\`]).{8,}$`} title="Debe tener al menos una mayúscula, una minúscula, un número, un carácter especial y mínimo 8 caracteres" required />
                    {/* Inicio de sesión con JWT */}
                    {/* colocar un onclick con savePassword */}
                    <label className="relative inline-flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" className="sr-only peer" id="recordar" />
                        <span className="w-11 h-6 bg-zinc-500 rounded-full peer-checked:bg-sky-600 
                        peer-checked:after:translate-x-full after:content-[''] after:absolute 
                        after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                        after:h-5 after:w-5 after:transition-all" onClick={() => recordarDatos()}></span>
                        <p className="text-white" onClick={() => recordarDatos()}>Recordar datos</p>
                    </label>
                    <div className="flex justify-center items-center flex-col w-fit h-fit p-1 sm:p-4 gap-3">
                        <button type="submit" className="w-full max-w-60 h-fit max-h-24 p-1.5 sm:p-2.5 rounded-2xl text-white bg-gray-900 hover:bg-slate-800 text-center">Iniciar sesión</button>
                        <a href="#" className="w-full max-w-60 text-center text-base font-medium text-primary-600 hover:underline text-white dark:text-primary-500 p-4"
                            onClick={() => setFlipped(true)}>¿No te has registrado aún?
                        </a>
                    </div>
                    {help ? <HelpElement /> : <></>}
                </form>
            </div>
        </>
    )
}
export default Login
