import { useCallback, useContext, useEffect, useState } from "react";
import { LoadingContext } from "../useContext/LoadingContext";
import HelpElement from "./HelpElement";
import { UsuarioContext } from "../useContext/UsuarioContext";


const Login = ({ setFlipped, funcUsuario }) => {
    //cambiar URL del endpoint en cuestion
    const URL = "http://localhost:8000/api/auth/token/"
    const { setLoading } = useContext(LoadingContext)
    const [error, setError] = useState(false)
    const [help, setHelp] = useState(false)
    const [form, setForm] = useState({
        username: "",
        password: ""
    })
    const [datosRecordados, setDatosRecordados] = useState(null)
    const [ usuarioRecordado ] = useState(localStorage.getItem("usuarioGuardado") || null)
    const { usuario } = useContext(UsuarioContext);


useEffect(() => {
    if(usuarioRecordado){
        const usuario = localStorage.getItem("usuarioGuardado")
        const usuarioObj = JSON.parse(usuario) 
        const inicioAutomatico = async()=>{
            if(usuarioObj === null) return
            try {
                const res = await fetch(URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify(usuarioObj)
                });
                const data = await res.json()
                funcUsuario(data)
            } catch (e) {
                console.error("Error al iniciar sesión:", e);
                return false;
            }
        }
        inicioAutomatico()
    }
}, [funcUsuario, usuarioRecordado, usuario])


    const saveForm = useCallback((e) => {
        e.preventDefault();
        setForm({
            username: e.target.usernameR.value,
            password: e.target.passwordL.value,
        })
        if(datosRecordados){
            localStorage.setItem("usuarioGuardado", JSON.stringify({
                username: e.target.usernameR.value,
                password: e.target.passwordL.value,
            }))
        }else if(!datosRecordados){
            localStorage.removeItem("usuarioGuardado")
        }
    }, [datosRecordados])



    useEffect(() => {
        if (form.username !== "" && form.password !== "") {
            const sendForm = async () => {
                try {
                    console.log(form)
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


    const btnRecuerdame = () =>{
        setDatosRecordados(prev =>!prev)
    }

    return (
        <>
            <div className="w-full h-full relative">
                <h1 className="text-2xl font-bold w-full h-fit leading-tight tracking-tight dark:text-white p-2">Inicio de Sesión</h1>
                {error !== false && <p className="text-white pl-2 pr-2">Ha ocurrido un error, vuelve a intentarlo más tarde.</p>}
                <form onSubmit={(e) => saveForm(e)} className="w-full h-full flex flex-col items-center justify-start pt-4 gap-6 text-sm sm:text-base">
                    <input type="text" name="usernameR" id="usernameR" placeholder="Ingresa nick/username" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 sm:max-w-96 h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                    <input type="password" name="passwordL" id="passwordL" placeholder="Ingresa tu contraseña" autoComplete="off" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 sm:max-w-96 h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    onFocus={() => setHelp(true)} onBlur={() => setHelp(false)} pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).+$" minLength={8} maxLength={30} required />
                    {/* Inicio de sesión con JWT */}
                    {/* colocar un onclick con savePassword */}
                    <label className="relative inline-flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" className="sr-only peer" id="recordar" />
                        <span className="w-11 h-6 bg-zinc-500 rounded-full peer-checked:bg-sky-600 
                        peer-checked:after:translate-x-full after:content-[''] after:absolute 
                        after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                        after:h-5 after:w-5 after:transition-all" onClick={() => btnRecuerdame()}></span>
                        <p className="text-white" onClick={() => btnRecuerdame()}>Recordar datos</p>
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
