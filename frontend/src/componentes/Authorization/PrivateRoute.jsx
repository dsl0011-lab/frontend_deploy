import { useContext, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { UsuarioContext } from '../useContext/UsuarioContext'

function PrivateRoute() {
    const { usuario } = useContext(UsuarioContext)
    useEffect(()=>console.log("dentro de privateroute",usuario),[usuario])
    return(
        usuario !== undefined && usuario !== null
        ? <Outlet />
        : <Navigate to='/Auth' replace />
    ) 
}

export default PrivateRoute