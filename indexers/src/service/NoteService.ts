import { NFile } from "../modules/types/File";
import { EventLink, NostrEvent } from "../modules/types/NostrEvent";
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
        let oldestSince: number|undefined = undefined

        const allHaveSince = users.every(user => user.since !== null)
        if(allHaveSince)
            oldestSince = users
              .map(user => user.since)
              .filter((s): s is number => s !== null && s !== undefined)
              .reduce((min, s) => Math.min(min, s), Number.MAX_SAFE_INTEGER)

        console.log(`loading notes...`)
        for(let i = 0; i < users.length; i += skipe) 
        {
            const authors = users.slice(i, i + skipe)
            let events = await pool.fechEvents({
                authors: authors.map(u => u.pubkey),
                limit: this._settings.max_fetch_notes,
                kinds: [1, 30023, 30818],
                since: oldestSince
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
            const metaUrls = this.urlsFromEvents(events)
            await this.loadFiles(notes, metaUrls)

            const relays = events.map(event => RelayService.relaysFromEvent(event))
            accumulateRelays(relays.flat())
        }
    }

    private notesFromEvents(events: NostrEvent[], authors: User[]): Note[]   
    {
        const notes = new Map<string, Note>();
        for (const event of events)
        {
            // nao indexar notas muito curtas sem links
            if(!this.isIndexable(event)) continue;

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
                    .filter(l => l.length <= 12)
                    .slice(0, 6)
            }
            const author = authors.find(u => u.pubkey == event.pubkey)
            notes.set(event.id, {
                id: event.id,
                kind: event.kind,
                pubkey: event.pubkey,
                title: this.extractTitle(event).substring(0, 255),
                content: event.content,
                published_by: (author?.display_name || author?.name)?.substring(0, 100),
                published_at: event.created_at,
                tags: distinct(tags).slice(0, 10).join(" "),
                created_at: new Date(),
                ref_count: 1
            })
        }
        return Array.from(notes.values());
    }

    private async loadFiles(events: Note[], metaUrls: EventLink[]): Promise<void>
    {
        const files = new Map<string, NFile>()
        for (let event of events)
        {
            const links: string[] = metaUrls
                .filter(l => l.id == event.id && !!l?.link).map(l => l.link)

            links.push(...extractUrls(event.content))

            if (!links.length) continue;

            for (const url of links) 
            {
                if(!url) continue;
                const type = mediaType(url)
                const description = event.content
                    .split(" ").filter(t => t.length <= 15).slice(0, 25).join(" ")
                files.set(url, {
                    url,
                    type,
                    note_id: event.id,
                    title: event.title.substring(0, 255),
                    description: description,
                    published_by: event.published_by?.substring(0, 100),
                    published_at: event.published_at,
                    pubkey: event.pubkey,
                    tags: event.tags?.substring(0, 512),
                    created_at: new Date(),
                    ref_count: 1
                })
            }
        }

        let betch = 25
        const limit = pLimit(10)
        const validFiles: NFile[] = []
        const uniqueFiles = Array.from(files.values())
        for(let i = 0; i < uniqueFiles.length; i += betch)
        {
            const betchFiles = uniqueFiles.slice(i, i+betch)
            const results = await Promise.all(
                betchFiles.map(async file => limit(async () => {
                    const valid = await checkMediaAccessible(file.url)
                    if(valid) return file
                    return null
                }))
            )
            const allFiles: NFile[] = results.flat()
            validFiles.push(...allFiles.filter(f => !!f?.url))
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

    public urlsFromEvents(events : NostrEvent[]): EventLink[] 
    {
        let urls = new Map<string, EventLink>()
        events.forEach(event => {
            event.tags.forEach(item => {
                if(item[0] == "imeta") {
                    for(let tag of item) {
                        const pick = tag.split(" ")
                        if(pick[0] == "url")
                            urls.set(pick[1], { link: pick[1], id: event.id })
                    }
                }
                if(item[0] == "image")
                    urls.set(item[1], { link: item[1], id: event.id })
            })
        })
        return Array.from(urls.values())
                    .filter(link => !!link?.link)
    }

    private isIndexable(event: NostrEvent): boolean 
    {
        const MIN_CONTENT_LENGTH = 50;
        // Sempre indexar se tiver links de arquivos/media
        const hasFile = (
            /https?:\/\/\S+\.(jpg|jpeg|png|gif|mp4|webm|pdf|mp3|ogg|wav)/i.test(event.content) ||
            !!this.urlsFromEvents([event]).length
        );
        // Ignorar se for comentário/reply (tags tipo "e" indicam referências a outros eventos)
        const isReply = event.tags.some(t => t[0] === "e");
        // Conteúdo muito curto sem arquivos não vale a pena indexar
        const isTooShort = event.content.trim().length < MIN_CONTENT_LENGTH;
        // Filtro de conteúdo vazio ou só links de npub/nprofile/note/nevent/naddr
        const cleaned = event.content
            .replace(/\b(npub|nprofile|note|nevent|naddr)1[0-9a-z]{50,}\b/g, "")
            .replace(/\s+/g, " ")
            .trim();
        const isEmptyAfterClean = cleaned.length === 0;
        // Decisão final
        return !isReply && (hasFile || (!isTooShort && !isEmptyAfterClean));
    }

    private extractTitle(event: NostrEvent): string {
        const pickTag = (key: string) => {
            const tag = event.tags.find(t => t[0] === key);
            return tag?.[1]?.trim();
        };

        // Hierarquia: title -> summary -> subject -> description
        let raw =
            pickTag("title") ||
            pickTag("summary") ||
            pickTag("subject") ||
            pickTag("description") ||
            event.content.split("\n")[0].trim();

        // Se ainda estiver vazio, usar tags curtas como fallback
        if (!raw) {
            const shortTag = event.tags
                .map(t => t[1])
                .filter(Boolean)
                .find(t => t.length <= 25); // tags curtas
            raw = shortTag || "";
        }

        // Remove markdown, links, npub/nprofile/mentions
        let text = raw
            .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline code/block code
            .replace(/!\[.*?\]\(.*?\)/g, "") // images
            .replace(/\[.*?\]\(.*?\)/g, "") // links
            .replace(/[#*_>~]+/g, "") // outros markdown
            .replace(/\b(npub|nprofile|note|nevent|naddr)1[0-9a-z]{50,}\b/g, "") // Nostr refs
            .replace(/@\w+/g, "") // mentions simples
            .replace(/\s+/g, " ") // múltiplos espaços
            .trim();

        if (!text) return "(without title)";

        // Pegar apenas até o primeiro ponto relevante dentro das primeiras 10–15 palavras
        let truncatedWords = text.split(" ").slice(0, 12);

        // Procurar ponto que não faça parte de abreviações
        for (let i = 0; i < truncatedWords.length; i++) {
            const w = truncatedWords[i];
            if (/\.$/.test(w) && !/\d+\.$/.test(w) && !/\w+\-\d+\.$/.test(w)) {
                truncatedWords = truncatedWords.slice(0, i + 1);
                break;
            }
        }

        const finalText = truncatedWords.join(" ").trim();

        return finalText.split(" ").slice(0, 15).join(" ");
    }
}

export default NoteService
