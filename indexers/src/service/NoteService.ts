import { NFile } from "../modules/types/File";
import { NostrEvent } from "../modules/types/NostrEvent";
import { Note, RefNote } from "../modules/types/Note";
import { RefPubkey, User } from "../modules/types/User";
import { Settings } from "../settings/types";
import { checkMediaAccessible, distinct, distinctFiles, distinctNotes, extractTagsFromContent, extractUrls, mediaType } from "../utils";
import { LoadNotesProps } from "./commons";
import DBFiles from "./database/DBFiles";
import DBNotes from "./database/DBNotes";
import DBUsers from "./database/DBUsers";
import RelayService from "./RelayService";
const pLimit = require("p-limit");

class NoteService 
{
    private readonly _settings: Settings
    private readonly _dbNotes: DBNotes
    private readonly _dbFiles: DBFiles
    private readonly _dbUsers: DBUsers
    constructor(
        settings: Settings,
        dbNotes: DBNotes = new DBNotes(),
        dbFiles: DBFiles = new DBFiles(),
        dbUsers: DBUsers = new DBUsers()
    ) {
        this._settings = settings
        this._dbNotes = dbNotes 
        this._dbFiles = dbFiles 
        this._dbUsers = dbUsers
    }

    public async loadNotes({ pool, users, accumulateRelays }: LoadNotesProps): Promise<void>
    {
        if(!users.length) return

        let skipe = this._settings.pubkeys_per_notes

        console.log(`loading notes...`)
        for(let i = 0; i < users.length; i += skipe) 
        {
            const authors = users.slice(i, i + skipe)
            let events = await pool.fechEvents({
                authors: authors.map(u => u.pubkey),
                limit: this._settings.max_fetch_notes, 
                kinds: [1, 30023, 30818]
            })

            console.log("found notes...:", events.length)
            // indexing notes
            const notes: Note[] = this.notesFromEvents(events, authors) 
            console.log("saving", notes.length, "notes and indexing on elastic search")
            await this._dbNotes.upsert(notes) 

            // indexing user references
            const pubkeyRefs = this.refPubkeys(events)
            console.log("update", pubkeyRefs.length, "pubkey references")
            await this._dbUsers.upRefs(pubkeyRefs)
            
            // indexing references
            const eventRefs = this.refEvents(events)
            console.log("update", eventRefs.length, "notes references")
            await this._dbNotes.upRefs(eventRefs)
            
            // indexing files
            await this.loadFiles(notes)

            const relays = events.map(event => RelayService.relaysFromEvent(event))
            accumulateRelays(relays.flat())
        }
    }

    private notesFromEvents(events: NostrEvent[], authors: User[]): Note[]   
    {
        const notes: Note[] = [];
        for (const event of events)
        {
            let tags = extractTagsFromContent(event.content)
            for (const tag of event.tags)
            {
                if(tag[0] == "t") {
                    tag.forEach((t, i) => {
                        if(i >= 1) tags.push(t)
                    })
                }
                if (tag[0] == "alt") 
                    tags.push(tag[1])
            }
            if(!tags.length) 
            {
                tags = event.content.split(" ")
                    .filter(l => l.length <= 15)
                    .slice(0, 6)
            }
            const author = authors.find(u => u.pubkey == event.pubkey)
            notes.push({
                id: event.id,
                kind: event.kind,
                pubkey: event.pubkey,
                title: this.extractTitle(event),
                content: event.content,
                published_by: author?.display_name,
                published_at: event.created_at,
                tags: distinct(tags).join(" "),
                created_at: new Date(),
                ref_count: 1
            })
        }
        return distinctNotes(notes);
    }

    private async loadFiles(events: Note[]): Promise<void>
    {
        const files: NFile[] = []

        for (let event of events)
        {
            const urls = extractUrls(event.content)
            if (!urls.length) continue;

            for (const url of urls) {
                const type = mediaType(url)
                const description = event.content
                    .split(" ").filter(t => t.length <= 15).slice(0, 25).join(" ")
                files.push({
                    url,
                    type,
                    title: event.title,
                    description: description,
                    published_by: event.published_by,
                    published_at: event.published_at,
                    note_id: event.id,
                    pubkey: event.pubkey,
                    tags: event.tags,
                    created_at: new Date(),
                    ref_count: 1
                })
            }
        }
        
        let betch = 25
        const limit = pLimit(10)
        const validFiles: NFile[] = []
        for(let i = 0; i < files.length; i += betch)
        {
            const betchFiles = files.slice(i, i+betch)
            const results = await Promise.all(
                betchFiles.map(async file => limit(async () => {
                    const valid = await checkMediaAccessible(file.url)
                    if(valid) return file
                    return null
                }))
            )
            const allFiles: NFile[] = distinctFiles(results.flat())
            validFiles.push(...allFiles)
        }
        console.log("saving", validFiles.length, "files from notes")
        await this._dbFiles.upsert(validFiles)
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
