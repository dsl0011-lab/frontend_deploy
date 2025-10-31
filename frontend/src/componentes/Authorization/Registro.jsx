import { useEffect, useState } from "react"

const Register = ({ funcUsuario, setFlipped }) => {

    const URL = "http://localhost:8000/api/auth/register/"

    const [ formData, setFormData ] = useState({
        full_name: "",
        username: "",
        email: "",
        password: "",
        gender: "",
    })

    const saveForm = (e) => {
        e.preventDefault()
        setFormData({
            first_name: e.currentTarget.first_name.value.trim(),
            last_name: e.currentTarget.last_name.value.trim(),
            username: e.currentTarget.username.value.trim(),
            email: e.currentTarget.emailR.value.trim(),
            password: e.currentTarget.passwordR.value.trim(),
            gender: e.currentTarget.generoR.value.trim(),
        })
    }

    useEffect(() => {
        const sendData = async () =>{
            if(formData.nombre !== "" && formData.apellido !== "" && formData.contraseña !== "" && formData.email !== ""){
                try{
                    const respuesta = await fetch(URL, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        credentials: 'include',
                        body: JSON.stringify(formData)
                    })
                    if(!respuesta.ok){ {
                            const errorData = await respuesta.json()
                            console.error("Ha ocurrido el siguiente problema", errorData)
                    }}
                    const data = await respuesta.json()
                    console.log(data)
                    funcUsuario(data)
                }catch(e){
                    console.log(`Ha ocurrido un error no documentado: ${e}`)
                }
            }
        }
        sendData();
    },[formData, funcUsuario ])

    return(
            <>
                <h1 className="text-base sm:text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Registro
                </h1>
                <form className="grid place-items-center w-full h-full text-sm sm:grid-cols-2 grid-cols-1 sm:gap-4 pb-5" onSubmit={(e) => saveForm(e)}>
                        <input type="text" name="first_name" id="first_name" placeholder="Ingresa tu nombre" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                        <input type="text" name="last_name" id="last_name" placeholder="Ingresa tus apellidos" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                        <input type="text" name="username" id="username" placeholder="Ingresa nombre de usuario" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                        <input type="email" name="emailR" id="emailR" placeholder="Ingresa tu email" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                        {/* ATENCIOOOOOON
                        luego incrementar seguridad de credencial contraseña con expresiones regulares u otra medida */}
                        <input type="password" name="passwordR" id="passwordR" placeholder="Ingresa tu contraseña" autoComplete="off" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                        <select name="generoR" id="generoR" className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-white" required >
                            <option value="">Selecciona tu género</option>
                            <option value="M">masculino</option>
                            <option value="F">femenino</option>
                        </select>
                    <button type="submit" className="w-full max-w-60 h-fit max-h-24 p-0.5 sm:p-2.5 rounded-2xl text-white bg-gray-900 hover:bg-slate-800 text-center">Registrate</button>
                    <a href="#" className="w-full max-w-60 text-center font-medium text-primary-600 hover:underline text-white dark:text-primary-500 ml-2" 
                    onClick={()=>setFlipped(false)}>¿Ya tienes cuenta?</a>
                </form>
            </>
    )
}

export default Register