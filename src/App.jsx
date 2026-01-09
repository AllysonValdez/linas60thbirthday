import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
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

const firebaseConfig = {
  apiKey: "AIzaSyDsKREE3DWSkQ1g2vcVrxEEMlCeep8YA8Q",
  authDomain: "invitation-956d2.firebaseapp.com",
  projectId: "invitation-956d2",
  storageBucket: "invitation-956d2.firebasestorage.app",
  messagingSenderId: "450944931662",
  appId: "1:450944931662:web:8ea9a098d3e290bd82301f",
  measurementId: "G-7BKFL3R8ZQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "invitation-956d2";
const ADMIN_PASSWORD = "admin123"; 

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('invite'); 
  const [formStatus, setFormStatus] = useState('idle'); 
  const [responses, setResponses] = useState([]);
  const [adminAuth, setAdminAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

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
    }, (err) => console.error("Firestore error:", err));
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
      setFormStatus('error');
    }
  };

  const exportToCSV = () => {
    if (responses.length === 0) return;
    const headers = ["Name", "Email", "Attending", "Guests", "Dietary", "Submitted At"];
    const rows = responses.map(r => [`"${r.name}"`, `"${r.email}"`, r.attending ? "Yes" : "No", r.guests, `"${r.dietary || ''}"`, `"${r.timestamp}"`]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rsvp_list.csv`);
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

  if (view === 'dashboard') {
    const totalAttending = responses.filter(r => r.attending).length;
    const totalGuests = responses.filter(r => r.attending).reduce((acc, curr) => acc + (curr.guests || 0), 0);

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => setView('invite')} className="flex items-center gap-2 text-slate-500 text-sm"><ArrowLeft size={16} /> Back</button>
            <button onClick={exportToCSV} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"><Download size={16} /> Export CSV</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Responses</p>
              <p className="text-2xl font-black text-slate-800">{responses.length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Attending</p>
              <p className="text-2xl font-black text-emerald-600">{totalAttending}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Headcount</p>
              <p className="text-2xl font-black text-indigo-600">{totalAttending + totalGuests}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr><th className="px-6 py-4">Guest</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Plus</th><th className="px-6 py-4">Notes</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.map((resp) => (
                  <tr key={resp.id}>
                    <td className="px-6 py-4 font-bold text-slate-800">{resp.name}<div className="font-normal text-slate-400 text-[11px]">{resp.email}</div></td>
                    <td className="px-6 py-4">{resp.attending ? <span className="text-emerald-600 font-bold">YES</span> : <span className="text-rose-500 font-bold">NO</span>}</td>
                    <td className="px-6 py-4 text-slate-500">{resp.guests}</td>
                    <td className="px-6 py-4 text-slate-400 italic">{resp.dietary || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-xs w-full bg-white rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-center mb-6">Admin Access</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input type="password" autoFocus className="w-full px-4 py-3 bg-slate-50 border rounded-lg outline-none" placeholder="Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">Login</button>
            <button type="button" onClick={() => setView('invite')} className="w-full text-slate-400 text-xs hover:underline text-center block mt-2">Return</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
        <div className="h-48 bg-stone-800 flex items-center justify-center text-center p-8">
          <div className="border-2 border-stone-400 p-6">
            <h1 className="text-white text-3xl font-serif tracking-widest uppercase">The Celebration</h1>
            <p className="text-stone-300 mt-2 font-light tracking-widest text-xs">WINTER TWO THOUSAND TWENTY SIX</p>
          </div>
        </div>
        <div className="p-8 md:p-12">
          <div className="space-y-6 text-center mb-10">
            <h2 className="text-2xl font-serif text-stone-800 italic">Save the Date</h2>
            <div className="flex flex-col gap-3 text-stone-600 text-sm">
              <div className="flex items-center justify-center gap-2"><Calendar size={16} /><span>January 24, 2026</span></div>
              <div className="flex items-center justify-center gap-2"><Clock size={16} /><span>5:30 PM</span></div>
              <div className="flex items-center justify-center gap-2"><MapPin size={16} /><span>The Grand Manor, London</span></div>
            </div>
          </div>
          {formStatus === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center">
              <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-emerald-800">Response Sent!</h3>
              <p className="text-emerald-600 mt-2">We can't wait to see you.</p>
              <button onClick={() => setFormStatus('idle')} className="mt-6 text-emerald-700 underline text-sm">Submit another</button>
            </div>
          ) : (
            <form onSubmit={handleRSVPSubmit} className="space-y-5">
              <input required name="name" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg outline-none" placeholder="Full Name" />
              <input required type="email" name="email" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg outline-none" placeholder="Email Address" />
              <div className="flex gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer">
                  <input required type="radio" name="attending" value="yes" className="accent-stone-800" />
                  <span className="text-sm">Attending</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer">
                  <input required type="radio" name="attending" value="no" className="accent-stone-800" />
                  <span className="text-sm">Decline</span>
                </label>
              </div>
              <select name="guests" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg outline-none">
                <option value="0">No additional guests</option>
                <option value="1">Plus 1</option>
                <option value="2">Plus 2</option>
              </select>
              <textarea name="dietary" rows="2" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg outline-none" placeholder="Special notes (optional)"></textarea>
              <button type="submit" disabled={formStatus === 'submitting'} className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-stone-700 disabled:opacity-50">
                {formStatus === 'submitting' ? 'Sending...' : 'Send RSVP'}
              </button>
            </form>
          )}
        </div>
      </div>
      <button onClick={() => setView('login')} className="mt-8 text-stone-400 hover:text-stone-600 flex items-center gap-1 text-xs">
        <Settings size={12} /> Admin Login
      </button>
    </div>
  );
}
