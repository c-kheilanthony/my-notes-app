import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { AuthForm } from "./components/AuthForm";
import { NotesPage } from "./components/NotesPage";
import type { Session } from "@supabase/supabase-js";
import { Toaster } from "react-hot-toast";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Toaster position="top-right" />
      {session ? <NotesPage session={session} /> : <AuthForm />}
    </div>
  );
}

export default App;
