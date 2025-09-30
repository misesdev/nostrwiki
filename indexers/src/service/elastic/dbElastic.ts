import { Client } from '@elastic/elasticsearch';
import { Note } from '../../modules/types/Note';
import { User } from '../../modules/types/User';

class DBElastic 
{
    private readonly _client: Client
    constructor(
        client: Client = new Client({ 
            node: process.env.ELASTIC_URL // 'http://localhost:9200' 
        })
    ) 
    {
        this._client = client;
    }

    /**
     * Indexa notas em batch usando a API bulk
     */
    public async indexNotes(notes: Note[]): Promise<void>
    {
        if (!notes.length) return;

        const body = notes.flatMap(note => [
            { index: { _index: 'notes', _id: note.id } },
            {
                id: note.id,
                pubkey: note.pubkey,
                content: note.content,
                published_by: note.published_by,
                published_at: note.published_at,
                tags: note.tags
            }
        ])

        const bulkResponse = await this._client.bulk({ body })

        if (bulkResponse.errors) {
            const erroredDocuments: any[] = []
            bulkResponse.items.forEach((action, i) => {
                const operation = Object.keys(action)[0]
                if (action[operation].error) {
                    erroredDocuments.push({
                        status: action[operation].status,
                        error: action[operation].error,
                        document: notes[i]
                    })
                }
            })
            if (erroredDocuments.length) {
                console.error('Erros when indexing notes:', erroredDocuments)
            }
        }   
    }

    /**
     * Indexa usuários em batch usando a API bulk
     */
    public async indexUsers(users: User[]): Promise<void>
    {
        if (!users.length) return

        const body = users.flatMap(user => [
            { index: { _index: 'users', _id: user.pubkey } },
            {
                name: user.name,
                pubkey: user.pubkey,
                display_name: user.display_name,
                about: user.about,
                picture: user.picture,
                banner: user.banner
            }
        ])

        const bulkResponse = await this._client.bulk({ body })

        if (bulkResponse.errors) {
            const erroredDocuments: any[] = []
            bulkResponse.items.forEach((action, i) => {
                const operation = Object.keys(action)[0]
                if (action[operation].error) {
                    erroredDocuments.push({
                        status: action[operation].status,
                        error: action[operation].error,
                        document: users[i]
                    })
                }
            })

            if (erroredDocuments.length) {
                console.error('Error when indexing users:', erroredDocuments)
            }
        }   
    }
}

export default DBElastic
