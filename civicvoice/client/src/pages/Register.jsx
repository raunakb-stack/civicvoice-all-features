import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'Roads & Infrastructure', 'Sanitation & Waste',
  'Street Lighting', 'Water Supply', 'Parks & Gardens', 'General',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'citizen',
    department: 'General', city: 'Amravati', phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to CivicVoice, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-civic-500 rounded-2xl shadow-lg shadow-civic-500/30 mb-4">
            <span className="font-display text-white text-2xl tracking-wider">CV</span>
          </div>
          <h1 className="font-display text-4xl tracking-wider text-stone-900">CivicVoice</h1>
          <p className="text-stone-500 text-sm mt-1">Create your account</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input name="name" required value={form.name} onChange={handleChange}
                  className="input" placeholder="Your full name" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="input" placeholder="your@email.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
                <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange}
                  className="input" placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="input">
                  <option value="citizen">Citizen</option>
                  <option value="department">Department</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">City</label>
                <input name="city" value={form.city} onChange={handleChange} className="input" />
              </div>
              {form.role === 'department' && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select name="department" value={form.department} onChange={handleChange} className="input">
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Phone (optional)</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+91 98765 43210" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? '⏳ Creating account…' : '→ Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-stone-500 mt-5">
            Have an account?{' '}
            <Link to="/login" className="text-civic-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
