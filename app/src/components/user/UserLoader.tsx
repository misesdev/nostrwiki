'use client'

export const UserLoader = () => {
    const LoadingItem = () => {
        return (
            <div className="animate-pulse flex flex-col space-y-3 w-full">
                {/* Imagem */}
                <div className="h-48 w-full bg-gray-200 rounded-xl"></div>

                {/* Títulos / legendas */}
                <div className="h-3 w-3/4 bg-gray-200 rounded-md"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded-md"></div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, key) => (
                <LoadingItem key={key} />
            ))}
        </div>
    )
}
