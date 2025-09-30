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
        const response = await this._client.get("/search/autocomplete", {
            params: { term }
        })
        
        if(response.status != 200) 
            throw Error('Error when searching fo users')
        
        return response.data as AutocompleteResult[]
    }

    public async search<Entity>(url: string, params: APISerachProps): Promise<Entity[]> 
    {
        const response = await this._client.get(url, { params })

        if(response.status != 200) 
            throw Error('Error when searching')

        const results: Entity[] = await response.data

        return results
    }

    public async profile(pubkey: string): Promise<User>
    {
        const response = await this._client.get(`/user/${pubkey}`)
       
        if(response.status != 200) 
            throw Error('Error when searching users')
        
        return normalizeUser(response.data as User)
    }

    public async userNotes(params: APIUserNotesProps): Promise<Note[]>
    {
        const response = await this._client.get("/user/notes", { params })
        
        if(response.status != 200) 
            throw Error('Error when searching notes')

        return (response.data as Note[]).map(n => normalizeNote(n))
    }

    public async note(id: string): Promise<Note>
    {
        const response = await this._client.get(`/note/${id}`)
        
        if(response.status != 200) 
            throw Error('Error when searching fo users')
        
        return normalizeNote(response.data as Note)
    }

}

export default SearchService

