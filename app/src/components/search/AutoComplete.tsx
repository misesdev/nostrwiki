import { Note, User } from "@/types/types";
import { normalizeNote, normalizeUser } from "@/utils/utils";
import AppImage from "../commons/AppImage";
import { AiOutlineSearch } from "react-icons/ai";

type AutoCompleteProps = {
    results: any[];
    onSearch: (t: string) => void;
}

const AutoComplete = ({ results, onSearch }: AutoCompleteProps) => {
    return (
        <div className="w-full bg-gray-800 bg-opacity-15 mt-5 rounded-b-lg overflow-y-auto max-h-64 z-50 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {results.map((hit) => {
                    const item = hit._source;
                    if (hit._index === 'users') {
                        const user: User = normalizeUser(item as User);
                        return (
                            <div key={hit._id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
                                onClick={() => onSearch(user.display_name||user.name)}
                            >
                                <AppImage
                                    width={100}
                                    height={100}
                                    src={user.picture}
                                    alt={user.display_name || user.name}
                                    className="w-10 h-10 rounded-full border border-gray-700"
                                    onError="/default-avatar.png"
                                />
                                <div className="flex flex-col">
                                    <span className="text-gray-200 font-medium">
                                        {user.display_name ?? user.name}
                                    </span>
                                    {user.about && (
                                        <span className="text-gray-400 text-sm truncate max-w-xs">
                                            {user.about}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    } else if (hit._index === 'notes') {
                        const note: Note = normalizeNote(item as Note);
                        return (
                            <div 
                                key={hit._id}
                                className="flex p-3 hover:bg-gray-700 cursor-pointer"
                                onClick={() => onSearch(note.title)}
                            >
                                <AiOutlineSearch
                                    className="text-sm my-1 mx-2 sm:inline-flex text-gray-500 cursor-pointer"
                                /> {' '}
                                <span className="text-gray-200 text-sm truncate block">
                                    {note.title ?? note.content?.slice(0, 50) + '...'}
                                </span>
                            </div>
                        );
                    }
                })}
        </div>
    )
}

export default AutoComplete

