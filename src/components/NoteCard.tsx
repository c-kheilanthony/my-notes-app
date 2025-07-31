interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onSelect: (note: Note) => void;
}

export default function NoteCard({ note, onDelete, onSelect }: NoteCardProps) {
  return (
    <div
      onClick={() => onSelect(note)}
      className="bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105 flex flex-col justify-between cursor-pointer"
    >
      <p className="text-gray-100 text-lg break-words line-clamp-4 overflow-hidden">
        {note.content}
      </p>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(note);
          }}
          className="text-indigo-400 hover:text-indigo-500 text-sm font-medium"
        >
          View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-red-400 hover:text-red-500 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
