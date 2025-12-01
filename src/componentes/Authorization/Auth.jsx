import Register from './Registro';
import Login from './Login';
import Logo from '../../../static/logo-2.png'
import { MiniComponenteLoading } from '../PantallaLoading/ComponenteLoading';
import { UsuarioContext } from '../useContext/UsuarioContext';
import { useState, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [flipped, setFlipped] = useState(false);
  const { setUsuario } = useContext(UsuarioContext);
  const [error, setError] = useState(false)
  const [requestFinalizada, setRequestFinalizada] = useState(false);
  const navigate = useNavigate();

  const funcUsuario = useCallback((informacion) => {
    if (informacion) {
      // guarda en contexto
      setUsuario(() => informacion);
      // navega al dashboard (pequeño delay para que el contexto se propague)
      navigate('/', { replace: true })
    }
  }, [setUsuario, navigate]);

  useEffect(() => {
    //validacion para inicio automatico
    const usuario = localStorage.getItem("usuarioGuardado")
    if (usuario) {
      setRequestFinalizada(true)
    }
  }, [setRequestFinalizada, error])


  return (
    <>
      <div className='w-full h-screen relative overflow-hidden flex justify-center items-center bg-gradient-to-t from-gray-400 to-black box-border'>
        <section className='relative [perspective:1000px] w-[90vw] max-w-[600px] h-[95vh] max-h-[600px] sm:max-h-[400] flex justify-center items-center flex-col'>
          <img src={Logo} className='w-[120px] h-[75px] max-w-72 max-h-56 object-cover p-2 sm:w-fit sm:h-fit' />
          {/* tarjeta principal del flipped */}
          <article
            className={`relative w-full h-full transition-transform duration-1000 [transform-style:preserve-3d] bg-gray-800 rounded-2xl flex justify-center items-center ${flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
          >
            {(requestFinalizada && !error) &&
              <div className='absolute h-fit w-fit top-0 z-20'>
                <MiniComponenteLoading />
              </div>}
            {/* Cara frontal (Login) */}
            <div className='absolute w-full h-full top-0 left-0 [backface-visibility:hidden] p-2'>
              <Login funcUsuario={funcUsuario} setFlipped={setFlipped} setError={setError} error={error} setRequestFinalizada={setRequestFinalizada} />
            </div>

            {/* Cara trasera (Registro) */}
            <div className='absolute w-full h-full top-0 left-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-2 rounded-2xl flex flex-col'>
              <Register funcUsuario={funcUsuario} setFlipped={setFlipped} setRequestFinalizada={setRequestFinalizada}/>
            </div>
          </article>
        </section>
      </div>
    </>
  );
}

export default Auth;
