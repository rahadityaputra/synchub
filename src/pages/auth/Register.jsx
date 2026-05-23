import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../stores/useAuth";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(name, email, password);
    if (res?.success) {
      navigate("/login");
    } else {
      setError(res?.message || "Gagal register");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 p-6 rounded-lg border border-slate-800"
      >
        <h2 className="text-lg font-bold mb-4">Register</h2>
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <label className="block text-sm text-slate-300">Name</label>
        <input
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="block text-sm text-slate-300">Email</label>
        <input
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="block text-sm text-slate-300">Password</label>
        <input
          type="password"
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-emerald-600 px-3 py-2 rounded font-bold">
          Register
        </button>
        <p className="text-xs text-slate-400 mt-3">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-blue-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
