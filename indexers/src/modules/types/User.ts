export type User = {
    pubkey: string;
    name?: string;
    display_name?: string;
    picture?: string;
    about?: string;
    banner?: string;
    website?: string;
    nip05?: string;
    lud06?: string;
    lud16?: string;
    zapService?: string;
    created_at: Date;
    updated_at?: Date;
    available: boolean;
    ref_count: number;
    since?: number;
}


export type RefPubkey = {
    pubkey: string;
    count: number;
}
