function ComponenteLoading() {
    return (
        <section className='absolute top-0 z-30 bg-black/75'>
            <article className='h-dvh w-dvw'>
                <div className='h-full w-full flex items-center justify-center'>
                    <p className='h-20 w-20 border-4 border-sky-700 border-t-sky-400 rounded-full animate-spin'></p>
                </div>
            </article>
        </section>
    )
}


function MiniComponenteLoading() {
    return (
        <section className=' w-full h-full bg-black/2'>
            {/* <article className='h-full w-dvw'> */}
                <div className='h-full w-full flex items-center justify-center'>
                    <p className='h-20 w-20 border-4 border-sky-700 border-t-sky-400 rounded-full animate-spin'></p>
                </div>
            {/* </article> */}
        </section>
    )
}

export { ComponenteLoading, MiniComponenteLoading }