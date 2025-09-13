export type Note = {
    id: string;
    pubkey: string;
    title: string;
    content: string;
    created_at: number;
    kind: number;
    tags?: string;
}

export type RefNote = {
    id: string;
    count: number;
}
