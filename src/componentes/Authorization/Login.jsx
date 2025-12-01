import { useCallback, useContext, useEffect, useState } from "react";
import { LoadingContext } from "../useContext/LoadingContext";
import HelpElement from "./HelpElement";
import { UsuarioContext } from "../useContext/UsuarioContext";
import { API_BASE } from "./scripts/Security";
import eye from '../../assets/img-eye.svg'
import closedEye from '../../assets/closedEye.svg'

const Login = ({ setFlipped, funcUsuario, setError, error, setRequestFinalizada}) => {
    //cambiar URL del endpoint en cuestion
    const URL = `${API_BASE}api/auth/token/`
    const [errorDescripcion, setErrorDescripcion] = useState([])
    const [help, setHelp] = useState(false)
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [form, setForm] = useState({
        username: "",
        password: ""
    })
    
    const [datosRecordados, setDatosRecordados] = useState(null)
    const [usuarioRecordado] = useState(localStorage.getItem("usuarioGuardado") || null)
    const { usuario } = useContext(UsuarioContext);


    useEffect(() => {
        if (usuarioRecordado) {
            const usuario = localStorage.getItem("usuarioGuardado")
            const usuarioObj = JSON.parse(usuario)
            const inicioAutomatico = async () => {
                if (usuarioObj === null) return
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
                } finally {
                    setRequestFinalizada(true)
                }
            }
            inicioAutomatico()
        }
    }, [funcUsuario, usuarioRecordado, usuario, setRequestFinalizada, URL])


    const saveForm = useCallback((e) => {
        e.preventDefault();
        setForm({
            username: e.target.usernameR.value,
            password: e.target.passwordL.value,
        })
        if (datosRecordados) {
            localStorage.setItem("usuarioGuardado", JSON.stringify({
                username: e.target.usernameR.value,
                password: e.target.passwordL.value,
            }))
        } else if (!datosRecordados) {
            localStorage.removeItem("usuarioGuardado")
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
                    const data = await datosEnviados.json()
                    if (!datosEnviados.ok || data?.ok === false) {
                        // Normalizamos errores para renderizar
                        const errores = Object.values(data)
                            .flat()
                            .map(err => typeof err === "string" ? err : JSON.stringify(err));
                        setError(true);
                        setErrorDescripcion(errores);
                    } else {
                        funcUsuario(data)
                    }
                } catch (e) {
                    const errores = Object.values(e)
                        .flat()
                        .map(err => typeof err === "string" ? err : JSON.stringify(err));
                    setErrorDescripcion(errores)
                    setError(true)
                } finally {
                    setRequestFinalizada(true)
                }
            }
            sendForm();
        }
    }, [form, funcUsuario, setRequestFinalizada, URL, setError])



    const btnRecuerdame = () => {
        setDatosRecordados(prev => !prev)
    }

    return (
        <>
            <div className="w-full h-full relative" onClick={() => setError(false)}>
                <h1 className="text-2xl font-bold w-full h-fit leading-tight tracking-tight dark:text-white p-2">Inicio de Sesión</h1>
                    {error && (
                        <div className="absolute p-2 rounded-lg bg-red-800 top-10 m-2 text-white pl-2 pr-2">
                            {errorDescripcion.map((err, i) => <p key={i}>{err}</p>)}
                        </div>
                    )}
                <form onSubmit={(e) => {saveForm(e) }} className="w-full h-full flex flex-col items-center justify-center p-2 md:gap-2 gap-6 text-sm sm:text-base">
                    <div className="flex items-center justify-center w-full max-w-96 h-fit">
                        <input type="text" name="usernameR" id="usernameR" placeholder="Ingresa usuario" className="w-full max-h-16 text-white bg-gray-50 border border-gray-300 rounded-2xl h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                    </div>
                    <div className="relative flex items-center justify-center w-full max-w-96 h-fit">
                        <input
                            type={mostrarPassword ? "text" : "password"} placeholder="Ingresa tu contraseña" name="passwrodL" id="passwordL" onMouseOver={()=>setHelp(prev=>!prev)} onMouseOut={()=>setHelp(prev=>!prev)}
                            className="w-full  max-h-16 text-white bg-gray-50 border border-gray-300 rounded-2xl h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        />
                        <button type="button" onClick={() => setMostrarPassword(prev => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {mostrarPassword
                                ? <img className='w-4 h-4 opacity-95' src={eye} alt="ojo" />
                                : <img className='w-4 h-4' src={closedEye} alt="ojo cerrado" />}
                        </button>
                    </div>

                    {/* Inicio de sesión con JWT */}
                    {/* colocar un onclick con savePassword */}
                    <label className="flex-2 relative inline-flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" className="sr-only peer" id="recordar" />
                        <span className="w-11 h-6 bg-zinc-500 rounded-full peer-checked:bg-sky-600 
                        peer-checked:after:translate-x-full after:content-[''] after:absolute 
                        after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                        after:h-5 after:w-5 after:transition-all" onClick={() => btnRecuerdame()}></span>
                        <p className="text-white" onClick={() => btnRecuerdame()}>Recordar datos</p>
                    </label>
                    <div className="flex-2 flex justify-center items-center flex-col w-fit h-fit p-1 sm:p-4 gap-3">
                        <button type="submit" onClick={()=>setRequestFinalizada(false)} className="w-full max-w-60 h-fit max-h-24 p-1.5 sm:p-2.5 rounded-2xl text-white bg-gray-900 hover:bg-slate-800 text-center">Iniciar sesión</button>
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
