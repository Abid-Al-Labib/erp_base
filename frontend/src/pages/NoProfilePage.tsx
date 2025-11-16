import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { supabase_client } from "@/services/SupabaseClient";

const NoProfilePage = () => {
  const { setSession, setProfile } = useAuth();
  const navigate = useNavigate();


   const handleLogout = async () => {
        const { error } = await supabase_client.auth.signOut()
        if (error) {
            toast.error(error.message)
        }
        setSession(null);
        setProfile(null);
        navigate('/login')
    }
    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-6">
      <div className="bg-card p-8 rounded-2xl shadow-md text-center max-w-sm w-full border">
        <div className="text-5xl mb-4">(×_×)</div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Couldn't sync your profile
        </h1>
        <p className="text-muted-foreground mb-6">Please log back in and try again.</p>
        <button
          onClick={handleLogout}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium px-6 py-2 rounded-lg transition"
        >
          Log Back In
        </button>
      </div>
    </div>
  );
};

export default NoProfilePage;
