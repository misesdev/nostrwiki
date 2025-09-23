import { Friend } from "../modules/types/Friend";
import DBFriends from "./database/DBFriends";

class FriendsService
{
    private readonly _dbFriends: DBFriends
    constructor(
        dbFriends: DBFriends = new DBFriends()
    ) {
        this._dbFriends = dbFriends
    }
   
    public async upsert(friends: Friend[]): Promise<void>
    {
        await this._dbFriends.upsert(friends)
    }

    public async saveFriends(user: string, friends: string[]): Promise<void>
    {
        const allfriends = friends.map((pubkey): Friend => ({
            user_pubkey: user,
            friend_pubkey: pubkey
        }))
        await this._dbFriends.upsert(allfriends)
    }    
}

export default FriendsService

