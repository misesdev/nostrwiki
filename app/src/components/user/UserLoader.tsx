
const UserLoaderItem = () => {
    return (
        <div className='w-full group'>
            <div className="p-5 bg-gray-800 rounded-3xl overflow-x-clip">
                <div className='max-w-6xl animate-pulse'>
                    <div className="w-full flex">
                        <div className='w-[80px] h-[80px] bg-gray-200 rounded-[13px] mb-2.5'></div>
                        <div className='mx-6 h-[50px] w-[220px] lb:w-[80px] bg-gray-200 rounded-[20px] mb-2.5'></div>
                    </div>
                </div>
                <div className='max-w-6xl animate-pulse'>
                    <div className='h-2.5 w-48 bg-gray-200 rounded-full mb-2.5'></div>
                    <div className='h-3.5 w-[300px] lb:w-[360px] bg-gray-200 rounded-full mb-2.5'></div>
                    <div className='h-3.5 w-[300px] lb:w-[360px] bg-gray-200 rounded-full mb-2.5'></div>
                    <div className='h-2.5 w-[120px] lb:w-[230px] bg-gray-200 rounded-full mb-2.5'></div>
                    <div className='h-2.5 w-[290px] lb:w-[530px] bg-gray-200 rounded-full mb-2.5'></div>
                    <div className='h-2.5 w-48 bg-gray-200 rounded-full mb-2.5'></div>
                    <div className='h-3.5 w-[300px] lb:w-[360px] bg-gray-200 rounded-full mb-2.5'></div>
                    <div className='h-3.5 w-[300px] lb:w-[360px] bg-gray-200 rounded-full mb-2.5'></div>
                </div>
            </div>
        </div> 
    )
}

export const UserLoader = () => {
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-7 py-5 md:py-8 px-3 md:px-6">
            {Array.from({ length: 10 }).map((i, key) => <UserLoaderItem key={key} />)}  
        </div>
    )
}
