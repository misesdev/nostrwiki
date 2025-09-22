'use client'

import { Relay, User } from "@/types/types"
import RelayItem from "../relay/RelayItem"

type RelayResultsProps = {
    relays: Relay[];
    viewManteiner: (u: User) => void;
}

const RelayResults = ({ relays, viewManteiner }: RelayResultsProps) => {
    if(!relays.length) return null 
    return (
        <div className="w-full">
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-7 py-5 px-3 md:px-6'>
                {relays.map((relay, key) => (
                    <RelayItem key={key} relay={relay} viewManteiner={viewManteiner} />
                ))}
            </div>
        </div>
    )
}

export default RelayResults
