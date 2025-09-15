import { RelayPool } from "../modules/RelayPool"

export type LoadDataProps = {
    pool: RelayPool;
    pubkeys: string[];
    accumulateRelays: (items: string[]) => void;
}
