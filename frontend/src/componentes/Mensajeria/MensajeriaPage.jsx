import React, { useContext } from 'react'
import { listarConversaciones, crearConversacion, getMensajes, enviarMensaje, marcarLeidos, actualizarConversacion, eliminarConversacion } from './api'
import ConversacionesList from './ConversacionesList'
import ChatWindow from './ChatWindow'
import NuevaConversacionModal from './NuevaConversacionModal'
import UserDirectory from './UserDirectory'
import { UsuarioContext } from '../useContext/UsuarioContext'

export default function MensajeriaPage() {
  const { usuario } = useContext(UsuarioContext)
  const [convs, setConvs] = React.useState([])
  const [sel, setSel] = React.useState(null)
  const [msgs, setMsgs] = React.useState([])
  const [err, setErr] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const puedeBorrar = usuario?.role === 'T' || usuario?.role === 'A'

  React.useEffect(() => { listarConversaciones().then(setConvs).catch(()=>setErr('No se pudieron cargar las conversaciones')) }, [])

  React.useEffect(() => {
    let alive = true
    if (!sel) return
    getMensajes(sel.id).then(async (m)=>{
      if (alive) setMsgs(m||[])
      try {
        await marcarLeidos(sel.id)
        setConvs(prev => prev.map(x => x.id === sel.id ? { ...x, no_leidos: 0 } : x))
      } catch {}
    }).catch(()=>{})
    return ()=> { alive = false }
  }, [sel?.id])

  const onNueva = () => setOpen(true)
  const onCreate = async (payload) => {
    try {
      const c = await crearConversacion(payload)
      setConvs(prev => [c, ...prev])
      setSel(c)
      setOpen(false)
      return c
    } catch (e) {
      setErr('No se pudo crear la conversación')
      throw e
    }
  }
  const onEnviar = async (texto) => {
    try {
      const m = await enviarMensaje(sel.id, texto)
      setMsgs(prev => [...prev, m])
      // refresca último mensaje en la lista
      setConvs(prev => prev.map(x => x.id === sel.id ? { ...x, ultimo_mensaje: m } : x))
    } catch (e) {}
  }

  const onUpdateAsunto = async (nuevoAsunto) => {
    const updated = await actualizarConversacion(sel.id, { asunto: nuevoAsunto })
    setSel(updated)
    setConvs(prev => prev.map(x => x.id === sel.id ? { ...x, asunto: updated.asunto } : x))
    return updated
  }

  const onEliminar = async () => {
    if (!sel || !puedeBorrar) return
    if (!window.confirm('¿Seguro que quieres eliminar esta conversación?')) return
    try {
      await eliminarConversacion(sel.id)
      setConvs(prev => prev.filter(x => x.id !== sel.id))
      setSel(null)
      setMsgs([])
    } catch (e) {
      setErr('No se pudo eliminar la conversación')
    }
  }

  const onStartFromDirectory = async (user) => {
    try {
      const c = await crearConversacion({ asunto: '', usernames: [user.username] })
      setConvs(prev => [c, ...prev])
      setSel(c)
    } catch (e) {
      setErr('No se pudo iniciar la conversación')
    }
  }

  return (
    <div className="min-h-[70vh] flex text-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <ConversacionesList conversaciones={convs} seleccionada={sel} onSelect={setSel} onNueva={onNueva} />
      <ChatWindow conversacion={sel} mensajes={msgs} onEnviar={onEnviar} onUpdateAsunto={onUpdateAsunto} onDelete={puedeBorrar ? onEliminar : undefined} />
      <UserDirectory onStart={onStartFromDirectory} />
      <NuevaConversacionModal open={open} onClose={()=>setOpen(false)} onCreate={onCreate} />
      {err && <div className="fixed bottom-2 left-2 text-xs text-red-400">{err}</div>}
    </div>
  )
}
