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
    active: boolean;
}

export type RefRelay = {
    url: string;
    count: number;
}
