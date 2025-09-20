'use client'

const VideoLoader = () => {
    const LoadingItem = () => (
        <div className="animate-pulse flex flex-col space-y-3 w-full">
            {/* Thumbnail */}
            <div className="h-40 w-full bg-gray-200 rounded-xl"></div>

            {/* Títulos */}
            <div className="h-3 w-3/4 bg-gray-200 rounded-md"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded-md"></div>
        </div>
    )

    return (
        <div className="w-full max-w-7xl mx-auto p-4 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, key) => (
                <LoadingItem key={key} />
            ))}
        </div>
    )
}

export default VideoLoader
