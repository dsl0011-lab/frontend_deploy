import React from 'react'

function Header({ puedeCrear, setShowModal }) {
    return (
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <h1 className="text-3xl font-bold">Tutorias</h1>
            {puedeCrear && (
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold"
                >
                    + Nueva tutoria
                </button>
            )}
        </header>
    )
}

export default Header