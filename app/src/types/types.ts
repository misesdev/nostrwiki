
export type SearchParams = {
    term: string;
}

export type User = {
    name: string;
    pubkey: string;
    display_name: string;
    picture: string;
    about: string;
    banner: string;
    website?: string;
    nip05?: string;
    lud06?: string;
    lud16?: string;
    zapService?: string;
    ref_count: number;
}

export type Relay = {
    url: string;
    name: string;
    pubkey?: string;
    description?: string;
    contact?: string;
    supported_nips: string;
    software?: string;
    version?: string;
    available: boolean;
    ref_count: number;
    icon?: string;
    author?: User;
}

export type Note = {
    id: string;
    title: string;
    content: string;
    published_at: number;
    published_by: string;
    tags: string[]|string;
    author: User;
}

export type NFile = {
    url: string;
    title: string;
    description: string;
    pubkey: string;
    note_id: string;
    published_at: number;
    published_by: string;
    note: Note;
    author: User;
}

export type AutocompleteNote = {
    type: "note";
    score: number;
    id: string;
    pubkey: string;
    title: string;
    content: string;
    published_by: string;
    published_at: number;
    tags?: string[];
};

export type AutocompleteUser = {
    type: "user";
    score: number;
    pubkey: string;
    name: string;
    display_name?: string;
    about: string;
    picture?: string;
    banner?: string;
};

export type AutocompleteResult = AutocompleteNote | AutocompleteUser;
