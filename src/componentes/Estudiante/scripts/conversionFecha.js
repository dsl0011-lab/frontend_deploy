const convertirFecha = (fecha) =>{
    if(fecha){
        const fechaConvertida = new Date(fecha)
        return fechaConvertida.toLocaleString()
    }
}

export {convertirFecha}