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
  CheckCircle, 
  Settings, 
  ArrowLeft, 
  Database, 
  ShieldAlert, 
  CalendarPlus, 
  Heart, 
  Lock, 
  Flower, 
  Phone, 
  Mail, 
  Shirt
} from 'lucide-react';

// --- CUSTOMIZATION ---
const HEADER_VIDEO_URL = "White And Golden Floral Botanical Simple 60th Birthday Party Invitation.mp4"; 

// --- Firebase Configuration ---
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

// --- Animation Component ---
const FloatingFlowers = () => {
  const [flowers, setFlowers] = useState([]);
  useEffect(() => {
    const newFlowers = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      size: 15 + Math.random() * 25,
      rotation: Math.random() * 360
    }));
    setFlowers(newFlowers);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        .flower-particle {
          position: absolute;
          bottom: -50px;
          animation: floatUp linear infinite;
        }
      `}</style>
      {flowers.map((f) => (
        <div key={f.id} className="flower-particle text-rose-200" style={{ left: `${f.left}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s` }}>
          <Flower size={f.size} style={{ transform: `rotate(${f.rotation}deg)` }} className="fill-rose-100/50" />
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('invite'); 
  const [formStatus, setFormStatus] = useState('idle'); 
  const [responses, setResponses] = useState([]);
  const [adminAuth, setAdminAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
        setDbError("Auth failed. Ensure 'Anonymous' is enabled in Firebase.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setDbError(null);
    });
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
    }, (err) => {
      if (err.code === 'permission-denied') {
        setDbError("Permission Denied: Check Firestore Security Rules.");
      } else {
        setDbError(String(err.message || "An unknown database error occurred."));
      }
    });
    return () => unsubscribe();
  }, [user, adminAuth]);

  const handleRSVPSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setFormStatus('submitting');
    const formData = new FormData(e.target);
    const rsvpData = {
      name: formData.get('name'),
      email: formData.get('email'),
      contact: formData.get('contact'),
      attending: formData.get('attending') === 'yes',
      dietary: formData.get('dietary'),
      timestamp: new Date()
    };
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'rsvps'), rsvpData);
      setFormStatus('success');
    } catch (err) {
      setFormStatus('error');
    }
  };

  const getCalendarUrl = () => {
    const event = {
      title: "Avelina's 60th Birthday Celebration",
      details: "Join us as we celebrate Avelina's Diamond Jubilee!",
      location: "The Emerald Events Place, Antipolo, Rizal",
      start: "20260208T150000",
      end: "20260208T200000"
    };
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;
  };

  const InvitationView = () => (
    <div className="min-h-screen bg-[#fff5f6] flex flex-col items-center py-12 px-4 font-sans text-stone-800 relative">
      <FloatingFlowers />
      
      {dbError && (
        <div className="max-w-xl w-full mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-700 shadow-sm z-10">
          <ShieldAlert className="shrink-0" size={20} />
          <div className="text-xs font-bold">{String(dbError)}</div>
        </div>
      )}

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 z-10">
        {/* Video Header */}
        <div className="relative h-[580px] bg-[#fee2e2] overflow-hidden flex items-center justify-center">
          <video 
            src={HEADER_VIDEO_URL} 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!HEADER_VIDEO_URL && (
             <div className="absolute inset-0 bg-gradient-to-br from-[#fff1f2] to-[#fecdd3] flex flex-col items-center justify-center p-12 text-center">
                <div className="border border-rose-200 p-8 rounded-full">
                   <Heart size={48} className="text-rose-300 fill-rose-300 animate-pulse" />
                </div>
                <h1 className="mt-6 text-rose-900 text-3xl font-serif tracking-[0.2em] uppercase">Avelina’s 60th</h1>
             </div>
          )}
        </div>

        <div className="p-8 md:p-12">
          {/* Dress Code Section */}
          <div className="mb-12 bg-[#fffcfd] border border-rose-100 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-rose-400">
              <Shirt size={20} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Dress Code</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-rose-900 mb-6">Semi-formal Attire</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest border-b border-rose-100 pb-1 mb-3">Women</p>
                <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                  <li>Knee-length, tea-length</li>
                  <li>Midi cocktail dress</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest border-b border-rose-100 pb-1 mb-3">Men</p>
                <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                  <li>Short Sleeves Dress Shirt</li>
                  <li>Long Sleeves Dress Shirt</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Map Embed */}
          <div className="w-full h-56 bg-rose-50 rounded-2xl overflow-hidden mb-12 border border-rose-100 shadow-inner">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.353683696874!2d121.16301399999999!3d14.5696198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c7fb8fce5735%3A0xc84901512d88bd1e!2sThe%20Emerald%20Events%20Place!5e0!3m2!1sen!2sph!4v1736413432729!5m2!1sen!2sph" 
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Venue Map"></iframe>
          </div>

          {/* RSVP Form */}
          {formStatus === 'success' ? (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center animate-in zoom-in duration-300">
              <CheckCircle className="mx-auto text-rose-400 mb-4" size={64} />
              <h3 className="text-xl font-serif font-bold text-rose-800 uppercase tracking-widest">RSVP Received</h3>
              <p className="text-rose-600 mt-2 text-sm font-medium">We look forward to celebrating with you!</p>
              
              <div className="mt-8 flex flex-col gap-4">
                <a 
                  href={getCalendarUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-rose-400 text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-rose-500 transition-all shadow-lg active:scale-95"
                >
                  <CalendarPlus size={16} /> Add to Calendar
                </a>
                <button onClick={() => setFormStatus('idle')} className="text-rose-400 font-bold text-[10px] uppercase tracking-widest hover:underline">New RSVP</button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
               <div className="flex items-center gap-6">
                  <div className="h-px bg-rose-100 flex-1"></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-300">RSVP Below</span>
                  <div className="h-px bg-rose-100 flex-1"></div>
               </div>

              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-rose-800 ml-1">Guest Name</label>
                  <input required name="name" className="w-full px-6 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm" placeholder="Full Name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-rose-800 ml-1 flex items-center gap-1"><Mail size={12}/> Email</label>
                    <input required name="email" type="email" className="w-full px-6 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-rose-800 ml-1 flex items-center gap-1"><Phone size={12}/> Contact Number</label>
                    <input required name="contact" type="tel" className="w-full px-6 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm" placeholder="0912..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-rose-800 ml-1">Response</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 p-5 border-2 border-rose-50 rounded-2xl cursor-pointer hover:border-rose-300 transition-all group">
                      <input required type="radio" name="attending" value="yes" className="accent-rose-400 w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">Accept</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 p-5 border-2 border-rose-50 rounded-2xl cursor-pointer hover:border-rose-300 transition-all group">
                      <input required type="radio" name="attending" value="no" className="accent-rose-400 w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">Decline</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-rose-800 ml-1">Notes</label>
                  <textarea name="dietary" rows="3" className="w-full px-6 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none text-sm resize-none" placeholder="Allergies or song requests?"></textarea>
                </div>

                <button type="submit" disabled={formStatus === 'submitting'} className="w-full bg-rose-400 text-white py-5 rounded-2xl font-bold tracking-[0.2em] uppercase hover:bg-rose-500 disabled:opacity-50 transition-all text-xs shadow-xl active:scale-[0.98]">
                  {formStatus === 'submitting' ? 'Saving...' : 'Confirm Attendance'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <button onClick={() => setView('login')} className="mt-12 text-rose-300 hover:text-rose-500 flex items-center gap-1 text-[10px] uppercase tracking-widest transition-colors font-bold z-10">
        <Settings size={12} /> Admin
      </button>
    </div>
  );

  const DashboardView = () => {
    const totalAttending = responses.filter(r => r.attending).length;

    return (
      <div className="min-h-screen bg-[#fff5f6] p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <button onClick={() => setView('invite')} className="flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase hover:text-rose-800 transition-colors"><ArrowLeft size={14} /> Back</button>
            <button onClick={() => {
              const headers = ["Name", "Email", "Contact", "Attending", "Notes", "Date"];
              const rows = responses.map(r => [`"${r.name}"`, `"${r.email}"`, `"${r.contact}"`, r.attending ? "Yes" : "No", `"${r.dietary || ''}"`, `"${r.timestamp}"`]);
              const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'avelina_60th_rsvps.csv'; a.click();
            }} className="bg-rose-800 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-rose-900 transition-all flex items-center gap-2"><Download size={14} /> Export CSV</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-center">
            <div className="bg-white p-10 rounded-[2.5rem] border border-rose-100 shadow-sm">
              <p className="text-rose-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Accepts</p>
              <p className="text-4xl font-black text-rose-600">{totalAttending}</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-rose-100 shadow-sm">
              <p className="text-rose-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Declines</p>
              <p className="text-4xl font-black text-stone-400">{responses.filter(r => !r.attending).length}</p>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-rose-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/50 border-b border-rose-100 text-rose-800 uppercase text-[9px] font-bold tracking-widest">
                  <tr><th className="px-8 py-6">Guest Info</th><th className="px-8 py-6">Status</th><th className="px-8 py-6">Contact</th><th className="px-8 py-6">Notes</th></tr>
                </thead>
                <tbody className="divide-y divide-rose-50 text-stone-700">
                  {responses.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((resp) => (
                    <tr key={resp.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-rose-900">{resp.name}</div>
                        <div className="text-[9px] text-stone-400">{resp.email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${resp.attending ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-500'}`}>
                          {resp.attending ? 'ACCEPT' : 'DECLINE'}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px]">{resp.contact}</td>
                      <td className="px-8 py-6 italic truncate max-w-xs">{resp.dietary || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminLogin = () => (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-rose-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-rose-100 text-rose-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-rose-900 tracking-tight uppercase">Admin Access</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (passwordInput === ADMIN_PASSWORD) { setAdminAuth(true); setView('dashboard'); } else { alert("Incorrect password"); } }} className="space-y-6">
          <input type="password" autoFocus className="w-full px-8 py-5 bg-rose-50/50 border border-rose-100 rounded-3xl outline-none text-sm placeholder:text-rose-200" placeholder="Enter password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
          <button className="w-full bg-rose-800 text-white py-5 rounded-3xl font-bold uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-rose-900 transition-all active:scale-95">Access Results</button>
          <button type="button" onClick={() => setView('invite')} className="w-full text-rose-300 text-[10px] font-black hover:text-rose-500 mt-4 text-center block uppercase tracking-widest transition-colors">Return to Invitation</button>
        </form>
      </div>
    </div>
  );

  if (view === 'login') return <AdminLogin />;
  if (view === 'dashboard' && adminAuth) return <DashboardView />;
  return <InvitationView />;
}
