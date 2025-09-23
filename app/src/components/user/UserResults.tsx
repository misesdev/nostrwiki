'use client'

import { User } from "@/types/types"
import UserItem from "./UserItem"

type UserListProps = { 
    users: User[]; 
    showInModal: (u: User) => void;
}

const UsersResults = ({ users, showInModal }: UserListProps) => {
    if (!users.length) return null
    return (
        <div className="w-full">
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 py-5 px-3 md:px-6'>
                {users.map((user) => (
                    <UserItem key={user.pubkey} user={user} showInModal={showInModal} />
                ))}
            </div>
        </div>
    )
}

export default UsersResults
