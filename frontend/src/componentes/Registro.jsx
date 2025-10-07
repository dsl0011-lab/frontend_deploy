import { useEffect, useState } from "react"

const Register = () => {

    const URL = "coloca tu endpoint aqui"
    const [ formData, setFormData ] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        gender: "",
        rol: ""
    })

    const saveForm = (e) => {
        e.preventDefault();
        setFormData({
            nombre: e.currentTarget.nombreR.value.trim(),
            apellido: e.currentTarget.apellidoR.value.trim(),
            email: e.currentTarget.emailR.value.trim(),
            gender: e.currentTarget.passwordR.value.trim(),
            password: e.currentTarget.generoR.value.trim(),
            rol: e.currentTarget.rolR.value.trim()
        })
    }

    useEffect(() => {
        if(formData.email !== "" && formData.password !== "" && formData.realname !== "" && formData.username !== ""){
            // const sendData = async () =>{
            //     try{
            //         const respuesta = await fetch(URL, {
            //             method: "POST",
            //             headers: {"Content-Type": "application/json"},
            //             body: JSON.stringify(formData)
            //         })
            //         if(!respuesta.ok){ {
            //                 const errorData = await respuesta.json()
            //                 console.error("Ha ocurrido el siguiente problema", errorData)
            //         }}
            //         const data = await respuesta.json()
            //         console.log("Los datos recibidos son:", data)
            //     }catch(err){
            //         console.log("Ha ocurrido un error no documentado: ",err)
            //     }
            // }
            // sendData();
            console.log(formData)
        }
    },[formData])

    return(
        <article className="w-12/12 h-12/12 flex flex-col justify-center items-center p-8">
            <div className="w-12/12 h-12/12 p-6 space-y-4 md:space-y-6 sm:p-8 dark:bg-gray-800 dark:border-gray-700 flex flex-col">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Registro
                </h1>
                <form className="grid sm:grid-cols-2 grid-cols-1 gap-6" onSubmit={(e) => saveForm(e)}>
                        <input type="text" name="nombreR" id="nombreR" placeholder="Ingresa tu nombre" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-2xl w-full h-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                        <input type="text" name="apellidoR" id="apellidoR" placeholder="Ingresa tu apellido" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-2xl w-full h-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                        <input type="email" name="emailR" id="emailR" placeholder="Ingresa tu email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-2xl w-full h-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                        {/* ATENCIOOOOOON
                        luego incrementar seguridad de credencial contraseña con expresiones regulares u otra medida */}
                        <input type="password" name="passwordR" id="passwordR" placeholder="Ingresa tu contraseña" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-2xl w-full h-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                        <select name="generoR" id="generoR" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-2xl w-full h-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required >
                            <option value="">Selecciona tu género</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                        <select name="RolR" id="rolR" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-2xl w-full h-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required >
                            <option value="">Selecciona tu rol</option>
                            <option value="Estudiante">Estudiante</option>
                            <option value="Profesor">Profesor</option>
                            <option value="Administrador">Administrador</option>
                        </select>
                    <button type="submit" className="w-full h-fit p-2 rounded-2xl text-white bg-gray-900 hover:bg-slate-800 text-center">Registrate</button>
                    <a href="#" className="text-sm w-full text-center font-medium text-primary-600 hover:underline text-white dark:text-primary-500 ml-2">¿Ya tienes cuenta?</a>
                </form>
            </div>
        </article>
    )
}

export default Register