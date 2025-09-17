export type NFile = {
    url: string;
    pubkey: string;
    note_id: string;
    title: string;
    description: string;
    published_by?: string;
    published_at: number;
    type: string;
    tags?: string;
    created_at: Date;
    updated_at?: Date;
    ref_count: number;
}
