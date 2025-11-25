import TutoriaCard from './Utilities/TutoriaCard';

function SectionsTutorias({tutorias, setRefrescarTutorias}) {
    return (
        <section className="bg-gray-900/40 border border-gray-700 rounded-2xl p-4">
            {tutorias.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-600 p-6 text-center text-sm text-gray-300">
                    Todavia no hay tutorias registradas.
                </div>
            ) : (
                // Aqui se ve las tutorias que tiene el usuario
                <div className="grid gap-4 md:grid-cols-2">
                    {tutorias.map((tutoria) => (
                        <TutoriaCard key={tutoria.id} tutoria={tutoria} setRefrescarTutorias={setRefrescarTutorias}/>
                    ))}
                </div>
            )}
        </section>
    )
}

export default SectionsTutorias