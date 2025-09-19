
const ImageLoader = () => {
   
    const LoadingItem = () => {
        return (
            <div className='animate-pulse'>
                <div className='h-48 w-80 mb-4 bg-gray-200 rounded-md'></div>
                <div className='h-2 w-48 mb-2.5 bg-gray-200 rounded-md'></div>
                <div className='h-2 w-48 mb-2.5 bg-gray-200 rounded-md'></div>
            </div>
        )
    }

    const Loading = () => (
        <div className='pt-10 mx-2 pl-24 lg:pl-52 max-w-6xl flex sm:space-x-4 flex-col sm:flex-row pb-42'>
            {Array.from({ length: 4 }).map((i, key) => <LoadingItem key={key} />)} 
        </div>
    )

    return (
        <div className="w-full">
            {Array.from({ length: 2 }).map((i, key) => <Loading key={key} />)} 
        </div>
    )
}

export default ImageLoader
