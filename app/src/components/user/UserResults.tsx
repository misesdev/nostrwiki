'use client'

import { User } from "@/types/types"
import UserItem from "./UserItem"

type UserListProps = {
    users: User[]
}

export const UsersResults = ({ users }: UserListProps) => {
    if (!users.length) return null
    return (
        <div className='my-5 lg:m-10'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-3 gap-4'>
                {users.map((user, key) => (
                    <UserItem key={key} user={user} />
                ))}
            </div>
        </div>
    )
}
