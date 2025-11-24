import { useEffect } from 'react'

export default function ConversacionesList({ conversaciones, seleccionada, onSelect, onNueva }) {
  useEffect(() => {
    if (!seleccionada && conversaciones && conversaciones.length > 0) {
      onSelect(conversaciones[0])
    }
  }, [conversaciones])

  return (
    <aside className="w-80 border-r border-gray-700 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Conversaciones</h2>
        <button onClick={onNueva} className="px-2 py-1 text-sm rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10">Nueva</button>
      </div>
      <ul className="space-y-1">
        {(conversaciones || []).map(c => (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c)}
              className={`w-full text-left px-2 py-2 rounded border ${seleccionada?.id === c.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:bg-gray-800'}`}
            >
              <div className="text-sm font-medium flex items-center justify-between">
                <span>{c.asunto || `Conversación #${c.id}`}</span>
                {c.no_leidos > 0 && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-700">{c.no_leidos}</span>
                )}
              </div>
              {c.ultimo_mensaje && (
                <div className="text-xs opacity-70 truncate">{c.ultimo_mensaje.autor?.username}: {c.ultimo_mensaje.texto}</div>
              )}
            </button>
          </li>
        ))}
        {(!conversaciones || conversaciones.length === 0) && (
          <li className="text-sm opacity-70">No hay conversaciones</li>
        )}
      </ul>
    </aside>
  )
}
