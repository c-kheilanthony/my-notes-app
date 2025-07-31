import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import NotesList from "./NotesList";
import NoteModal from "./NoteModal";
import toast from "react-hot-toast";

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
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

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
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotes((prev) => [payload.new as Note, ...prev]);
          }
          if (payload.eventType === "DELETE") {
            setNotes((prev) =>
              prev.filter((n) => n.id !== (payload.old as Note).id)
            );
          }
          if (payload.eventType === "UPDATE") {
            setNotes((prev) =>
              prev.map((n) =>
                n.id === (payload.new as Note).id ? (payload.new as Note) : n
              )
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

    // Remove optimistic UI for add to avoid duplicates
    const { error } = await supabase.from("notes").insert({
      content: newContent,
      user_id: userId,
    });

    if (error) {
      console.error(error);
      toast.error("Failed to add note");
    } else {
      toast.success("Note added");
    }

    setNewContent(""); // Clear input after adding
  };

  const deleteNote = async (id: string) => {
    // Optimistic delete
    const previousNotes = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));

    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Failed to delete note");
      setNotes(previousNotes); // rollback
    } else {
      toast.success("Note deleted");
    }
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

      {/* Notes */}
      <NotesList
        notes={notes}
        onDelete={deleteNote}
        onSelect={setSelectedNote}
      />

      {/* Modal */}
      <NoteModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onSave={async (updatedNote) => {
          // Optimistic update
          setNotes((prev) =>
            prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
          );
          setSelectedNote(null);

          // Feedback: Loading
          toast.loading("Saving changes...");

          // API call
          const { error } = await supabase
            .from("notes")
            .update({ content: updatedNote.content })
            .eq("id", updatedNote.id);

          // Dismiss loader and show result
          toast.dismiss();
          if (error) {
            console.error(error);
            toast.error("Failed to update");
            fetchNotes(); // rollback to server state
          } else {
            toast.success("Note updated");
          }
        }}
      />
    </div>
  );
}

export default NotesPage;
