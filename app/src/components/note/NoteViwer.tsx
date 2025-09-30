import { Note } from "@/types/types"
import NoteContent from "./NoteContent";
import { format } from "date-fns"

type NoteViewrProps = {
    note: Note;
}

const NoteViewr = ({ note }: NoteViewrProps) => {
    // const words = note.title.split(" ").filter(t => t.length <= 15)
    // const title = words.length ? words.join(" ") : null
    return (
        <div 
            key={note.id} 
            className="overflow-hidden my-2 w-full bg-gray-900 bg-opacity-65 rounded-xl p-4 shadow-md transition hover:shadow-lg"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] md:text-sm text-gray-500">
                    {format(new Date(note.published_at * 1000), "dd MMM yyyy")}
                </span>
            </div>
            {/* {title && note.kind != 1 && ( */}
            {/*     <h3 className="text-[14px] md:text-lg font-semibold text-gray-200 mb-2"> */}
            {/*         {title} */}
            {/*     </h3> */}
            {/* )} */}
            <NoteContent note={note} />
        </div>
    )
}

export default NoteViewr
