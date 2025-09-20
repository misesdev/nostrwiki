export type NostrEvent = {
    id: string,
    pubkey: string,
    created_at: number,
    kind: number,
    content: string,
    tags: [string[]],
    sig: string
}

export type EventLink = {
    id: string;
    link: string;
}
