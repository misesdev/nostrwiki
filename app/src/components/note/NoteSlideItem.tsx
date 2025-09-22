import { Note } from "@/types/types"
import { format } from "date-fns";
import NoteContent from "./NoteContent";
import AppImage from "../commons/AppImage";
import { normalizeUser } from "@/utils/utils";

type Props = { item: Note; }

const NoteSlideItem = ({ item }: Props) => {

    const author = normalizeUser(item.author)
    const date = format(new Date(item.published_at * 1000), "dd MMM yyyy")
    const words = item.title.split(" ").filter(t => t.length <= 15)
    const title = words.length ? words.join(" ") : null

    return (
        <div className="relative bg-gray-800 bg-opacity-35 rounded-xl shadow-2xl text-gray-200 max-w-3xl w-full max-h-[90vh] min-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-6 sm:p-10">
            <div className="flex items-center gap-4 mb-6">
                <AppImage
                    width={75}
                    height={75}
                    src={author.picture}
                    onError={"/default-avatar.png"}
                    alt={author.display_name || author.name}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-gray-700"
                />
                <div>
                    <p className="text-[14px] md:text-lg font-semibold">
                        {author.display_name || author.name}
                    </p>
                    <p className="text-[12px] md:text-sm text-gray-400">{date}</p>
                </div>
            </div>

            {title && (
                <h2 className="text-[14px] md:text-1xl font-bold mb-4 text-white">
                    {title}
                </h2>
            )}

            <div className="prose dark:prose-invert leading-relaxed">
                <NoteContent note={item} />
            </div>
        </div>
    )
}

export default NoteSlideItem
