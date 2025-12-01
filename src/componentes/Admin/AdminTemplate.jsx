import React, { useEffect, useState } from 'react'
import { MiniComponenteLoadingFit } from '../PantallaLoading/ComponenteLoading';
import { API_BASE } from "../Authorization/scripts/Security";
import PanelAdmin from './PanelAdmin';
import eye from '../../assets/img-eye.svg'
import closedEye from '../../assets/closedEye.svg'


export default function AdminTemplate() {
    const [error, setError] = useState(false)
    const [errorDescripcion, setErrorDescripcion] = useState([])
    const [requestFinalizada, setRequestFinalizada] = useState(null);
    const [usuarioValidado, setUsuarioValidado] = useState(null);
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const URL = `${API_BASE}api/auth/adminLogin`
    const [form, setForm] = useState(null)

    const saveForm = (e) => {
        e.preventDefault();
        setError(false);
        setErrorDescripcion([]);
        setRequestFinalizada(false);
        setForm({
            username: e.currentTarget.username.value,
            password: e.currentTarget.password.value,
        })
    }


    useEffect(() => {
        if (form !== null && form?.username !== "" && form?.password !== ""){
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
                        setUsuarioValidado(data);
                    }
                } catch (e) {
                    setErrorDescripcion(e.detail)
                    setError(true)
                } finally {
                    setRequestFinalizada(true)
                }
            }
            sendForm();
        }
    }, [URL, form])


    if (usuarioValidado !== null && (errorDescripcion.length === 0 || errorDescripcion === "")) {
        return (
            <div className='w-full h-full'>
                <PanelAdmin usuarioValidado={usuarioValidado} />
            </div>
        )
    }


    return (
        <main className="w-full h-full bg-gray-800 text-white rounded-3xl">
            <section className='w-full h-full flex flex-col p-4'>
                <h1 className='h-fit w-fit self-start lg:text-4xl md:text-2xl text-xl'>Panel Administrador</h1>
                <article className='w-full h-full flex flex-col items-center justify-center pt-4 pb-4 relative'>
                    {/* logica form */}
                    {(error && errorDescripcion.length > 0) && (
                        <div className="absolute p-2 rounded-lg bg-red-800 top-10 m-2 text-white pl-2 pr-2">
                            {errorDescripcion.map((err, i) => <p key={i}>{err}</p>)}
                        </div>
                    )}
                    {((requestFinalizada && requestFinalizada && errorDescripcion.length === 0)) && <MiniComponenteLoadingFit />}
                    <form onSubmit={(e) => saveForm(e)} className='w-full h-full max-w-[600px] xs:h-fit xs:min-h-[400px] mdh:min-h-[250px] border-sky-500 border-2 rounded-2xl flex flex-col items-center justify-center xs:p-12 p-2 pt-8 pb-8 gap-2
                    bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 shadow-lg' onClick={() => setError(false)}>
                        <div className='w-fit min-w-[400px] h-fit flex flex-col gap-8'>
                            <input type="text" placeholder='Ingresa tu usuario' name="username" id='username'
                                className="flex-1 text-white bg-gray-50 border border-gray-300 rounded-2xl w-full h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                            <div className="relative w-full">
                                <input
                                    type={mostrarPassword ? "text" : "password"}
                                    placeholder='Ingresa contraseña admin'
                                    name="password"
                                    id='password'
                                    className="flex-1 text-white bg-gray-50 border border-gray-300 rounded-2xl w-full h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                    required
                                />
                                <button type="button" onClick={() => setMostrarPassword(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                                    {mostrarPassword ? <img className='w-4 h-4 opacity-95' src={eye} alt="ojo" /> 
                                    : <img className='w-4 h-4' src={closedEye} alt="ojo cerrado" />}
                                </button>
                            </div>
                            <div className='flex items-center justify-center w-full h-full'>
                                <button onClick={() => setRequestFinalizada(false)} className="w-full max-w-60 h-fit max-h-24 p-1.5 sm:p-2.5 text-white hover:bg-sky-950 border-sky-500 border-2 rounded-2xl text-center">Validar admin</button>
                            </div>
                        </div>
                    </form>
                    {/* termina logica form */}
                </article>
            </section>
        </main>
    )
}