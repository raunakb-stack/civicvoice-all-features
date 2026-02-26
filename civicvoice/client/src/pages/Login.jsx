import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  // Demo fill
  const fillDemo = (role) => {
    const demos = {
      citizen:    { email: 'citizen@demo.com',    password: 'demo1234' },
      department: { email: 'department@demo.com', password: 'demo1234' },
      admin:      { email: 'admin@demo.com',       password: 'demo1234' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-civic-500 rounded-2xl shadow-lg shadow-civic-500/30 mb-4">
            <span className="font-display text-white text-2xl tracking-wider">CV</span>
          </div>
          <h1 className="font-display text-4xl tracking-wider text-stone-900">CivicVoice</h1>
          <p className="text-stone-500 text-sm mt-1">Smart Municipal Transparency Platform</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="input" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange}
                className="input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? '⏳ Signing in…' : '→ Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {['citizen', 'department', 'admin'].map(r => (
                <button key={r} onClick={() => fillDemo(r)}
                  className="text-xs py-1.5 px-2 rounded-lg border border-stone-200 text-stone-600 hover:border-civic-400 hover:text-civic-600 transition capitalize font-medium">
                  {r}
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2 text-center">Password: <code className="font-mono">demo1234</code></p>
          </div>

          <p className="text-center text-sm text-stone-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-civic-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
