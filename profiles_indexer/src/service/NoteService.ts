import { NFile } from "../modules/types/File";
import { NostrEvent } from "../modules/types/NostrEvent";
import { Note, RefNote } from "../modules/types/Note";
import { RefPubkey } from "../modules/types/User";
import { Settings } from "../settings/types";
import { classifyUrl, distinct, extractTagsFromContent, extractUrls } from "../utils";
import { LoadDataProps } from "./commons";
import DBFiles from "./database/DBFiles";
import DBNotes from "./database/DBNotes";
import DBPubkeys from "./database/DBPubkeys";
import RelayService from "./RelayService";

class NoteService 
{
    private readonly _settings: Settings
    private readonly _dbNotes: DBNotes
    private readonly _dbFiles: DBFiles
    private readonly _dbPubkeys: DBPubkeys
    constructor(
        settings: Settings,
        dbNotes: DBNotes = new DBNotes(),
        dbFiles: DBFiles = new DBFiles(),
        dbPubkeys: DBPubkeys = new DBPubkeys()
    ) {
        this._settings = settings
        this._dbNotes = dbNotes 
        this._dbFiles = dbFiles 
        this._dbPubkeys = dbPubkeys
    }

    public async loadNotes({ pool, pubkeys, accumulateRelays }: LoadDataProps): Promise<void>
    {
        if(!pubkeys.length) return

        let skipe = this._settings.pubkeys_per_notes

        console.log(`loading notes...`)
        for(let i = 0; i < pubkeys.length; i += skipe) 
        {
            let events = await pool.fechEvents({
                authors: pubkeys.slice(i, i + skipe),
                limit: this._settings.max_fetch_notes, 
                kinds: [1, 30023, 30818]
            })

            console.log("found notes...:", events.length)
            // indexing notes
            const notes: Note[] = this.notesFromEvents(events) 
            await this._dbNotes.upsert(notes) 

            // indexing user references
            const pubkeyRefs = this.refPubkeys(events)
            await this._dbPubkeys.upRefs(pubkeyRefs)
            
            // indexing references
            const eventRefs = this.refEvents(events)
            await this._dbNotes.upRefs(eventRefs)
            
            // indexing files
            await this.loadFiles(notes)

            const relays = events.map(event => RelayService.relaysFromEvent(event))
            accumulateRelays(relays.flat())
        }
    }

    private async loadFiles(events: Note[]): Promise<void>
    {
        const files: NFile[] = []

        for (let event of events)
        {
            const urls = extractUrls(event.content)
            if (!urls.length) continue;

            for (const url of urls) {
                const type = classifyUrl(url)
                if(type != "other") {
                    files.push({
                        url,
                        type,
                        note_id: event.id,
                        pubkey: event.pubkey,
                        tags: event.tags
                    })
                }
            }
        }
        await this._dbFiles.upsert(files)
    }

    private notesFromEvents(events: NostrEvent[]): Note[]   
    {
        const notes: Note[] = [];
        for (const event of events)
        {
            const tags = extractTagsFromContent(event.content)
            for (const tag of event.tags)
            {
                if(tag[0] == "t") {
                    tag.forEach((t, i) => {
                        if(i >= 1) tags.push(t)
                    })
                }
                if (tag[0] == "alt") {
                    tags.push(tag[1])
                }
            }
            notes.push({
                id: event.id,
                kind: event.kind,
                pubkey: event.pubkey,
                title: this.extractTitle(event),
                content: event.content,
                created_at: event.created_at,
                tags: distinct(tags).join(" ")
            })
        }
        return notes;
    }

    private refPubkeys(events: NostrEvent[]): RefPubkey[]
    {
        const counts = new Map<string, number>();

        for (const event of events) {
            for (const tag of event.tags) {
                if (tag[0] !== "p") continue;

                const pubkey = tag[1];
                if (!pubkey || pubkey.length !== 64) continue;

                counts.set(pubkey, (counts.get(pubkey) ?? 0) + 1);
            }
        }

        return Array.from(counts.entries())
            .map(([pubkey, count]) => ({ pubkey, count }));
    }

    private refEvents(events: NostrEvent[]): RefNote[]
    {
        const counts = new Map<string, number>();

        for (const event of events) {
            for (const tag of event.tags) {
                if (tag[0] !== "e") continue;

                const id = tag[1];
                if (!id || id.length !== 64) continue;

                counts.set(id, (counts.get(id) ?? 0) + 1);
            }
        }

        return Array.from(counts.entries())
            .map(([id, count]) => ({ id, count }));
    }

    public filesFromEvents(events : NostrEvent[]): NFile[] 
    {
        const files: NFile[] = []
        events.forEach(event => {
            let urls: string[] = []
            event.tags.forEach(item => {
                if(item[0] == "imeta") {
                    for(let tag of item) {
                        const pick = tag.split(" ")
                        if(pick[0] == "url") urls.push(pick[0])
                    }
                }
                if(item[0] == "image")
                    urls.push(item[1])
            })
            
        })
        return files
    }

    private extractTitle(event: NostrEvent): string {
        const pick = (key: string) => {
            const tag = event.tags.find(t => t[0] === key);
            return tag?.[1]?.trim();
        };

        // Hierarquia: title -> summary -> subject -> description
        const raw =
            pick("title") ||
            pick("summary") ||
            pick("subject") ||
            pick("description");

        const limit = raw ? 255 : 100; // 255 para título/tag, 100 para fallback

        let text = raw || event.content.split("\n")[0].trim();

        // Remove markdown básico
        text = text.replace(/[#*_`>]+/g, "").trim();

        if (!text) return "(sem título)";

        // Se já couber no limite, retorna direto
        if (text.length <= limit) return text;

        // Truncar em limite, sem cortar palavra
        const truncated = text.slice(0, limit);
        const lastSpace = truncated.lastIndexOf(" ");
        return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim() + "…";
    }
}

export default NoteService
