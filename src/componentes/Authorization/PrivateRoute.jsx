import { useContext } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { UsuarioContext } from '../useContext/UsuarioContext'

function PrivateRoute() {
    const { usuario } = useContext(UsuarioContext)
    return(
        usuario !== undefined && usuario !== null && usuario?.first_name && usuario?.last_name
        ? <Outlet />
        : <Navigate to='/Auth' replace />
    ) 
}

export default PrivateRoute