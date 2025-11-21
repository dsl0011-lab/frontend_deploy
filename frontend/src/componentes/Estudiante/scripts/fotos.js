import fondo1 from '../../../assets/fondoAsignaturas/fondo1.jpg'
import fondo2 from '../../../assets/fondoAsignaturas/fondo2.jpg'
import fondo3 from '../../../assets/fondoAsignaturas/fondo3.jpg'
import fondo4 from '../../../assets/fondoAsignaturas/fondo4.jpg'
import fondo5 from '../../../assets/fondoAsignaturas/fondo5.jpg'

const imagenes = [ fondo1, fondo2, fondo3, fondo4, fondo5 ]

const imagenesRandom = () => {
    const numero = Math.floor(Math.random() * imagenes.length)
    return imagenes[numero]
}

export { imagenesRandom, fondo1, fondo2, fondo3, fondo4, fondo5}