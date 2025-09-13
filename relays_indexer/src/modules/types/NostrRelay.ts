export type NostrRelay = {
    url: string;
    name?: string;
    icon?: string;
    pubkey?: string;
    description?: string;
    contact?: string;
    supported_nips?: string;
    software?: string;
    version?: string;
    available: boolean;
    created_at: Date;
    updated_at?: Date;
    ref_count: number;
}

export type RefRelay = {
    url: string;
    count: number;
}
