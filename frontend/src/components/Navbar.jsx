import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-500/60 flex items-center justify-center text-blue-400 text-xs font-bold">
            AI
          </div>
          <span className="text-sm font-semibold text-slate-100 hidden sm:inline">
            AI-Powered Resource Engine
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          {user && (
            <>
              <span className="hidden sm:inline">
                {user.name || "User"} ·{" "}
                <span className="uppercase tracking-wide">
                  {user.role === "admin" ? "ADMIN" : "USER"}
                </span>
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

