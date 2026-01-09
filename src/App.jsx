import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc,
  onSnapshot, 
  query,
  doc,
  deleteDoc
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
  Shirt,
  Phone,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// --- CUSTOMIZATION ---
const HEADER_VIDEO_URL = "White And Golden Floral Botanical Simple 60th Birthday Party Invitation.mp4"; 

// Color Guide Integration
const COLORS = {
  men: ["#B6CDDB", "#99BFD6"],
  women: ["#FBAFC2", "#FF8FAB"],
  primary: "#FBAFC2",
  accent: "#FF8FAB"
};

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
  const flowerCount = 18;
  const flowerStyles = useMemo(() => Array.from({ length: flowerCount }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 15,
    size: 15 + Math.random() * 25,
    rotation: Math.random() * 360,
    color: i % 2 === 0 ? COLORS.women[0] : COLORS.women[1]
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
        .flower-particle {
          position: absolute;
          bottom: -100px;
          animation: floatUp linear infinite;
        }
      `}</style>
      {flowerStyles.map((f) => (
        <div key={f.id} className="flower-particle" style={{ left: `${f.left}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s`, color: f.color }}>
          <Flower size={f.size} style={{ transform: `rotate(${f.rotation}deg)` }} className="fill-current opacity-40" />
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
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Favicon and Title Setup
  useEffect(() => {
    document.title = "Avelina's 60th Birthday";
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌸</text></svg>`;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        setDbError("Auth failed. Please check Firebase settings.");
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
    }, (err) => {
      if (err.code === 'permission-denied') {
        setDbError("Permission Denied: Check Firestore Security Rules.");
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
      attending: formData.get('attending') === 'yes',
      timestamp: new Date()
    };
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'rsvps'), rsvpData);
      setFormStatus('success');
    } catch (err) {
      setFormStatus('error');
    }
  };

  const handleDeleteResponse = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rsvps', id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      const deletePromises = responses.map(r => 
        deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rsvps', r.id))
      );
      await Promise.all(deletePromises);
      setIsConfirmingClear(false);
    } catch (err) {
      console.error("Clear all error:", err);
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
    <div className="min-h-screen bg-[#fffcfd] flex flex-col items-center py-12 px-4 font-sans text-stone-800 relative overflow-x-hidden">
      <FloatingFlowers />
      
      {dbError && (
        <div className="max-w-xl w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 shadow-sm z-10">
          <ShieldAlert className="shrink-0" size={20} />
          <div className="text-xs font-bold">{String(dbError)}</div>
        </div>
      )}

      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-100 z-10">
        <div className="relative h-[600px] bg-stone-50 overflow-hidden flex items-center justify-center">
          <video 
            src={HEADER_VIDEO_URL} 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!HEADER_VIDEO_URL && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center" style={{ backgroundColor: COLORS.women[0] }}>
                <Heart size={48} style={{ color: 'white', fill: 'white' }} className="animate-pulse" />
                <h1 className="mt-6 text-white text-3xl font-serif tracking-[0.2em] uppercase">Avelina’s 60th</h1>
             </div>
          )}
        </div>

        <div className="p-8 md:p-12">
          {/* Dress Code Section */}
          <div className="mb-12 border rounded-[2rem] p-8 text-center bg-[#fffcfd] border-rose-50 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-4 text-stone-400">
              <span style={{ color: COLORS.women[0] }}><Shirt size={20} /></span>
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Dress Code</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-800 mb-8 uppercase tracking-wider">Semi-formal Attire</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: COLORS.women[0] }}></div>
                   <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: COLORS.women[1] }}></div>
                   <p className="text-[11px] font-bold uppercase tracking-widest text-stone-700">Women</p>
                </div>
                <ul className="text-xs text-stone-500 space-y-2 list-disc list-inside">
                  <li>Knee-length, tea-length</li>
                  <li>Midi cocktail dress</li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: COLORS.men[0] }}></div>
                   <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: COLORS.men[1] }}></div>
                   <p className="text-[11px] font-bold uppercase tracking-widest text-stone-700">Men</p>
                </div>
                <ul className="text-xs text-stone-500 space-y-2 list-disc list-inside">
                  <li>Short Sleeves Dress Shirt</li>
                  <li>Long Sleeves Dress Shirt</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Map Embed */}
          <div className="w-full h-60 rounded-[2rem] overflow-hidden mb-8 border border-stone-100 shadow-inner">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.353683696874!2d121.16301399999999!3d14.5696198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c7fb8fce5735%3A0xc84901512d88bd1e!2sThe%20Emerald%20Events%20Place!5e0!3m2!1sen!2sph!4v1736413432729!5m2!1sen!2sph" 
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Venue Map"></iframe>
          </div>

          {/* For Inquiries Section */}
          <div className="mb-12 border rounded-[2rem] p-6 text-center bg-[#fffcfd] border-rose-50">
             <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-rose-50 text-rose-400 mb-1" style={{ backgroundColor: COLORS.women[0] + '20' }}>
                   <Phone size={18} style={{ color: COLORS.women[1] }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">For Inquiries</span>
                <p className="text-sm font-bold text-stone-700 tracking-widest">09175061966</p>
             </div>
          </div>

          {/* RSVP Form */}
          {formStatus === 'success' ? (
            <div className="border rounded-[2rem] p-10 text-center animate-in zoom-in duration-300" style={{ backgroundColor: '#fff5f6', borderColor: COLORS.women[0] }}>
              <CheckCircle className="mx-auto mb-4" size={64} style={{ color: COLORS.women[1] }} />
              <h3 className="text-xl font-serif font-bold text-stone-800 uppercase tracking-widest">RSVP Received</h3>
              <p className="text-stone-500 mt-2 text-sm">We look forward to celebrating with you!</p>
              
              <div className="mt-8 flex flex-col gap-4">
                <a 
                  href={getCalendarUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-95"
                  style={{ backgroundColor: COLORS.women[1] }}
                >
                  <CalendarPlus size={16} /> Add to Calendar
                </a>
                <button onClick={() => setFormStatus('idle')} className="font-bold text-[10px] uppercase tracking-widest hover:underline" style={{ color: COLORS.women[1] }}>New RSVP</button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
               <div className="flex items-center gap-6">
                  <div className="h-px bg-rose-50 flex-1"></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-200">RSVP Below</span>
                  <div className="h-px bg-rose-50 flex-1"></div>
               </div>

              <form onSubmit={handleRSVPSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Guest Name</label>
                  <input required name="name" className="w-full px-6 py-5 bg-[#fffcfd] border border-stone-100 rounded-2xl outline-none focus:ring-2 transition-all text-sm shadow-sm" placeholder="Enter Full Name" style={{ '--tw-ring-color': COLORS.women[0] }} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Response</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 p-6 border-2 border-rose-50 rounded-2xl cursor-pointer hover:border-rose-100 transition-all group">
                      <input required type="radio" name="attending" value="yes" className="w-4 h-4" style={{ accentColor: COLORS.women[1] }} />
                      <span className="text-[11px] font-black uppercase tracking-widest text-stone-600">Accept</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 p-6 border-2 border-rose-50 rounded-2xl cursor-pointer hover:border-rose-100 transition-all group">
                      <input required type="radio" name="attending" value="no" className="w-4 h-4" style={{ accentColor: COLORS.men[1] }} />
                      <span className="text-[11px] font-black uppercase tracking-widest text-stone-600">Decline</span>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={formStatus === 'submitting'} className="w-full text-white py-6 rounded-2xl font-bold tracking-[0.3em] uppercase disabled:opacity-50 transition-all text-xs shadow-xl active:scale-[0.98]" style={{ backgroundColor: COLORS.women[1] }}>
                  {formStatus === 'submitting' ? 'Processing...' : 'Confirm Attendance'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <button onClick={() => setView('login')} className="mt-12 text-rose-200 hover:text-rose-400 flex items-center gap-1 text-[10px] uppercase tracking-widest transition-colors font-bold z-10">
        <Settings size={12} /> Admin
      </button>
    </div>
  );

  const DashboardView = () => {
    const totalAttending = responses.filter(r => r.attending).length;

    return (
      <div className="min-h-screen bg-[#fffcfd] p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <button onClick={() => setView('invite')} className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase hover:text-stone-800 transition-colors"><ArrowLeft size={14} /> Back</button>
            
            <div className="flex gap-2 w-full md:w-auto">
              {isConfirmingClear ? (
                <div className="flex gap-2 animate-in slide-in-from-right-4">
                  <button onClick={handleClearAll} className="bg-red-600 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-red-700">Confirm Delete All</button>
                  <button onClick={() => setIsConfirmingClear(false)} className="bg-stone-200 text-stone-600 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setIsConfirmingClear(true)} className="bg-rose-100 text-rose-600 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-200 transition-colors flex items-center gap-2">
                   <AlertTriangle size={14} /> Clear All
                </button>
              )}
              <button onClick={() => {
                const headers = ["Name", "Attending", "Date"];
                const rows = responses.map(r => [`"${r.name}"`, r.attending ? "Yes" : "No", `"${r.timestamp}"`]);
                const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'avelina_60th_rsvps.csv'; a.click();
              }} className="bg-stone-800 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2"><Download size={14} /> Export CSV</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-center">
            <div className="bg-white p-10 rounded-[2.5rem] border border-rose-50 shadow-sm">
              <p className="text-rose-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Accepts</p>
              <p className="text-4xl font-black" style={{ color: COLORS.women[1] }}>{totalAttending}</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-rose-50 shadow-sm">
              <p className="text-stone-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Declines</p>
              <p className="text-4xl font-black text-stone-300">{responses.filter(r => !r.attending).length}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-rose-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fffcfd] border-b border-rose-50 text-stone-400 uppercase text-[9px] font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Guest Name</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Time Received</th>
                    <th className="px-8 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50 text-stone-700">
                  {responses.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((resp) => (
                    <tr key={resp.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-8 py-6 font-bold text-stone-900">{resp.name}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${resp.attending ? 'text-white' : 'bg-stone-100 text-stone-500'}`} style={resp.attending ? { backgroundColor: COLORS.women[1] } : {}}>
                          {resp.attending ? 'ACCEPT' : 'DECLINE'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-[10px] text-stone-400">{resp.timestamp}</td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDeleteResponse(resp.id)}
                          className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                          title="Delete Response"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
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
    <div className="min-h-screen bg-[#fffcfd] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-rose-50">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-rose-50 text-rose-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-800 tracking-tight uppercase">Admin Access</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (passwordInput === ADMIN_PASSWORD) { setAdminAuth(true); setView('dashboard'); } else { alert("Incorrect password"); } }} className="space-y-6">
          <input type="password" autoFocus className="w-full px-8 py-5 bg-[#fffcfd] border border-stone-100 rounded-3xl outline-none text-sm placeholder:text-stone-300" placeholder="Enter password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
          <button className="w-full text-white py-6 rounded-3xl font-bold uppercase text-xs tracking-[0.3em] shadow-lg transition-all active:scale-95" style={{ backgroundColor: COLORS.women[1] }}>Access Results</button>
          <button type="button" onClick={() => setView('invite')} className="text-stone-300 text-[10px] font-black hover:text-rose-500 mt-4 text-center block uppercase tracking-widest transition-colors w-full">Back to Invite</button>
        </form>
      </div>
    </div>
  );

  if (view === 'login') return <AdminLogin />;
  if (view === 'dashboard' && adminAuth) return <DashboardView />;
  return <InvitationView />;
}
