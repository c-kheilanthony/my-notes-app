import NoteCard from "./NoteCard";

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface NotesListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  onSelect: (note: Note) => void;
}

export default function NotesList({
  notes,
  onDelete,
  onSelect,
}: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 mt-10">
        <p className="text-lg">No notes yet...</p>
        <p className="text-sm">Start writing something amazing! ✍️</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
