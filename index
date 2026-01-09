import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  doc
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Settings,
  ArrowLeft
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rsvp-manager';

// --- Constants ---
const ADMIN_PASSWORD = "admin123"; // Simple password for the dashboard demo

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('invite'); // 'invite', 'dashboard'
  const [formStatus, setFormStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [responses, setResponses] = useState([]);
  const [adminAuth, setAdminAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // Firebase Auth Setup
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Fetch RSVP Responses (for Dashboard)
  useEffect(() => {
    if (!user || !adminAuth) return;

    const rsvpsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
    const q = query(rsvpsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleString() || 'N/A'
      }));
      setResponses(data);
    }, (err) => {
      console.error("Firestore error:", err);
    });

    return () => unsubscribe();
  }, [user, adminAuth]);

  const handleRSVPSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setFormStatus('submitting');
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      attending: formData.get('attending') === 'yes',
      guests: parseInt(formData.get('guests') || 0),
      dietary: formData.get('dietary'),
      timestamp: new Date()
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'rsvps'), data);
      setFormStatus('success');
    } catch (err) {
      console.error(err);
      setFormStatus('error');
    }
  };

  const exportToCSV = () => {
    if (responses.length === 0) return;

    const headers = ["Name", "Email", "Attending", "Guests", "Dietary", "Submitted At"];
    const rows = responses.map(r => [
      `"${r.name}"`,
      `"${r.email}"`,
      r.attending ? "Yes" : "No",
      r.guests,
      `"${r.dietary || ''}"`,
      `"${r.timestamp}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rsvp_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAdminAuth(true);
      setView('dashboard');
    } else {
      alert("Incorrect password.");
    }
  };

  // --- UI Components ---

  const InvitationView = () => (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-12 px-4">
      {/* Header Card */}
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
        <div className="h-48 bg-stone-800 flex items-center justify-center text-center p-8">
          <div className="border-2 border-stone-400 p-6">
            <h1 className="text-white text-4xl font-serif tracking-widest uppercase">The Celebration</h1>
            <p className="text-stone-300 mt-2 font-light tracking-widest">WINTER TWO THOUSAND TWENTY SIX</p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="space-y-6 text-center mb-10">
            <h2 className="text-2xl font-serif text-stone-800 italic">Save the Date</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-stone-600">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-stone-400" />
                <span>January 24, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-stone-400" />
                <span>5:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-stone-400" />
                <span>The Grand Manor, London</span>
              </div>
            </div>
            <p className="text-stone-500 leading-relaxed max-w-sm mx-auto">
              Please join us for an evening of dinner, drinks, and dancing as we celebrate our journey together.
            </p>
          </div>

          {formStatus === 'success' ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center animate-in fade-in duration-500">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-green-800">Response Received!</h3>
              <p className="text-green-600 mt-2">Thank you for letting us know. We can't wait to see you.</p>
              <button
                onClick={() => setFormStatus('idle')}
                className="mt-6 text-green-700 underline text-sm"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleRSVPSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-stone-500">Full Name</label>
                  <input required name="name" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-stone-500">Email Address</label>
                  <input required type="email" name="email" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none" placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-500 block">Will you attend?</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                    <input required type="radio" name="attending" value="yes" className="accent-stone-800" />
                    <span className="text-stone-700">Joyfully Attend</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                    <input required type="radio" name="attending" value="no" className="accent-stone-800" />
                    <span className="text-stone-700">Decline</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-500">Additional Guests</label>
                <select name="guests" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none">
                  <option value="0">Just me</option>
                  <option value="1">Plus one (1)</option>
                  <option value="2">Plus two (2)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-500">Dietary Requirements / Notes</label>
                <textarea name="dietary" rows="3" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none" placeholder="Allergies, song requests, etc."></textarea>
              </div>

              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full bg-stone-800 text-white py-4 rounded-xl font-medium tracking-widest uppercase hover:bg-stone-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {formStatus === 'submitting' ? 'Sending...' : 'Send Response'}
              </button>
            </form>
          )}
        </div>
      </div>

      <button
        onClick={() => setView('login')}
        className="mt-8 text-stone-400 hover:text-stone-600 flex items-center gap-1 text-sm transition-colors"
      >
        <Settings size={14} /> Admin Access
      </button>
    </div>
  );

  const DashboardView = () => {
    const totalAttending = responses.filter(r => r.attending).length;
    const totalGuests = responses.filter(r => r.attending).reduce((acc, curr) => acc + (curr.guests || 0), 0);
    const totalHeadcount = totalAttending + totalGuests;

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <button
                onClick={() => setView('invite')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-2 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Invitation
              </button>
              <h1 className="text-3xl font-bold text-slate-900">RSVP Dashboard</h1>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Download size={18} /> Export Results (CSV)
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Attending Responses</p>
                  <p className="text-2xl font-bold text-slate-900">{totalAttending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Additional Guests</p>
                  <p className="text-2xl font-bold text-slate-900">{totalGuests}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Headcount</p>
                  <p className="text-2xl font-bold text-slate-900">{totalHeadcount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Guest Name</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Additional Guests</th>
                    <th className="px-6 py-4 font-semibold">Notes / Dietary</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {responses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No responses received yet.</td>
                    </tr>
                  ) : (
                    responses.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((resp) => (
                      <tr key={resp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{resp.name}</div>
                          <div className="text-xs text-slate-500">{resp.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          {resp.attending ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                              <CheckCircle size={12} /> ATTENDING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                              <XCircle size={12} /> DECLINED
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{resp.guests || 0}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 max-w-xs truncate" title={resp.dietary}>
                            {resp.dietary || <span className="text-slate-300 italic">None</span>}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">{resp.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminLogin = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
          <p className="text-slate-500 mt-2">Enter the password to access RSVP results.</p>
        </div>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="password"
            autoFocus
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter password (default: admin123)"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
            Access Dashboard
          </button>
          <button
            type="button"
            onClick={() => setView('invite')}
            className="w-full text-slate-400 text-sm hover:underline mt-2"
          >
            Cancel and Return to Invitation
          </button>
        </form>
      </div>
    </div>
  );

  // Main Router
  switch(view) {
    case 'dashboard': return <DashboardView />;
    case 'login': return <AdminLogin />;
    default: return <InvitationView />;
  }
}
