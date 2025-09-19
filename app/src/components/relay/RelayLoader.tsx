'use client'

const RelayLoader = () => {

    const LoadingItem = () => {
        return (
            <div className='animate-pulse'>
                <div className='h-48 w-96 mb-4 bg-gray-200 rounded-md'></div>
                <div className='h-2 w-48 mb-2.5 bg-gray-200 rounded-md'></div>
                <div className='h-2 w-48 mb-2.5 bg-gray-200 rounded-md'></div>
            </div>
        )
    }

    const Loading = () => (
        <div className='pt-10 mx-2 pl-24 lg:pl-52 max-w-6xl flex sm:space-x-4 flex-col sm:flex-row pb-42'>
            {Array.from({ length: 3 }).map((i, key) => <LoadingItem key={key} />)} 
        </div>
    )

    return (
        <div className="w-full">
            {Array.from({ length: 2 }).map((i, key) => <Loading key={key} />)} 
        </div>
    )

    // return (
    //     <div className='w-full group'>
    //         <div className="p-5 bg-gray-800 rounded-3xl overflow-x-clip">
    //             <div className='max-w-6xl animate-pulse'>
    //                 <div className="w-full flex">
    //                     <div className='w-[80px] h-[80px] bg-gray-200 rounded-[13px] mb-2.5'></div>
    //                     <div className='mx-6 h-[50px] w-[220px] lb:w-[80px] bg-gray-200 rounded-[20px] mb-2.5'></div>
    //                 </div>
    //             </div>
    //             <div className='max-w-6xl animate-pulse'>
    //                 <div className='h-2.5 w-48 bg-gray-200 rounded-full mb-2.5'></div>
    //                 <div className='h-3.5 w-[300px] lb:w-[360px] bg-gray-200 rounded-full mb-2.5'></div>
    //                 <div className='h-3.5 w-[300px] lb:w-[360px] bg-gray-200 rounded-full mb-2.5'></div>
    //                 <div className='h-2.5 w-[120px] lb:w-[230px] bg-gray-200 rounded-full mb-2.5'></div>
    //                 <div className='h-2.5 w-[290px] lb:w-[530px] bg-gray-200 rounded-full mb-2.5'></div>
    //                 <div className='h-2.5 w-48 bg-gray-200 rounded-full mb-2.5'></div>
    //                 <div className='h-3.5 w-[300px] lb:w-[360px] bg-gray-200 rounded-full mb-2.5'></div>
    //                 <div className='h-3.5 w-[300px] lb:w-[360px] bg-gray-200 rounded-full mb-2.5'></div>
    //             </div>
    //         </div>
    //     </div>
    // )
}

export default RelayLoader
