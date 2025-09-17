export type Settings = {
    initial_pubkey: string;

    pubkey_index: number;
    user_pubkey_index: number;
    note_pubkey_index: number;
    file_pubkey_index: number;
    relay_pubkey_index: number;

    pubkeys_per_process: number;
    max_fetch_events: number;

    relay_index: number;
    pubkey_relay_index: number;
    user_relay_index: number;
    note_relay_index: number;
    file_relay_index: number;

    relays_connections: number;
    relays_betch_size: number;
    indexer_interval: number
    pubkeys_per_notes: number;
    max_fetch_notes: number;

    note_since?: number;
    file_since?: number;
}

