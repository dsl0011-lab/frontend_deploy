import { useContext, useState } from "react"
import { UsuarioContext } from "../useContext/UsuarioContext"
import { Outlet, useLocation } from "react-router-dom"
import { Logout } from "../Authorization/scripts/Security"
import arrow from '../../assets/btn-arrow.svg'
import exit from '../../assets/exit.svg'
import Sidebar from "./Sidebar"
import Inicio from "./Inicio"


const Dashboard = () => {
    const { setUsuario } = useContext(UsuarioContext)
    const [showNB, setShowNB] = useState(false)
    const location = useLocation();



    return (
        <main className="flex relative h-full min-h-screen min-w-screen w-full bg-gray-50 dark:bg-gray-900">
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg 
                    transition-transform duration-1000 ease-in-out z-50
                    ${showNB ? "translate-x-0" : "-translate-x-full"}`}
            >
                <Sidebar showNB={showNB} setShowNB={setShowNB} />
                <img src={arrow} className="w-8 h-8 m-2 pr-1 rounded-r-lg bg-white hover:bg-gray-400 absolute top-60 right-[-40px]"
                    onClick={() => { setShowNB((prev) => !prev) }}
                />
            </div>
            <section className="flex flex-col w-full h-auto p-4 z-0">
                <article className="relative top-0 w-full h-2/12">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        Tablero
                    </h3>
                    <button onClick={() => (Logout(), setUsuario(() => null))} className='bg-white w-12 h-12 hover:bg-gray-400 text-lg rounded-2xl p-2 ml-2 absolute top-0 right-0'>
                        <img src={exit} className="w-fit h-fit" />
                    </button>
                </article>
                <article className="flex-1 p-6">
                    <>
                        {location.pathname == '/' && <Inicio />}
                        <Outlet />
                    </>
                </article>
            </section>
        </main>
    )
}


export default Dashboard
