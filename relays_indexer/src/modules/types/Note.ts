export type Note = {
    id: string;
    kind: number;
    pubkey: string;
    title: string;
    content: string;
    published_by: string;
    published_at: number;
    tags?: string;
    created_at: Date;
    updated_at?: Date;
}

export type RefNote = {
    id: string;
    count: number;
}
