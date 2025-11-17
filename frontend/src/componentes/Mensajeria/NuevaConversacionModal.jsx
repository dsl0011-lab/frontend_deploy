import { useState } from 'react'

export default function NuevaConversacionModal({ open, onClose, onCreate }) {
  const [username, setUsername] = useState("")
  const [asunto, setAsunto] = useState("")
  const [err, setErr] = useState("")

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setErr("")
    try {
      await onCreate({ asunto: asunto.trim(), usernames: [username.trim()] })
      setUsername(""); setAsunto("")
    } catch (e) {
      setErr('No se pudo crear la conversación. ¿Existe ese usuario?')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded p-4 w-[420px]">
        <h3 className="text-lg font-semibold mb-2">Nueva conversación</h3>
        <form onSubmit={submit} className="space-y-2">
          <div>
            <label className="block text-sm mb-1">Usuario destino</label>
            <input className="w-full rounded border border-gray-600 bg-transparent px-3 py-2" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Asunto (opcional)</label>
            <input className="w-full rounded border border-gray-600 bg-transparent px-3 py-2" placeholder="Asunto" value={asunto} onChange={e=>setAsunto(e.target.value)} />
          </div>
          {err && <div className="text-xs text-red-400">{err}</div>}
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-3 py-1 rounded border border-gray-600">Cancelar</button>
            <button type="submit" className="px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10">Crear</button>
          </div>
        </form>
      </div>
    </div>
  )
}
