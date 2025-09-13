import { Friend } from "../../modules/types/Friend";
import DBFactory from "./DBFactory";

class DBFriends
{
    private BATCH_SIZE = 100
    private readonly _db: DBFactory;
    constructor() 
    {
        this._db = new DBFactory();
    }

    public async upsert(items: Friend[]): Promise<void>
    {
        for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
            const batch = items.slice(i, i + this.BATCH_SIZE);
            await this.upsertBetch(batch);
        }
    }

    private async upsertBetch(friends: Friend[]): Promise<void> 
    {
        if (!friends.length) return;

        const columns = ["user_pubkey", "friend_pubkey"];
        const values: any[] = [];
        const placeholders: string[] = [];
        friends.forEach((f, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(f.user_pubkey, f.friend_pubkey);
        });
        const query = `
            INSERT INTO friends (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (user_pubkey, friend_pubkey) DO NOTHING
        `;
        await this._db.exec(query, values);
    }

    public async remove(user_pubkey: string, friend_pubkey: string): Promise<void>
    {
        const query = `
            DELETE FROM friends
            WHERE user_pubkey = $1 AND friend_pubkey = $2
        `;
        await this._db.exec(query, [user_pubkey, friend_pubkey]);
    }
}

export default DBFriends;
