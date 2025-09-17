import { RelayPool } from "../modules/RelayPool"
import { User } from "../modules/types/User";

export type LoadDataProps = {
    pool: RelayPool;
    pubkeys: string[];
    accumulateRelays: (items: string[]) => void;
}

export type LoadNotesProps = {
    users: User[];
    pool: RelayPool;
    accumulateRelays: (items: string[]) => void;
}

