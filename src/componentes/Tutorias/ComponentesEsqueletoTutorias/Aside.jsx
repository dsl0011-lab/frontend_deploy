
function Aside({ stats, proximasTutorias }) {
    return (
        <aside className="bg-gray-900 border border-gray-700 rounded-2xl p-4 space-y-4">
            <section>
                <h2 className="text-lg font-semibold mb-2">Resumen rapido</h2>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-800 rounded-lg p-3">
                        <dt className="text-gray-400">Totales</dt>
                        <dd className="text-2xl font-bold">{stats.total}</dd>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <dt className="text-gray-400">Pendientes</dt>
                        <dd className="text-2xl font-bold text-yellow-300">{stats.pendiente}</dd>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <dt className="text-gray-400">Confirmadas</dt>
                        <dd className="text-2xl font-bold text-blue-300">{stats.confirmada}</dd>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <dt className="text-gray-400">Completadas</dt>
                        <dd className="text-2xl font-bold text-emerald-300">{stats.completada}</dd>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 col-span-2">
                        <dt className="text-gray-400">Canceladas</dt>
                        <dd className="text-2xl font-bold text-red-300">{stats.cancelada}</dd>
                    </div>
                </dl>
            </section>
            <section>
                <h3 className="text-sm font-semibold text-gray-200 mb-2">Proximas tutorias</h3>
                {proximasTutorias.length === 0 ? (
                    <p className="text-xs text-gray-400">Sin tutorias agendadas</p>
                ) : (
                    <ul className="space-y-3 text-sm">
                        {proximasTutorias.map((t) => (
                            <li key={t.id} className="bg-gray-800 rounded-lg p-2">
                                <div className="font-medium">{t.asignatura}</div>
                                <div className="text-xs text-gray-400">
                                    {t._date.toLocaleDateString()} - {t._date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="text-xs text-gray-400">
                                    Alumno: {t.alumno_nombre || t.alumno_username}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </aside>
    )
}

export default Aside