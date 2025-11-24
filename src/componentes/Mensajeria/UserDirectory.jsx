import React from 'react'
import { getDirectorio } from './api'

function UserGroup({ title, users, onStart }) {
  if (!users || users.length === 0) return null
  return (
    <div>
      <div className="text-xs uppercase opacity-60 mb-1">{title}</div>
      <ul className="space-y-1 mb-3">
        {users.map(u => (
          <li key={u.id}>
            <button
              onClick={() => onStart(u)}
              className="w-full text-left px-2 py-1 rounded border border-gray-700 hover:bg-gray-800"
              title={`Chatear con ${u.username}`}
            >
              <span className="font-medium text-sm">{u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username}</span>
              <span className="text-xs opacity-60 ml-2">@{u.username}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function UserDirectory({ onStart }) {
  const [dir, setDir] = React.useState({ A: [], T: [], S: [] })
  const [err, setErr] = React.useState("")

  React.useEffect(() => {
    getDirectorio().then(setDir).catch(() => setErr('No se pudo cargar el directorio'))
  }, [])

  return (
    <aside className="w-80 border-l border-gray-700 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Directorio</h2>
      </div>
      {err && <div className="text-xs text-red-400">{err}</div>}
      <div className="text-sm">
        <UserGroup title="Administradores" users={dir.A} onStart={onStart} />
        <UserGroup title="Profesores" users={dir.T} onStart={onStart} />
        <UserGroup title="Alumnos" users={dir.S} onStart={onStart} />
      </div>
    </aside>
  )
}

