import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface NotesPageProps {
  session: Session;
}

export function NotesPage({ session }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newContent, setNewContent] = useState("");

  //modal state & handlers
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const openModal = (note: Note) => setSelectedNote(note);
  const closeModal = () => setSelectedNote(null);

  const userId = session.user.id;

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else if (data) setNotes(data as Note[]);
  };

  useEffect(() => {
    fetchNotes();

    const channel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        (payload) => {
          if (
            payload.eventType === "INSERT" &&
            payload.new.user_id === userId
          ) {
            setNotes((prev) => [payload.new as Note, ...prev]);
          }
          if (
            payload.eventType === "DELETE" &&
            payload.old.user_id === userId
          ) {
            setNotes((prev) =>
              prev.filter((n) => n.id !== (payload.old as Note).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const addNote = async () => {
    if (!newContent.trim()) return;
    const { error } = await supabase.from("notes").insert({
      content: newContent,
      user_id: userId,
    });
    if (error) console.error(error);
    else setNewContent("");
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) console.error(error);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full max-w-4xl p-8 bg-gray-900 rounded-2xl shadow-2xl min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">
          Hello, {session.user.email}
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-300 hover:text-red-400 transition"
        >
          Logout
        </button>
      </div>

      {/* Input */}
      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Write a new note..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="flex-grow px-4 py-3 bg-gray-800 text-gray-100 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        <button
          onClick={addNote}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-r-xl hover:from-purple-600 hover:to-blue-600 transition"
        >
          Add
        </button>
      </div>

      {/* Notes Grid */}
      <h2 className="text-xl text-gray-300 mb-4">Your Notes</h2>
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 mt-10">
          <p className="text-lg">No notes yet...</p>
          <p className="text-sm">Start writing something amazing! ✍️</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => openModal(note)}
              className="bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105 flex flex-col justify-between cursor-pointer"
            >
              <p className="text-gray-100 text-lg break-words line-clamp-4 overflow-hidden">
                {note.content}
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(note);
                  }}
                  className="text-indigo-400 hover:text-indigo-500 text-sm font-medium"
                >
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="text-red-400 hover:text-red-500 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedNote && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 text-gray-100 max-w-2xl w-11/12 max-h-[90vh] p-8 rounded-2xl shadow-2xl overflow-y-auto relative"
          >
            <h3 className="text-xl font-bold mb-4">Full Note</h3>
            <textarea
              readOnly
              value={selectedNote.content}
              className="w-full bg-gray-800 text-gray-100 p-4 rounded-md resize-none focus:outline-none mb-6 h-[60vh] overflow-y-auto custom-scrollbar"
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
