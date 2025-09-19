'use client'

import { normalizeNote, normalizeUser } from "@/utils/utils";
import { AutocompleteResult, Note, User } from "../../types/types";
import { APISerachProps, APIUserNotesProps } from "./types/APISearchProps";
import axios, { AxiosInstance } from "axios";

class SearchService
{
    private readonly _client: AxiosInstance
    constructor()
    {
        const baseURL = process.env.NEXT_PUBLIC_API_ENGINE_URL 
        this._client = axios.create({
            baseURL: baseURL,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        })
    }

    public async autocomplete(term: string): Promise<AutocompleteResult[]>
    {
        const response = await this._client.get(`/search/autocomplete?term=${term.trim()}`)
        
        if(![404, 200].includes(response.status)) 
            throw Error('Error when searching fo users')
        
        return response.data as AutocompleteResult[]
    }

    public async search<Entity>(url: string, body: APISerachProps): Promise<Entity[]> 
    {
        const response = await this._client.post(url, body)

        if(![404, 200].includes(response.status)) 
            throw Error('Error when searching fo users')

        const results: Entity[] = await response.data

        return results
    }

    public async profile(pubkey: string): Promise<User>
    {
        const response = await this._client.get(`/users/profile/${pubkey}`)
       
        if(![404, 200].includes(response.status)) 
            throw Error('Error when searching fo users')
        
        return normalizeUser(response.data as User)
    }

    public async userNotes(body: APIUserNotesProps): Promise<Note[]>
    {
        const response = await this._client.post(`/users/notes`, body)
        
        if(![404, 200].includes(response.status)) { 
            console.log(response)
            throw Error('Error when searching fo users')
        }

        return (response.data as Note[]).map(n => normalizeNote(n))
    }

    public async note(id: string): Promise<Note>
    {
        const response = await this._client.get(`/notes/note/${id}`)
        
        if(![404, 200].includes(response.status)) 
            throw Error('Error when searching fo users')
        
        return normalizeNote(response.data as Note)
    }

}

export default SearchService

