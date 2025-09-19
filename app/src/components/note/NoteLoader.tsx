'use client'

const NoteLoader = () => {
   
    const LoadingItem = () => {
        return (
            <div className='animate-pulse max-w-3xl'>
                <div className='h-24 w-full mb-2 bg-gray-200 rounded-md'></div>
                <div className='h-2 w-full mb-2 bg-gray-200 rounded-md'></div>
                <div className='h-3 w-full mb-2 bg-gray-200 rounded-md'></div>
            </div>
        )
    }

    const Loading = () => (
        <div className='m-6'>
            {Array.from({ length: 1 }).map((i, key) => <LoadingItem key={key} />)} 
        </div>
    )

    return (
        <div className="p-5 max-w-4xl mx-auto lg:mt-6 space-y-3">
            {Array.from({ length: 4 }).map((i, key) => <Loading key={key} />)} 
        </div>
    )
}

export default NoteLoader
