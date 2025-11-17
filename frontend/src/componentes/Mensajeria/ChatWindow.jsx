import React, { useEffect, useRef, useState } from 'react'

export default function ChatWindow({ conversacion, mensajes, onEnviar, onUpdateAsunto, onDelete }) {
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes])

  const [texto, setTexto] = useState("")
  const [editing, setEditing] = useState(false)
  const [asunto, setAsunto] = useState("")
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    setAsunto(conversacion?.asunto || "")
    setEditing(false)
    setErr("")
  }, [conversacion?.id])

  async function saveAsunto(e) {
    e?.preventDefault?.()
    if (!onUpdateAsunto || !conversacion) return
    try {
      setSaving(true); setErr("")
      await onUpdateAsunto(asunto)
      setEditing(false)
    } catch (e) {
      setErr('No se pudo actualizar el asunto')
    } finally { setSaving(false) }
  }

  const send = (e) => {
    e?.preventDefault?.()
    if (!texto.trim()) return
    onEnviar(texto.trim())
    setTexto("")
  }

  if (!conversacion) return (
    <section className="flex-1 p-4">
      <div className="text-sm opacity-70">Selecciona una conversación</div>
    </section>
  )

  return (
    <section className="flex-1 p-4 flex flex-col">
      <div className="text-lg font-semibold mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <span>{conversacion.asunto || `Conversación #${conversacion.id}`}</span>
              {onUpdateAsunto && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs px-2 py-0.5 rounded border border-gray-600 hover:bg-gray-700"
                >
                  Editar
                </button>
              )}
            </>
          ) : (
            <form onSubmit={saveAsunto} className="flex items-center gap-2">
              <input
                className="rounded border border-gray-600 bg-transparent px-2 py-1 text-sm"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Asunto"
              />
              <button
                disabled={saving}
                className="text-xs px-2 py-0.5 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setAsunto(conversacion.asunto || "") }}
                className="text-xs px-2 py-0.5 rounded border border-gray-600"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-xs px-2 py-0.5 rounded border border-red-500 text-red-400 hover:bg-red-500/10"
          >
            Eliminar
          </button>
        )}
      </div>
      {err && <div className="text-xs text-red-400 mb-1">{err}</div>}
      <div className="flex-1 border border-gray-700 rounded p-2 overflow-auto space-y-2 bg-gray-900">
        {(mensajes || []).map(m => (
          <div key={m.id} className="bg-gray-800 rounded p-2">
            <div className="text-xs opacity-70">{m.autor?.username} · {new Date(m.creado_en).toLocaleString()}</div>
            <div className="text-sm">{m.texto}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded border border-gray-600 bg-transparent px-3 py-2"
          placeholder="Escribe un mensaje"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button className="px-3 py-2 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10">
          Enviar
        </button>
      </form>
    </section>
  )
}

