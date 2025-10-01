'use client'

import { SearchParams, User } from "@/types/types";
import SearchService from "@/services/api/SearchService";
import { normalizeUser } from "@/utils/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserLoader } from "../user/UserLoader";
import EmptyResults from "./EmptyResults";
import UsersResults from "../user/UserResults";
import UserModal from "../user/UserModal";

const UserSearch = ({ term }: SearchParams) => {
 
    const take = 16
    const [skip, setSkip] = useState(0)
    const [isOpen, setIsOpen] = useState(true)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User|null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [endOfResults, setEndOfResults] = useState(false)
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const uniques = useRef(new Map<string, User>()) 
    const isFetching = useRef<boolean>(false) 

    useEffect(() => { 
        setSkip(0)
        setUsers([])
        setLoading(true)
        setEndOfResults(false)
        uniques.current = new Map<string, User>()
        const load = async () => {
            const service = new SearchService()
            const users = await service.search<User>("/search/users", { term, skip:0, take })
            users.forEach(user => {
                uniques.current.set(user.pubkey, normalizeUser(user))
            })
            setUsers(Array.from(uniques.current.values()))
            setEndOfResults(users.length < (take/2))
            setSkip(prev => prev + take)
            setLoading(false)
        }
        load() 
    }, [term])

    const fetchUsers = useCallback(async () => {
        if(isFetching.current) return; 
        setLoading(true)
        isFetching.current = true
        const service = new SearchService()
        const users = await service.search<User>("/search/users", { term, skip, take })
        users.forEach(user => {
            uniques.current.set(user.pubkey, normalizeUser(user))
        })
        setUsers(Array.from(uniques.current.values()))
        setEndOfResults(users.length < (take/2))
        setSkip(prev => prev + take)
        isFetching.current = false
        setLoading(false)
    }, [term, skip, take, isFetching.current])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !endOfResults) {
                    fetchUsers();
                }
            },
            { threshold: 1 }
        )
        const target = loaderRef.current; 
        if (target) {
            observer.observe(target);
        }
        return () => {
            if (target) {
                observer.unobserve(target); 
            }
        };
    }, [loading, endOfResults, fetchUsers]);

    const showInModal = useCallback((profile: User) => {
        setUser(profile)
        setIsOpen(true)
    }, [user, isOpen])

    if (!loading && !users.length) 
        return <EmptyResults term={term} /> 

    return (
        <>
            <div className="w-full text-[12px] md:text-sm">
                <UsersResults showInModal={showInModal} users={users} />
                {loading && !endOfResults && <UserLoader />}
                {endOfResults && 
                    <p className="text-center text-gray-500">No more results</p>
                }
                <div ref={loaderRef} className="h-[50px]" />
            </div>
            {isOpen && !!user && (
                <UserModal isOpen={isOpen} user={user as User} onClose={() => setIsOpen(false)} />
            )}
        </>
    )
}

export default UserSearch 
