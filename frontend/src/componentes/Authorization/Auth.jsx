import Register from './Registro';
import Login from './Login';
import Logo from '../../assets/logo-2.png';
import { UsuarioContext } from '../useContext/UsuarioContext';
import { useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [flipped, setFlipped] = useState(false);
  const { setUsuario } = useContext(UsuarioContext);
  const navigate = useNavigate();

  // 👉 la recibe desde Login/Registro cuando el backend confirma
  const funcUsuario = useCallback((informacion) => {
    if (informacion) {
      // guarda en contexto
      setUsuario(() => informacion);
      // navega al dashboard (pequeño delay para que el contexto se propague)
      setTimeout(() => navigate('/', { replace: true }), 0);
    }
  }, [setUsuario, navigate]);

  return (
    <div className='w-full h-screen overflow-hidden flex justify-center items-center bg-gradient-to-t from-gray-400 to-black box-border'>
      <section className='relative [perspective:1000px] w-[90vw] max-w-[600px] h-[95vh] max-h-[600px] sm:max-h-[400] flex justify-center items-center flex-col'>
        <img src={Logo} className='w-[120px] h-[75px] max-w-72 max-h-56 object-cover p-2 sm:w-fit sm:h-fit' />
        {/* tarjeta principal del flipped */}
        <article
          className={`relative w-full h-full transition-transform duration-1000 [transform-style:preserve-3d] bg-gray-800 rounded-2xl flex justify-center items-center ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Cara frontal (Login) */}
          <div className='absolute w-full h-full top-0 left-0 [backface-visibility:hidden] p-2'>
            <Login funcUsuario={funcUsuario} setFlipped={setFlipped} />
          </div>

          {/* Cara trasera (Registro) */}
          <div className='absolute w-full h-full top-0 left-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-2 rounded-2xl flex flex-col'>
            <Register funcUsuario={funcUsuario} setFlipped={setFlipped} />
          </div>
        </article>
      </section>
    </div>
  );
}

export default Auth;
