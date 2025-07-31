import { useState, useEffect } from "react";

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface NoteModalProps {
  note: Note | null;
  onClose: () => void;
  onSave: (note: Note) => void;
}

export default function NoteModal({ note, onClose, onSave }: NoteModalProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) setContent(note.content);
  }, [note]);

  if (!note) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 text-gray-100 max-w-2xl w-11/12 max-h-[90vh] p-8 rounded-2xl shadow-2xl overflow-y-auto relative animate-slideUp custom-scrollbar"
      >
        <h3 className="text-xl font-bold mb-4">Edit Note</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-gray-800 text-gray-100 p-4 rounded-md resize-none focus:outline-none mb-6 h-[60vh] overflow-y-auto custom-scrollbar"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...note, content })}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition"
          >
            Save
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
