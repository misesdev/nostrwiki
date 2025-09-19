'use client'

import Link from "next/link";

type Props = {
    term: string;
}

const EmptyResults = ({ term }: Props) => {
    return (
        <div className='flex flex-col justify-center items-center pt-10'>
            <h1 className='text-[20px] lg:text-3xl mb-4 text-gray-400 text-center'>
                No results found for `{term}`
            </h1>
            <p className='text-[12px] lg:text-lg text-gray-300 text-center'>
                Try searching for other terms with the same meaning.{' '}
                <Link href='/' className='text-blue-500'>
                    Home
                </Link>
            </p>
        </div>
    )
}

export default EmptyResults
