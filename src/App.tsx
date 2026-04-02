import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { AlertTriangle, Lock, Printer, Trash2, FileSpreadsheet, Plus, FolderOpen, ChevronLeft, LayoutDashboard, Settings, X, LogOut, CreditCard, Loader2, KeyRound, Globe, Info, Landmark, Building, Unlink, ShieldCheck, ChevronRight, CheckCircle2, Scale, ArrowLeft, BookOpen, FileUp, Wand2, FileDown, Check, Phone, Mail, MapPin, Link2, Car, Wallet, AlertCircle, Zap, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Asset, FundAsset, Collateral, SingularizedAsset, FinancialAsset } from './types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updatePassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import dikigorosImg from './dikigoros.jpg';
import logistisImg from './logistis.jpg';
import symvoulosImg from './symvoulos.jpg';

const ExoMatchSVGLogo = ({ className = "h-24 w-auto", theme = "dark" }: { className?: string, theme?: "light" | "dark" }) => (
  <svg 
    viewBox="0 0 420 120" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
        <linearGradient id="gradMatchL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a1d37"/>
            <stop offset="100%" stopColor="#5ba4b1"/>
        </linearGradient>
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
            .fm-serif { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 42px; fill: ${theme === 'dark' ? '#ffffff' : '#0a1d37'}; }
            .fm-sans { font-family: 'Manrope', sans-serif; font-weight: 300; font-size: 30px; fill: #5ba4b1; letter-spacing: 5px; }
            .fm-tag { font-family: 'Manrope', sans-serif; font-weight: 400; font-size: 9px; fill: ${theme === 'dark' ? '#94a3b8' : '#64748b'}; letter-spacing: 1.5px; }
            .fm-tag-bold { font-weight: 700; fill: #5ba4b1; }
            .fm-badge { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 11px; fill: #5ba4b1; letter-spacing: 2px; }
            `}
        </style>
    </defs>
    <g transform="translate(10, 10)">
        <path d="M 12 78 L 38 24 L 64 78" fill="none" stroke={theme === 'dark' ? '#ffffff' : '#0a1d37'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 36 78 L 62 24 L 88 78" fill="none" stroke="#5ba4b1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        <circle cx="50" cy="51" r="14" fill="#5ba4b1" opacity="0.15" />
        <circle cx="50" cy="51" r="6" fill="#5ba4b1" />
    </g>
    <text x="115" y="72"><tspan className="fm-serif">EXO</tspan><tspan className="fm-sans"> MATCH</tspan></text>
    <rect x="350" y="42" width="46" height="24" fill="none" stroke="#5ba4b1" strokeWidth="1.5" rx="4" />
    <text x="373" y="58" className="fm-badge" textAnchor="middle">PRO</text>
    <text x="119" y="96" className="fm-tag">POWERED BY <tspan className="fm-tag-bold">THE BIZBOOST</tspan> BY G. DIONYSIOU</text>
</svg>
);

const LOGO_SVG_STRING = `
<svg width="420" height="120" viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="gradMatchL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#006373"/>
            <stop offset="100%" stop-color="#00A8B5"/>
        </linearGradient>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
            .fm-serif { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 42px; fill: #061A35; }
            .fm-sans { font-family: 'Manrope', sans-serif; font-weight: 300; font-size: 30px; fill: #006373; letter-spacing: 5px; }
            .fm-tag { font-family: 'Manrope', sans-serif; font-weight: 400; font-size: 9px; fill: #64748b; letter-spacing: 1.5px; }
            .fm-tag-bold { font-weight: 700; fill: #061A35; }
            .fm-badge { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 11px; fill: #061A35; letter-spacing: 2px; }
        </style>
    </defs>
    <g transform="translate(10, 10)">
        <path d="M 12 78 L 38 24 L 64 78" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 36 78 L 62 24 L 88 78" fill="none" stroke="url(#gradMatchL)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
        <circle cx="50" cy="51" r="14" fill="#00A8B5" opacity="0.15" />
        <circle cx="50" cy="51" r="6" fill="#00A8B5" />
    </g>
    <text x="115" y="72"><tspan class="fm-serif">EXO</tspan><tspan class="fm-sans"> MATCH</tspan></text>
    <rect x="350" y="42" width="46" height="24" fill="none" stroke="#061A35" stroke-width="1.5" rx="2" />
    <text x="373" y="58" class="fm-badge" text-anchor="middle">PRO</text>
    <text x="119" y="96" class="fm-tag">POWERED BY <tspan class="fm-tag-bold">THE BIZBOOST</tspan> BY G. DIONYSIOU</text>
</svg>
`;

const LOGO_SVG_STRING_LIGHT = `
<svg width="420" height="120" viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="gradMatchL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#006373"/>
            <stop offset="100%" stop-color="#00A8B5"/>
        </linearGradient>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
            .fm-serif-light { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 42px; fill: #ffffff; }
            .fm-sans-light { font-family: 'Manrope', sans-serif; font-weight: 300; font-size: 30px; fill: #00A8B5; letter-spacing: 5px; }
            .fm-tag-light { font-family: 'Manrope', sans-serif; font-weight: 400; font-size: 9px; fill: #94a3b8; letter-spacing: 1.5px; }
            .fm-tag-bold-light { font-weight: 700; fill: #ffffff; }
            .fm-badge-light { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 11px; fill: #ffffff; letter-spacing: 2px; }
        </style>
    </defs>
    <g transform="translate(10, 10)">
        <path d="M 12 78 L 38 24 L 64 78" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 36 78 L 62 24 L 88 78" fill="none" stroke="url(#gradMatchL)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
        <circle cx="50" cy="51" r="14" fill="#00A8B5" opacity="0.15" />
        <circle cx="50" cy="51" r="6" fill="#00A8B5" />
    </g>
    <text x="115" y="72"><tspan class="fm-serif-light">EXO</tspan><tspan class="fm-sans-light"> MATCH</tspan></text>
    <rect x="350" y="42" width="46" height="24" fill="none" stroke="#ffffff" stroke-width="1.5" rx="2" />
    <text x="373" y="58" class="fm-badge-light" text-anchor="middle">PRO</text>
    <text x="119" y="96" class="fm-tag-light">POWERED BY <tspan class="fm-tag-bold-light">THE BIZBOOST</tspan> BY G. DIONYSIOU</text>
</svg>
`;

interface Project { 
  id: string; 
  fullName: string; 
  afm: string; 
  ocwNumber: string; 
  date: string; 
  listA: Asset[]; 
  listB: FundAsset[]; 
  listC: Collateral[]; 
  listD?: FinancialAsset[];
  manualMatches?: Record<string, number>;
}

const ExoMatchLogo = ({ className = "h-24 w-auto", theme = "dark" }: { className?: string, theme?: "light" | "dark" }) => (
  <div className="flex items-center justify-center shrink-0">
    <ExoMatchSVGLogo className={className} theme={theme} />
  </div>
);
const BackgroundWatermark = ({ theme = "dark" }: { theme?: "light" | "dark" }) => (
  <div className={`fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'opacity-[0.04]' : 'opacity-[0.02]'}`}>
    <ExoMatchSVGLogo className="w-[80vw] max-w-5xl" theme={theme} />
  </div>
);

const MotionIntro = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 2.2, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[1000] bg-[#050b18] flex flex-col items-center justify-center"
    >
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ 
            duration: 1, 
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2
          }}
          className="relative z-10"
        >
          <ExoMatchSVGLogo className="h-32 sm:h-48 w-auto" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 flex flex-col items-center"
        >
          <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: 0, 
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500"
            />
          </div>
          <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            Loading Professional Workspace
          </span>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 50%)`,
        }}
      />
    </motion.div>
  );
};

const translations = {
  EL: { dashboard: "Πινακας Ελεγχου", settings: "Ρυθμισεις", subscription: "Συνδρομη", tutorial: "Οδηγος Χρησης", activeProject: "Ενεργος Φακελος", clearData: "Καθαρισμος", printReport: "Εκτυπωση", uploadAsset: "Ανεβασμα Ε9 (Ακινητα)", uploadAssetDesc: "\"Ακινητα\" / PropertytaxbuildingsXLS", uploadClaim: "Ανεβασμα Βαρων", uploadClaimDesc: "\"Περιουσιακα Στοιχεια - Πιστωτες\" / assetsXLS", uploadCollateral: "Ανεβασμα Προσημειωσεων", uploadCollateralDesc: "\"Εξασφαλισεις - Πιστωτες\" / CollateralXLS", orphanEncumbrances: "Ορφανα Βαρη", orphanDesc: "Βαρη που δεν ταυτιστηκαν με ακινητα.", noOrphans: "Δεν εντοπιστηκαν ορφανα βαρη", totalLiq: "Συνολικη Αξια", uniqueAssets: "Μοναδικα Ακινητα", resultsList: "Λιστα Αποτελεσματων", resultSingularized: "Μοναδικοποιημενα", matchId: "Match ID", description: "Περιγραφη", liqValue: "Αξια Ρευστ.", status: "Κατασταση", claims: "Εξασφαλισεις / Βαρη", claimType: "Βαρος", myCases: "Φακελοι Πελατων", newCase: "Νεος Φακελος", emptyWorkspace: "Ο χωρος εργασιας ειναι αδειος", emptyDesc: "Ξεκινήστε πατωντας το κουμπι 'Νεος Φακελος'.", clickForDetails: "Κλικ για αναλυση", liqAnalysis: "Αναλυση Αξιας", uniqueAssetsList: "Μοναδικα Ακινητα", orphanList: "Ορφανα Βαρη", creditor: "Επωνυμια Πιστωτη / Διαχειριστη", amount: "Ποσο", close: "Κλεισιμο", total: "Συνολο:" }
};

const removeGreekAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizePhonetic = (str: string) => {
  if (!str) return "";
  let s = str.toUpperCase();
  s = removeGreekAccents(s);
  
  // 1. Handle Greek double vowels/consonants FIRST
  s = s.replace(/ΟΥ/g, "U");
  s = s.replace(/ΕΙ|ΟΙ|Υ|Η|Ι/g, "I");
  s = s.replace(/ΑΙ|Ε/g, "E");
  s = s.replace(/Ω|Ο/g, "O");
  s = s.replace(/ΜΠ/g, "B");
  s = s.replace(/ΝΤ/g, "D");
  s = s.replace(/ΓΚ/g, "G");
  s = s.replace(/ΤΖ/g, "TZ");
  s = s.replace(/ΤΣ/g, "TS");
  s = s.replace(/ΑΥ/g, "AV");
  s = s.replace(/ΕΥ/g, "EV");
  s = s.replace(/Θ/g, "TH");
  s = s.replace(/Φ/g, "F");
  s = s.replace(/Χ/g, "H");
  s = s.replace(/Ψ/g, "PS");
  s = s.replace(/Ξ/g, "X");
  
  // 2. Transliterate remaining Greek characters
  const map: { [key: string]: string } = {
    'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I', 'Θ': 'TH', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'H', 'Ψ': 'PS', 'Ω': 'O'
  };
  
  let res = "";
  for (let i = 0; i < s.length; i++) {
    res += map[s[i]] || s[i];
  }
  
  // 3. Handle Latin/Greeklish phonetic normalization
  res = res.replace(/OY|OU/g, "U");
  res = res.replace(/EI|OI|Y/g, "I"); 
  res = res.replace(/AI/g, "E");
  res = res.replace(/W/g, "O");
  res = res.replace(/MP/g, "B");
  res = res.replace(/NT/g, "D");
  res = res.replace(/GK/g, "G");
  res = res.replace(/TH/g, "T");
  res = res.replace(/CH|KH/g, "H"); 
  res = res.replace(/PH/g, "F");
  res = res.replace(/GH/g, "G");
  res = res.replace(/KS/g, "X");
  res = res.replace(/PS/g, "P");
  
  // Final cleanup: remove non-alphanumeric
  return res.replace(/[^A-Z0-9Α-Ω]/g, "");
};

const fuzzyMatchStrings = (s1: string, s2: string) => {
  try {
    if (!s1 || !s2) return false;
    
    const n1 = normalizePhonetic(s1);
    const n2 = normalizePhonetic(s2);
    
    // 1. Exact phonetic match
    if (n1 === n2 && n1 !== '') return true;
    
    // 2. Inclusion match (for longer strings)
    if (n1.length > 5 && n2.length > 5) {
      if (n1.includes(n2) || n2.includes(n1)) return true;
    }
    
    // 3. Word-based phonetic match (The "KATOHORIOU" rule)
    // We split by common delimiters and normalize each word
    const commonWords = ['ODOS', 'LEOFOROS', 'PLATEIA', 'AGIOU', 'AGIAS', 'MEG', 'MEGALOU', 'ETHNIKIS', 'PALEA', 'NEA', 'KATO', 'ANO'];
    const words1 = s1.split(/[\s,.\-/]+/).map(w => normalizePhonetic(w)).filter(w => w.length > 3 && !commonWords.includes(w));
    const words2 = s2.split(/[\s,.\-/]+/).map(w => normalizePhonetic(w)).filter(w => w.length > 3 && !commonWords.includes(w));
    
    // If any significant word matches phonetically, we consider it a potential match
    // especially for addresses where one part is the street and the other is the area
    for (const w1 of words1) {
      if (words2.includes(w1)) return true;
    }
    
    return false;
  } catch (e) {
    console.error("Error in fuzzyMatchStrings:", e);
    return false;
  }
};

export default function App() {
  const [appMode, setAppMode] = useState<'LANDING' | 'APP'>('LANDING');
  const [showIntro, setShowIntro] = useState(true);
  const [lang] = useState<'EL'>('EL');
  const t = translations[lang];

  const [legalModal, setLegalModal] = useState<'NONE' | 'TOS' | 'PRIVACY' | 'DPA'>('NONE');
  const [authStatus, setAuthStatus] = useState<'INITIALIZING' | 'LOGIN' | 'PAYWALL' | 'AUTHORIZED' | 'RESET_PASSWORD' | 'UNVERIFIED_EMAIL'>('INITIALIZING');
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [loginEmail, setLoginEmail] = useState(''); const [loginPassword, setLoginPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerOfficeName, setRegisterOfficeName] = useState('');
  const [registerProfession, setRegisterProfession] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAfm, setRegisterAfm] = useState('');
  const [requireInvoice, setRequireInvoice] = useState(false);
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerDoy, setRegisterDoy] = useState('');
  const [isFetchingAfm, setIsFetchingAfm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  const [userPlan, setUserPlan] = useState<'BASIC' | 'PRO'>('BASIC');
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [resetEmail, setResetEmail] = useState(''); const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'WORKSPACE' | 'SETTINGS' | 'TUTORIAL'>('DASHBOARD');
  const [casesViewMode, setCasesViewMode] = useState<'GRID' | 'LIST'>(() => {
    const saved = localStorage.getItem('exoMatchPro_viewMode');
    return (saved === 'GRID' || saved === 'LIST') ? saved : 'GRID';
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return localStorage.getItem('exoMatchPro_activeProjectId');
  });
  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('exoMatchPro_activeProjectId', activeProjectId);
    } else {
      localStorage.removeItem('exoMatchPro_activeProjectId');
    }
  }, [activeProjectId]);

  const lastLoadedId = useRef<string | null>(null);
  const [manualMatches, setManualMatches] = useState<Record<string, number>>({});
  const [encToMatch, setEncToMatch] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatModal, setActiveStatModal] = useState<'NONE' | 'LIQUIDATION' | 'UNIQUE_ASSETS' | 'ORPHANS'>('NONE');

  // Load manual matches and lists from project
  useEffect(() => {
    if (!activeProjectId) {
      lastLoadedId.current = null;
      setListA([]);
      setListB([]);
      setListC([]);
      setManualMatches({});
      return;
    }
    const project = projects.find(p => p.id === activeProjectId);
    if (project && activeProjectId !== lastLoadedId.current) {
      setListA(project.listA || []);
      setListB(project.listB || []);
      setListC(project.listC || []);
      setListD(project.listD || []);
      setManualMatches(project.manualMatches || {});
      lastLoadedId.current = activeProjectId;
    }
  }, [activeProjectId, projects]);

  // Save manual matches to Firestore
  useEffect(() => {
    if (!activeProjectId || !activeProject) return;
    
    // Only save if there's a change to avoid infinite loops
    if (JSON.stringify(manualMatches) === JSON.stringify(activeProject.manualMatches || {})) return;

    const projectRef = doc(db, 'projects', activeProjectId);
    updateDoc(projectRef, { manualMatches }).catch((err: any) => {
      console.error("Error saving manual matches:", err);
    });
  }, [manualMatches, activeProjectId, activeProject]);

  const [newFullName, setNewFullName] = useState(''); const [newAfm, setNewAfm] = useState(''); const [newOcwNumber, setNewOcwNumber] = useState('');
  const [afmError, setAfmError] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [listA, setListA] = useState<Asset[]>([]); const [listB, setListB] = useState<FundAsset[]>([]); const [listC, setListC] = useState<Collateral[]>([]); const [listD, setListD] = useState<FinancialAsset[]>([]);
  const [newPassword, setNewPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const stripeSubUnsubscribe = useRef<(() => void) | null>(null);
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING' | 'ERROR'>('SAVED');

  const checkUserAccess = async (user: any) => {
    setCurrentUser(user.email);
    if (!user.emailVerified && user.email !== 'info@bizboost.gr' && user.email !== 'gdion77@gmail.com') { setAuthStatus('UNVERIFIED_EMAIL'); return; }
    if (user.email === 'info@bizboost.gr' || user.email === 'gdion77@gmail.com') { setAuthStatus('AUTHORIZED'); setUserPlan('PRO'); return; }
    
    // 1. Check Admin collection first
    try {
      const adminDoc = await getDoc(doc(db, 'Admin', user.uid));
      if (adminDoc.exists() && adminDoc.data().status === 'active') {
        setAuthStatus('AUTHORIZED');
        setUserPlan('PRO');
        return; // Bypass Stripe check
      }
    } catch (e) {
      console.log("Admin check err", e);
    }

    // 2. Proceed to Stripe check if not admin
    const subRef = collection(db, 'customers', user.uid, 'subscriptions');
    const q = query(subRef, where('status', 'in', ['tracking', 'active', 'trialing']));
    
    if (stripeSubUnsubscribe.current) {
      stripeSubUnsubscribe.current();
    }
    
    stripeSubUnsubscribe.current = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setAuthStatus('AUTHORIZED');
        const subData = snapshot.docs[0].data();
        setUserPlan((subData.role || 'basic').toLowerCase() === 'pro' ? 'PRO' : 'BASIC');
      } else { setAuthStatus('PAYWALL'); }
    });
    try {
      const usageDocRef = doc(db, 'user_usage', user.uid);
      const usageSnap = await getDoc(usageDocRef);
      const currentMonthStr = new Date().toISOString().slice(0, 7); 
      if (usageSnap.exists() && usageSnap.data().month === currentMonthStr) { setUsageCount(usageSnap.data().count || 0); } else { setUsageCount(0); }
    } catch (e) { console.log("Usage tracking err."); }
  };

  useEffect(() => {
    if (appMode === 'LANDING') return; 
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await checkUserAccess(user);
      } else { setCurrentUser(null); setAuthStatus('LOGIN'); }
    });
    return () => unsubscribeAuth();
  }, [appMode]);

  useEffect(() => {
    if (authStatus === 'PAYWALL' && appMode === 'APP') {
      const script = document.createElement('script'); script.src = "https://js.stripe.com/v3/pricing-table.js"; script.async = true;
      document.body.appendChild(script); return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }
  }, [authStatus, appMode]);

  useEffect(() => {
    if (authStatus === 'AUTHORIZED' && auth.currentUser) {
      console.log("Setting up projects subscription...");
      const q = query(collection(db, 'projects'), where('ownerUid', '==', auth.currentUser.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        console.log(`Fetched ${fetchedProjects.length} projects from Firestore.`);
        setProjects(fetchedProjects);
      }, (error) => {
        console.error("Error fetching projects:", error);
      });
      return () => unsubscribe();
    }
  }, [authStatus]);

  useEffect(() => {
    const saveActiveProject = async () => {
      if (authStatus === 'AUTHORIZED' && auth.currentUser && activeProjectId) {
        setSaveStatus('SAVING');
        try {
          const payload = {
            listA,
            listB,
            listC,
            listD,
            manualMatches,
            updatedAt: new Date().toISOString()
          };
          
          const payloadSize = new Blob([JSON.stringify(payload)]).size;
          if (payloadSize > 900000) { // ~900KB
            setSaveStatus('ERROR');
            alert("Προσοχή: Ο φάκελος είναι πολύ μεγάλος (κοντά στο όριο του 1MB). Παρακαλώ διαγράψτε κάποιες εγγραφές ή σπάστε τον σε 2 φακέλους. Οι τελευταίες αλλαγές ΔΕΝ αποθηκεύτηκαν.");
            return;
          }
          
          await setDoc(doc(db, 'projects', activeProjectId), payload, { merge: true });
          setSaveStatus('SAVED');
          console.log(`Saved project ${activeProjectId} to Firestore.`);
        } catch (err) {
          setSaveStatus('ERROR');
          console.error("Error saving active project to Firestore:", err);
        }
      }
    };

    const timeoutId = setTimeout(saveActiveProject, 2000); 
    return () => clearTimeout(timeoutId);
  }, [listA, listB, listC, listD, manualMatches, activeProjectId, authStatus]);

  // Removed redundant local projects sync to prevent infinite loops. 
  // Firestore onSnapshot handles the projects array updates.

  const handleAfmChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setRegisterAfm(val);
    
    if (requireInvoice && val.length === 9) {
      setIsFetchingAfm(true);
      try {
        const response = await fetch(`/api/aade/afm/${val}`);
        const data = await response.json();
        
        if (response.ok) {
          setRegisterOfficeName(data.name || '');
          setRegisterAddress(data.address || '');
          setRegisterDoy(data.doy || '');
          // We keep the user's profession selection or let them choose, 
          // as AADE's 'commer_title' might not map perfectly to our dropdown options.
        } else {
          alert(`Σφάλμα ΑΑΔΕ: ${data.error}`);
        }
      } catch (err) {
        console.error('Error fetching AFM:', err);
        alert('Αποτυχία σύνδεσης με τον διακομιστή.');
      } finally {
        setIsFetchingAfm(false);
      }
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('');
    if (!isLoginMode && !acceptTerms) { setLoginError('Αποδεχτείτε τους Όρους Χρήσης.'); return; }
    if (!isLoginMode && loginPassword !== registerConfirmPassword) { setLoginError('Οι κωδικοί δεν ταιριάζουν.'); return; }
    setIsLoggingIn(true); 
    try {
      if (isLoginMode) { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); } 
      else {
        const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        await sendEmailVerification(userCredential.user);
        await setDoc(doc(db, 'users', userCredential.user.uid), { 
          fullName: registerFullName, 
          officeName: registerOfficeName, 
          profession: registerProfession,
          phone: registerPhone,
          afm: registerAfm,
          requireInvoice,
          address: registerAddress,
          doy: registerDoy,
          email: loginEmail, 
          createdAt: new Date().toISOString() 
        });
      }
    } catch (error: any) { setLoginError('Σφάλμα σύνδεσης. Ελέγξτε τα στοιχεία σας.'); } finally { setIsLoggingIn(false); }
  };

  const handleOAuthLogin = async () => {
    setLoginError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { fullName: result.user.displayName || '', officeName: '', email: result.user.email, createdAt: new Date().toISOString() });
      }
    } catch (error: any) { 
      console.error(error);
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        setLoginError('Η διαδικασία σύνδεσης ακυρώθηκε από τον χρήστη.');
      } else {
        setLoginError(`Σφάλμα σύνδεσης: ${error.message || 'Αποτυχία'}`); 
      }
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (!password || password.length >= 6) strength += 1;
    if (password && password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 4);
  };
  const strength = calculatePasswordStrength(loginPassword || '');
  const strengthLabels = ['Πολύ Αδύναμος', 'Αδύναμος', 'Μέτριος', 'Ισχυρός', 'Πολύ Ισχυρός'];
  const strengthColors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-400', 'bg-teal-500', 'bg-emerald-500'];

  const handleLogout = async () => { await signOut(auth); setLoginEmail(''); setLoginPassword(''); setCurrentView('DASHBOARD'); setAppMode('LANDING'); };
  const handleCheckVerification = async () => {
    setIsLoggingIn(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          await checkUserAccess(auth.currentUser);
        } else {
          alert('Το email δεν έχει επιβεβαιωθεί ακόμα. Παρακαλώ ελέγξτε τα εισερχόμενά σας.');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleResetPassword = async (e: React.FormEvent) => { e.preventDefault(); setIsResetting(true); setResetMessage(null); try { await sendPasswordResetEmail(auth, resetEmail); setResetMessage({ type: 'success', text: 'Ελέγξτε τα εισερχόμενά σας!' }); setResetEmail(''); } catch (error: any) { setResetMessage({ type: 'error', text: 'Σφάλμα.' }); } finally { setIsResetting(false); } };
  const handleChangePassword = async (e: React.FormEvent) => { e.preventDefault(); setSettingsMessage(null); if (newPassword !== confirmPassword) { setSettingsMessage({ type: 'error', text: 'Οι κωδικοί δεν ταιριάζουν.' }); return; } try { if (auth.currentUser) { await updatePassword(auth.currentUser, newPassword); setSettingsMessage({ type: 'success', text: 'Ο κωδικός σας άλλαξε!' }); setNewPassword(''); setConfirmPassword(''); } } catch (error: any) { setSettingsMessage({ type: 'error', text: 'Σφάλμα.' }); } };

  const handleCreateProject = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!newFullName.trim()) return; 
    if (newAfm.trim() && !/^\d{9}$/.test(newAfm.trim())) { setAfmError('Το ΑΦΜ πρέπει να έχει 9 ψηφία.'); return; }
    if (isCreatingCase) return;
    setIsCreatingCase(true);
    setCreateError(null);
    console.log("Starting project creation...");
    try {
      // 1. Update usage (Safe block)
      try {
        if (auth.currentUser && currentUser !== 'info@bizboost.gr' && currentUser !== 'gdion77@gmail.com') {
          console.log("Updating user usage...");
          const usageDocRef = doc(db, 'user_usage', auth.currentUser.uid);
          const currentMonthStr = new Date().toISOString().slice(0, 7); 
          let newCount = 1;
          const usageSnap = await getDoc(usageDocRef);
          if (usageSnap.exists() && usageSnap.data().month === currentMonthStr) { newCount = (usageSnap.data().count || 0) + 1; }
          await setDoc(usageDocRef, { count: newCount, month: currentMonthStr }, { merge: true });
          setUsageCount(newCount);
          console.log("User usage updated.");
        }
      } catch (usageErr) {
        console.error("Usage update failed (non-blocking):", usageErr);
      }

      const projectId = Math.random().toString(36).substring(2, 9);
      const newProject: Project = { 
        id: projectId, 
        fullName: newFullName.trim(), 
        afm: newAfm.trim() || '-', 
        ocwNumber: newOcwNumber.trim() || '-', 
        date: new Date().toLocaleDateString('el-GR'), 
        listA: [], 
        listB: [], 
        listC: [],
        listD: []
      }; 

      // 2. Save to Firestore if authenticated
      if (auth.currentUser) {
        console.log("Saving project to Firestore...");
        try {
          await setDoc(doc(db, 'projects', projectId), {
            ...newProject,
            ownerUid: auth.currentUser.uid,
            createdAt: new Date().toISOString()
          });
          console.log("Project saved to Firestore.");
        } catch (fsErr: any) {
          if (fsErr.code === 'permission-denied' || (fsErr.message && fsErr.message.includes('permission'))) {
             throw new Error("Δεν έχετε δικαίωμα δημιουργίας φακέλου. Παρακαλώ ελέγξτε τη σύνδεσή σας.");
          }
          handleFirestoreError(fsErr, OperationType.WRITE, `projects/${projectId}`);
        }
      }

      setProjects(prev => [newProject, ...prev]); 
      setNewFullName(''); setNewAfm(''); setNewOcwNumber(''); setAfmError(''); setIsModalOpen(false); 
      console.log("Opening project...");
      openProject(newProject); 
    } catch (err: any) { 
      console.error("Project creation error:", err);
      let errorMessage = "Παρουσιάστηκε σφάλμα κατά τη δημιουργία του φακέλου. Παρακαλώ δοκιμάστε ξανά.";
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error && parsed.error.includes('permission')) {
             errorMessage = "Δεν έχετε δικαίωμα δημιουργίας φακέλου. Παρακαλώ ελέγξτε τη σύνδεσή σας.";
          }
        } catch (e) {
          if (err.message.includes('permission')) {
             errorMessage = "Δεν έχετε δικαίωμα δημιουργίας φακέλου. Παρακαλώ ελέγξτε τη σύνδεσή σας.";
          } else {
             errorMessage = err.message;
          }
        }
      }
      setCreateError(errorMessage);
    } finally { 
      setIsCreatingCase(false); 
      console.log("Project creation finished.");
    }
  };

  const confirmDeleteProject = async () => { 
    if (projectToDelete) { 
      try {
        if (auth.currentUser) {
          await deleteDoc(doc(db, 'projects', projectToDelete));
        }
        setProjects(prev => prev.filter(p => p.id !== projectToDelete)); 
        setProjectToDelete(null); 
      } catch (err) {
        console.error("Error deleting project:", err);
        alert("Σφάλμα κατά τη διαγραφή.");
      }
    } 
  };
  const openProject = (project: Project) => { setActiveProjectId(project.id); setListA(project.listA || []); setListB(project.listB || []); setListC(project.listC || []); setListD(project.listD || []); setCurrentView('WORKSPACE'); };
  const goToDashboard = () => { setActiveProjectId(null); setListA([]); setListB([]); setListC([]); setListD([]); setCurrentView('DASHBOARD'); setActiveStatModal('NONE'); };
  const clearData = () => { setListA([]); setListB([]); };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'A' | 'B' | 'C' | 'D') => {
    const files = Array.from(e.target.files || []) as File[]; if (files.length === 0) return;
    setIsProcessing(true);
    const processingDelay = 1800; // 1.8 seconds for a good UX feel

    try {
      const allNewItems: any[] = [];
      const normalizeString = (str: string) => removeGreekAccents(String(str).toUpperCase()).replace(/[^A-Z0-9Α-Ω]/g, '');
    const findVal = (row: any, searchTerms: string[]) => {
      const keys = Object.keys(row);
      // First pass: Exact matches (normalized)
      for (const term of searchTerms) {
        const normalizedTerm = normalizeString(term);
        for (const key of keys) {
          if (normalizeString(key) === normalizedTerm) {
            if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key];
          }
        }
      }
      
      // Second pass: Safe Includes
      for (const term of searchTerms) {
        const normalizedTerm = normalizeString(term);
        if (normalizedTerm.length < 3) continue; 
        for (const key of keys) {
          const normalizedKey = normalizeString(key);
          if (normalizedKey.length < 3) continue;
          
          if (normalizedKey.includes(normalizedTerm)) {
            // Prevent false positive where 'ΠΟΣΟ' matches 'ΠΟΣΟΣΤΟ'
            if (normalizedTerm === 'ΠΟΣΟ' && normalizedKey.includes('ΠΟΣΟΣΤΟ')) continue;
            
            if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key];
          }
        }
      }
      return null;
    };

    const parsePercentage = (val: any): number => {
      if (val === undefined || val === null || String(val).trim() === '') return 100;
      const strVal = String(val).trim().replace(/%/g, '').replace(/,/g, '.');
      const num = parseFloat(strVal);
      return isNaN(num) ? 100 : num; 
    };

    const parseGreekNumber = (val: any): number => {
      if (val == null || val === '') return 0; if (typeof val === 'number') return val;
      let str = String(val).replace(/[^0-9,.-]/g, ''); 
      if (str.includes('.') && str.includes(',')) { 
        if (str.lastIndexOf(',') > str.lastIndexOf('.')) str = str.replace(/\./g, '').replace(',', '.'); 
        else str = str.replace(/,/g, ''); 
      } else if (str.includes(',')) { 
        if (str.split(',').length > 2) str = str.replace(/,/g, '');
        else str = str.replace(',', '.'); 
      }
      const parsed = parseFloat(str); return isNaN(parsed) ? 0 : parsed;
    };

    for (const file of files) {
      const fallbackOwnerName = activeProject?.afm && activeProject.afm !== '-' ? activeProject.afm : 'ΑΓΝΩΣΤΟ_ΑΦΜ'; 
      const fileId = Math.random().toString(36).substring(2, 9); 
      const data = await new Promise<any[]>((resolve) => {
        const reader = new FileReader(); 
        reader.onload = (evt) => { 
          try { 
            const wb = XLSX.read(evt.target?.result, { type: 'array' }); 
            
            let keywords: string[] = [];
            if (type === 'A') {
              keywords = ['ΑΦΜ', 'AFM', 'ΔΙΕΥΘΥΝΣΗ', 'ΟΔΟΣ', 'ΑΤΑΚ', 'ΚΑΕΚ', 'ΠΟΣΟΣΤΟ', 'ΕΙΔΟΣ', 'ΔΙΚΑΙΩΜΑ', 'ΚΑΤΑΣΚΕΥΗΣ', 'ΕΤΟΣ', 'ADDRESS', 'PROPERTY', 'RIGHT'];
            } else if (type === 'B') {
              keywords = ['ΑΦΜ', 'AFM', 'ΔΙΕΥΘΥΝΣΗ', 'ΟΔΟΣ', 'ΑΞΙΑ', 'ΕΚΤΙΜΩΜΕΝΗ', 'ΠΙΣΤΩΤΗΣ', 'ΠΟΣΟ', 'ΟΦΕΙΛΗΣ', 'ΚΩΔΙΚΟΣ', 'CREDITOR', 'AMOUNT', 'VALUE', 'ASSET'];
            } else if (type === 'C') {
              keywords = ['ΠΙΣΤΩΤΗΣ', 'ΕΞΑΣΦΑΛΙΣΗΣ', 'ΒΑΡΟΥΣ', 'ΠΡΟΣΗΜΕΙΩΣΗΣ', 'ΣΕΙΡΑ', 'ΤΑΞΗ', 'CREDITOR', 'COLLATERAL', 'ORDER', 'RANK'];
            } else if (type === 'D') {
              keywords = ['ΑΦΜ ΔΙΚΑΙΟΥΧΟΥ', 'ΑΦΜ', 'ΑΞΙΑ', 'ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΟΥ', 'ΠΡΟΙΟΝΤΟΣ', 'ΚΑΤΗΓΟΡΙΑ', 'ΠΕΡΙΓΡΑΦΗ', 'ΛΟΓΑΡΙΑΣΜΟΣ'];
            }

            let bestSheetName = wb.SheetNames[0];
            let maxOverallMatches = -1;
            let bestHeaderRowIndex = 0;

            for (const sheetName of wb.SheetNames) {
              const sheet = wb.Sheets[sheetName];
              const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
              let headerRowIndex = 0; let maxMatches = 0;
              for (let i = 0; i < Math.min(50, rawData.length); i++) {
                const row = rawData[i];
                if (!row || !Array.isArray(row)) continue;
                let matches = 0;
                const rowStrings = row.map((cell: any) => normalizeString(String(cell || '')));
                for (const cell of rowStrings) { for (const kw of keywords) { if (cell && cell.includes(normalizeString(kw))) matches++; } }
                if (matches > maxMatches) { maxMatches = matches; headerRowIndex = i; }
              }
              if (maxMatches > maxOverallMatches) {
                maxOverallMatches = maxMatches;
                bestSheetName = sheetName;
                bestHeaderRowIndex = headerRowIndex;
              }
            }

            const sheet = wb.Sheets[bestSheetName];
            let jsonData = XLSX.utils.sheet_to_json(sheet, { range: bestHeaderRowIndex }) as any[];
            
            // Fix for semicolon-separated CSVs parsed as a single column
            if (jsonData.length > 0) {
              const firstRowKeys = Object.keys(jsonData[0] || {});
              if (firstRowKeys.length === 1 && firstRowKeys[0] && String(firstRowKeys[0]).includes(';')) {
                const headers = String(firstRowKeys[0]).split(';');
                jsonData = jsonData.map((row: any) => {
                  const values = String(row[firstRowKeys[0]] || '').split(';');
                  const newRow: any = {};
                  headers.forEach((h, i) => { newRow[h] = values[i]; });
                  return newRow;
                });
              }
            }
            resolve(jsonData); 
          } catch (error) { 
            console.error("Error parsing Excel:", error);
            resolve([]); 
          } 
        }; 
        reader.readAsArrayBuffer(file);
      });

      if (type === 'A') {
        const mappedAssets = data.map((row: any, index) => {
          const rawAfm = findVal(row, ['ΑΦΜ', 'Α.Φ.Μ.', 'TAXID', 'AFM', 'ΑΦΜ ΟΦΕΙΛΕΤΗ', 'ΑΦΜΟΦΕΙΛΕΤΗ', 'ΑΦΜΣΥΝΙΔΙΟΚΤΗΤΗ', 'ΑΦΜΙΔΙΟΚΤΗΤΗ']); 
          const memberTypeVal = String(findVal(row, ['ΤΥΠΟΣ ΜΕΛΟΥΣ', 'ΣΧΕΣΗ', 'ΙΔΙΟΤΗΤΑ', 'ΤΥΠΟΣΜΕΛΟΥΣ', 'MEMBERTYPE']) || '').trim();
          const desc = String(findVal(row, ['ΔΙΕΥΘΥΝΣΗ / ΠΕΡΙΟΧΗ', 'ΔΙΕΥΘΥΝΣΗ', 'ADDRESS', 'ΟΔΟΣ', 'ΔΙΕΥΘΥΝΣΗ ΑΚΙΝΗΤΟΥ', 'ΠΕΡΙΓΡΑΦΗ', 'ΔΙΕΥΘΥΝΣΗΠΕΡΙΟΧΗ']) || '');
          const reg = String(findVal(row, ['ΠΕΡΙΟΧΗ', 'REGION', 'AREA', 'ΔΗΜΟΣ', 'ΤΟΠΟΘΕΣΙΑ', 'CITY']) || ''); 
          const atakVal = String(findVal(row, ['ΑΤΑΚ', 'ATAK', 'Α.Τ.Α.Κ.']) || ''); 
          const rightTypeVal = String(findVal(row, ['ΕΙΔΟΣ ΔΙΚΑΙΩΜΑΤΟΣ', 'ΔΙΚΑΙΩΜΑ', 'RIGHTTYPE', 'ΕΙΔΟΣΔΙΚΑΙΩΜΑΤΟΣ']) || '');
          const objVal = parseGreekNumber(findVal(row, ['ΑΝΤΙΚΕΙΜΕΝΙΚΗ ΑΞΙΑ', 'ΑΞΙΑ ΑΚΙΝΗΤΟΥ', 'ΑΞΙΑ', 'VALUE', 'ΑΞΙΑΑΚΙΝΗΤΟΥ', 'ΑΝΤΙΚΕΙΜΕΝΙΚΗΑΞΙΑ']) || 0);
          const pct = parsePercentage(findVal(row, ['ΠΟΣΟΣΤΟ ΣΥΝΙΔΙΟΚΤΗΣΙΑΣ', 'ΠΟΣΟΣΤΟ', 'PERCENTAGE', 'ΠΟΣΟΣΤΟ %', 'ΠΟΣΟΣΤΟΣΥΝΙΔΙΟΚΤΗΣΙΑΣ', 'ΠΟΣΟΣΤΟΙΔΙΟΚΤΗΣΙΑΣ']));
          
          const isEmpty = Object.values(row).every(v => v === null || v === undefined || String(v).trim() === '');
          if (isEmpty) return null;
          
          // If we have neither AFM nor Description nor Value, it's likely a bad row
          if (!rawAfm && desc.trim() === '' && objVal === 0) return null;
          
          return { 
            id: `A-${fileId}-${index}`, 
            description: desc || 'ΧΩΡΙΣ ΔΙΕΥΘΥΝΣΗ', 
            region: reg, 
            kaek: '', 
            atak: atakVal.trim(), 
            ownershipPercentage: pct, 
            objectiveValue: objVal, 
            type: 'PROPERTY', 
            ownerName: rawAfm ? String(rawAfm).trim() : fallbackOwnerName, 
            afm: rawAfm ? String(rawAfm).trim() : fallbackOwnerName,
            memberType: memberTypeVal, 
            rightType: rightTypeVal 
          };
        }).filter(Boolean) as Asset[]; 
        allNewItems.push(...mappedAssets);
      } else if (type === 'B') {
        const abbreviateCreditor = (name: string) => {
          if (!name || name === 'N/A') return 'N/A';
          const upper = removeGreekAccents(name.toUpperCase());
          if (upper.includes('INTRUM')) return 'INTRUM';
          if (upper.includes('DOVALUE') || upper.includes('DO VALUE')) return 'DOVALUE';
          if (upper.includes('CEPAL')) return 'CEPAL';
          if (upper.includes('QQUANT') || upper.includes('QUANT')) return 'QQUANT';
          if (upper.includes('VIVA')) return 'VIVA';
          if (upper.includes('ΕΘΝΙΚΗ') || upper.includes('NATIONAL')) return 'ΕΘΝΙΚΗ';
          if (upper.includes('ΠΕΙΡΑΙΩΣ') || upper.includes('PIRAEUS')) return 'ΠΕΙΡΑΙΩΣ';
          if (upper.includes('ΑΛΦΑ') || upper.includes('ALPHA')) return 'ALPHA BANK';
          if (upper.includes('EUROBANK')) return 'EUROBANK';
          
          // Keep only first 3 words for others
          return name.split(/\s+/).slice(0, 3).join(' ');
        };
        const mappedEncumbrances = data.map((row: any, index) => {
          const rawAfm = findVal(row, ['ΑΦΜΟΦΕΙΛΕΤΗ', 'ΑΦΜ', 'TAXID', 'AFM', 'ΑΦΜΕΤΑΙΡΕΙΑΣ', 'ΑΦΜΠΕΛΑΤΗ', 'VAT', 'DEBTORVAT']);
          let addr = String(findVal(row, ['ΔΙΕΥΘΥΝΣΗ', 'ADDRESS', 'ΟΔΟΣ', 'ΠΕΡΙΓΡΑΦΗ', 'LOCATION', 'ΔΙΕΥΘΥΝΣΗΑΚΙΝΗΤΟΥ', 'ΔΙΕΥΘΥΝΣΗΠΕΡΙΟΧΗ']) || '').trim();
          let area = String(findVal(row, ['ΠΕΡΙΟΧΗ', 'REGION', 'AREA', 'ΔΗΜΟΣ', 'ΤΟΠΟΘΕΣΙΑ', 'CITY']) || '').trim();
          if (addr === '-') addr = ''; if (area === '-') area = '';
          const finalLocation = `${addr} ${area}`.trim() || 'ΑΓΝΩΣΤΗ';
          const amtVal = parseGreekNumber(findVal(row, ['ΕΚΤΙΜΩΜΕΝΗΑΞΙΑΠΕΡΙΟΥΣΙΑΚΟΥΣΤΟΙΧΕΙΟΥ', 'ΠΟΣΟ', 'ΑΞΙΑ', 'ΕΚΤΙΜΩΜΕΝΗΑΞΙΑ', 'ΑΞΙΑΑΚΙΝΗΤΟΥ', 'ΕΜΠΟΡΙΚΗΑΞΙΑ', 'ΠΟΣΟΟΦΕΙΛΗΣ', 'ΥΠΟΛΟΙΠΟ', 'VALUE', 'ESTIMATEDVALUE', 'AMOUNT']) || 0);
          const assetCodeVal = String(findVal(row, ['ΚΩΔΙΚΟΣΠΕΡΙΟΥΣΙΑΚΟΥΣΤΟΙΧΕΙΟΥ', 'ΚΩΔΙΚΟΣ', 'ΚΩΔΙΚΟΣΑΚΙΝΗΤΟΥ', 'ASSETCODE', 'CODE']) || '');
          const rawCreditor = String(findVal(row, ['ΕΠΩΝΥΜΙΑΠΙΣΤΩΤΗΔΙΑΧΕΙΡΙΣΤΗ', 'ΕΠΩΝΥΜΙΑΠΙΣΤΩΤΗ', 'ΕΠΩΝΥΜΙΑΔΙΑΧΕΙΡΙΣΤΗ', 'ΠΙΣΤΩΤΗΣ', 'ΔΙΑΧΕΙΡΙΣΤΗΣ', 'ΤΡΑΠΕΖΑ', 'ΕΤΑΙΡΕΙΑΔΙΑΧΕΙΡΙΣΗΣ', 'CREDITOR', 'SERVICER']) || 'N/A');
          const encumbrancesText = String(findVal(row, ['ΒΑΡΗ', 'ΕΞΑΣΦΑΛΙΣΕΙΣ', 'ΠΡΟΣΗΜΕΙΩΣΕΙΣ', 'ΕΜΠΡΑΓΜΑΤΑΒΑΡΗ', 'ENCUMBRANCES', 'BURDENS']) || 'ΜΗ ΔΙΑΘΕΣΙΜΟ');
          const assetCat = String(findVal(row, ['ΚΑΤΗΓΟΡΙΑ ΠΕΡΙΟΥΣΙΑΚΟΥ ΣΤΟΙΧΕΙΟΥ', 'ΚΑΤΗΓΟΡΙΑΠΕΡΙΟΥΣΙΑΚΟΥΣΤΟΙΧΕΙΟΥ', 'ΚΑΤΗΓΟΡΙΑ']) || '').trim();
          const isEmpty = Object.values(row).every(v => v === null || v === undefined || String(v).trim() === '');
          if (isEmpty) return null;
          
          // Default to ΑΚΙΝΗΤΟ only if category is missing AND we have an address or asset code
          const finalAssetCat = assetCat || (finalLocation !== 'ΑΓΝΩΣΤΗ' || assetCodeVal ? 'ΑΚΙΝΗΤΟ' : 'ΛΟΙΠΟ');
          
          // Fallback if nothing was found
          if (!rawAfm && finalLocation === 'ΑΓΝΩΣΤΗ' && amtVal === 0 && assetCodeVal.trim() === '' && encumbrancesText === 'ΜΗ ΔΙΑΘΕΣΙΜΟ') {
            const vals = Object.values(row);
            if (vals.length > 2) {
              return { 
                id: `B-${fileId}-${index}-fallback`, 
                assetCode: String(vals[0] || '').trim(), 
                kaek: '', 
                address: String(vals[1] || 'ΑΓΝΩΣΤΗ'), 
                region: '', 
                creditor: abbreviateCreditor(String(vals[2] || 'N/A')), 
                type: 'N/A', 
                amount: parseGreekNumber(vals[3] || 0), 
                commercialValue: parseGreekNumber(vals[3] || 0), 
                ownerName: fallbackOwnerName, 
                assetCategory: assetCat 
              };
            }
            return null;
          }
          
          return { id: `B-${fileId}-${index}`, assetCode: assetCodeVal.trim(), kaek: '', address: finalLocation, region: '', creditor: abbreviateCreditor(rawCreditor), type: encumbrancesText, amount: amtVal, commercialValue: amtVal, ownerName: rawAfm ? String(rawAfm).trim() : fallbackOwnerName, assetCategory: finalAssetCat };
        }).filter(Boolean) as FundAsset[]; 
        
        if (mappedEncumbrances.length === 0 && data.length > 0) {
           // Extreme fallback: map everything by index if headers are completely unrecognizable
           const extremeFallback = data.map((row: any, index) => {
              const vals = Object.values(row);
              if (vals.length < 2) return null;
              const assetCatExt = String(findVal(row, ['ΚΑΤΗΓΟΡΙΑ ΠΕΡΙΟΥΣΙΑΚΟΥ ΣΤΟΙΧΕΙΟΥ', 'ΚΑΤΗΓΟΡΙΑΠΕΡΙΟΥΣΙΑΚΟΥΣΤΟΙΧΕΙΟΥ', 'ΚΑΤΗΓΟΡΙΑ']) || 'ΑΚΙΝΗΤΟ').trim();
              return { 
                id: `B-${fileId}-${index}-ext`, 
                assetCode: String(vals[4] || vals[0] || '').trim(), 
                kaek: '', 
                address: String(vals[6] || vals[1] || 'ΑΓΝΩΣΤΗ'), 
                region: '', 
                creditor: abbreviateCreditor(String(vals[1] || vals[2] || 'N/A')), 
                type: String(vals[9] || 'N/A'), 
                amount: parseGreekNumber(vals[8] || vals[3] || 0), 
                commercialValue: parseGreekNumber(vals[8] || vals[3] || 0), 
                ownerName: String(vals[2] || fallbackOwnerName), 
                assetCategory: assetCatExt 
              };
           }).filter(Boolean) as FundAsset[];
           allNewItems.push(...extremeFallback);
        } else {
           allNewItems.push(...mappedEncumbrances);
        }
      } else if (type === 'C') {
        const mappedCollaterals = data.map((row: any, index) => {
          const creditorVal = String(findVal(row, ['ΕΠΩΝΥΜΙΑΠΙΣΤΩΤΗΔΙΑΧΕΙΡΙΣΤΗ', 'ΕΠΩΝΥΜΙΑΠΙΣΤΩΤΗ', 'ΕΠΩΝΥΜΙΑΔΙΑΧΕΙΡΙΣΤΗ', 'ΠΙΣΤΩΤΗΣ', 'ΔΙΑΧΕΙΡΙΣΤΗΣ', 'ΤΡΑΠΕΖΑ', 'ΕΤΑΙΡΕΙΑΔΙΑΧΕΙΡΙΣΗΣ', 'CREDITOR', 'SERVICER']) || '');
          const collateralCodeVal = String(findVal(row, ['ΚΩΔΙΚΟΣΕΞΑΣΦΑΛΙΣΗΣ', 'ΚΩΔΙΚΟΣΒΑΡΟΥΣ', 'ΚΩΔΙΚΟΣΠΡΟΣΗΜΕΙΩΣΗΣ', 'COLLATERALCODE', 'CODE']) || '');
          const amtVal = parseGreekNumber(findVal(row, ['ΠΟΣΟΕΞΑΣΦΑΛΙΣΗΣ', 'ΠΟΣΟΒΑΡΟΥΣ', 'ΠΟΣΟΠΡΟΣΗΜΕΙΩΣΗΣ', 'ΠΟΣΟ', 'ΑΞΙΑΕΞΑΣΦΑΛΙΣΗΣ', 'AMOUNT', 'VALUE']) || 0);
          const assetCodeVal = String(findVal(row, ['ΚΩΔΙΚΟΣΠΕΡΙΟΥΣΙΑΚΟΥΣΤΟΙΧΕΙΟΥ', 'ΚΩΔΙΚΟΣΑΚΙΝΗΤΟΥ', 'ΚΩΔΙΚΟΣ', 'ASSETCODE']) || '');
          const orderVal = parseInt(String(findVal(row, ['ΣΕΙΡΑΠΡΟΣΗΜΕΙΩΣΗΣ', 'ΣΕΙΡΑ', 'ΤΑΞΗ', 'ΤΑΞΗΠΡΟΣΗΜΕΙΩΣΗΣ', 'ΣΕΙΡΑΕΓΓΡΑΦΗΣ', 'ORDER', 'RANK']) || '0'), 10) || 0;
          if (assetCodeVal.trim() === '') return null;
          return { id: `C-${fileId}-${index}`, assetCode: assetCodeVal.trim(), creditor: creditorVal.trim(), amount: amtVal, type: collateralCodeVal.trim(), order: orderVal };
        }).filter(Boolean) as Collateral[];
        allNewItems.push(...mappedCollaterals);
      } else if (type === 'D') {
        const mappedFinancials = data.map((row: any, index) => {
          const rawAfm = findVal(row, ['ΑΦΜ ΔΙΚΑΙΟΥΧΟΥ', 'ΑΦΜ ΔΙΚΑΙΟΥΧΩΝ', 'ΑΦΜ', 'Α.Φ.Μ.', 'TAXID', 'AFM']);
          const assetCategory = String(findVal(row, ['ΚΑΤΗΓΟΡΙΑ ΠΕΡΙΟΥΣΙΑΚΟΥ ΣΤΟΙΧΕΙΟΥ', 'ΚΑΤΗΓΟΡΙΑ', 'ΕΙΔΟΣ', 'CATEGORY', 'ΤΥΠΟΣ', 'TYPE']) || '');
          const desc = String(findVal(row, ['ΠΕΡΙΓΡΑΦΗ', 'DESCRIPTION', 'ΛΕΠΤΟΜΕΡΕΙΕΣ', 'ΛΟΓΑΡΙΑΣΜΟΣ', 'ΑΡΙΘΜΟΣ', 'ΣΧΟΛΙΑ']) || '');
          const val = parseGreekNumber(findVal(row, ['ΑΞΙΑ ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΟΥ ΠΡΟΪΟΝΤΟΣ', 'ΑΞΙΑ ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΟΥ', 'ΑΞΙΑ', 'ΥΠΟΛΟΙΠΟ', 'VALUE', 'BALANCE', 'ΠΟΣΟ', 'AMOUNT']) || 0);
          
          if (!rawAfm && val === 0) return null;
          
          return {
            id: `D-${fileId}-${index}`,
            afm: rawAfm ? String(rawAfm).trim() : fallbackOwnerName,
            assetCategory: assetCategory.trim(),
            description: desc.trim(),
            value: val
          };
        }).filter(Boolean) as FinancialAsset[];
        allNewItems.push(...mappedFinancials);
      }
    }
    
    setTimeout(() => {
      if (allNewItems.length === 0) {
        alert("Το αρχείο φαίνεται να είναι άδειο ή δεν βρέθηκαν έγκυρα δεδομένα.");
      } else {
        if (type === 'A') setListA(prev => [...prev, ...allNewItems]); 
        else if (type === 'B') setListB(prev => [...prev, ...allNewItems]); 
        else if (type === 'C') setListC(prev => [...prev, ...allNewItems]); 
        else setListD(prev => [...prev, ...allNewItems]);
      }
      
      setIsProcessing(false);
      if (e.target) e.target.value = ''; 
    }, processingDelay);
  } catch (error) {
    console.error("Error processing file:", error);
    setIsProcessing(false);
  }
};

  const { filteredListA, spouseAlerts } = useMemo(() => {
    if (!listA || listA.length === 0) return { filteredListA: [], spouseAlerts: [] };
    
    const uniqueAssets = new Map<string, Asset>();
    
    (listA || []).forEach(a => {
      if (!a) return;
      const afm = String(a.afm || a.ownerName || '').trim();
      const desc = String(a.description || '').trim();
      const reg = String(a.region || '').trim();
      const pct = a.ownershipPercentage || 0;
      const val = a.objectiveValue || 0;
      const atak = String(a.atak || '').trim();
      const mType = String(a.memberType || '').trim();
      
      if (afm === '' && desc === '') return;

      // Deduplication key: AFM + Description + Region + Percentage + Value + ATAK
      // We ignore MemberType in the key to merge Co-debtor/Spouse if they are the same person with same property
      const key = `${afm}-${desc}-${reg}-${pct}-${val}-${atak}`;
      
      if (!uniqueAssets.has(key)) {
        uniqueAssets.set(key, a);
      } else {
        // If duplicate found, prioritize the role
        const existing = uniqueAssets.get(key)!;
        const priority = (t: string) => {
          if (!t) return 0;
          const ut = String(t).toUpperCase();
          if (ut.includes('ΑΙΤΩΝ') || ut.includes('ΑΙΤΟΥΣΑ')) return 3;
          if (ut.includes('ΣΥΝΟΦΕΙΛΕΤΗΣ')) return 2;
          if (ut.includes('ΣΥΖΥΓΟΣ')) return 1;
          return 0;
        };
        if (priority(mType) > priority(existing.memberType || '')) {
          uniqueAssets.set(key, a);
        }
      }
    });

    return { filteredListA: Array.from(uniqueAssets.values()), spouseAlerts: [] };
  }, [listA]);

  const results = useMemo(() => {
    const singularized: SingularizedAsset[] = [];
    const matchedIndices = new Set<number>();
    const list = [...(filteredListA || [])];
    const groups: number[][] = [];

    // First, identify all groups
    for (let i = 0; i < list.length; i++) {
      if (matchedIndices.has(i)) continue;

      const baseAsset = list[i];
      const groupIndices: number[] = [i];
      matchedIndices.add(i);

      // Only search for matches if percentage < 100
      if ((baseAsset.ownershipPercentage || 0) < 100) {
        for (let j = i + 1; j < list.length; j++) {
          if (matchedIndices.has(j)) continue;
          
          const candidate = list[j];
          const candidateAfm = String(candidate.afm || candidate.ownerName || '').trim();
          
          // NEW RULE: Never match assets belonging to the same AFM
          const afmsInGroup = groupIndices.map(idx => String(list[idx].afm || list[idx].ownerName || '').trim());
          if (afmsInGroup.includes(candidateAfm)) continue;

          // Proportional Value Matching: (Value / Percentage) * 100 should be roughly equal
          const val100_1 = (baseAsset.objectiveValue || 0) / (baseAsset.ownershipPercentage || 1);
          const val100_2 = (candidate.objectiveValue || 0) / (candidate.ownershipPercentage || 1);
          const valueDiff = Math.abs(val100_1 - val100_2);

          if (valueDiff < 10) { // Allow small rounding differences
            const addr1 = `${baseAsset.description} ${baseAsset.region}`;
            const addr2 = `${candidate.description} ${candidate.region}`;
            
            if (fuzzyMatchStrings(addr1, addr2)) {
              const currentTotalPct = groupIndices.reduce((sum, idx) => sum + (list[idx].ownershipPercentage || 0), 0);
              if (currentTotalPct + (candidate.ownershipPercentage || 0) <= 100.01) {
                groupIndices.push(j);
                matchedIndices.add(j);
              }
            }
          }
        }
      }
      groups.push(groupIndices);
    }

    // Then, create separate SingularizedAsset entries for each asset in each group
    groups.forEach((groupIndices, groupIdx) => {
      const globalCode = groupIdx + 1;
      const allAfmsInGroup = groupIndices.map(idx => String(list[idx].afm || list[idx].ownerName || '').trim());
      const totalGroupOwnership = groupIndices.reduce((sum, idx) => sum + (list[idx].ownershipPercentage || 0), 0);
      
      groupIndices.forEach(idx => {
        const asset = list[idx];
        const currentAfm = String(asset.afm || asset.ownerName || '').trim();
        const sharedWith = Array.from(new Set(allAfmsInGroup)).filter(afm => afm !== currentAfm);

        singularized.push({
          asset: { ...asset },
          originalAssets: [asset], 
          encumbrances: [],
          collaterals: [],
          liquidationValue: asset.objectiveValue || 0,
          totalAssetValue: asset.objectiveValue || 0,
          status: 'FREE',
          alerts: [],
          globalCode,
          bankCode: undefined,
          sharedWith,
          totalGroupOwnership // Store for UI labeling
        });
      });
    });

    // Match Encumbrances (List B) to Assets
    const otherAssetsMap = new Map<string, { afm: string; category: string; value: number; creditors: Set<string>; claims: any[] }>();
    
    // Expanded keywords for better property detection
    const propertyKeywords = [
      'ΑΚΙΝΗΤΟ', 'ΑΚΙΝΗΤΑ', 'ΓΗΠΕΔΟ', 'ΟΙΚΟΠΕΔΟ', 'ΚΑΤΟΙΚΙΑ', 'ΔΙΑΜΕΡΙΣΜΑ', 'ΑΠΟΘΗΚΗ', 
      'ΘΕΣΗ ΣΤΑΘΜΕΥΣΗΣ', 'ΑΓΡΟΤΕΜΑΧΙΟ', 'ΚΤΙΡΙΟ', 'ΚΤΙΡΙΑ', 'ΟΙΚΙΑ', 'ΚΑΤΑΣΤΗΜΑ', 
      'ΓΡΑΦΕΙΟ', 'ΕΠΑΓΓΕΛΜΑΤΙΚΗ', 'ΣΤΕΓΗ', 'ΕΔΑΦΟΣ', 'ΑΓΡΟΣ', 'ΟΙΚΟΔΟΜΗ', 'ΔΩΜΑ',
      'ΚΑΛΥΒΗ', 'ΣΤΑΥΛΟΣ', 'ΒΙΟΜΗΧΑΝΟΣΤΑΣΙΟ', 'ΞΕΝΟΔΟΧΕΙΟ', 'ΣΤΑΘΜΟΣ', 'ΚΛΙΝΙΚΗ', 'ΣΧΟΛΕΙΟ'
    ];
    
    (listB || []).forEach(enc => {
      const encAfm = String(enc.ownerName || '').trim();
      const encAddr = String(enc.address || '').trim();
      const encVal = enc.amount || 0;
      const encCategory = String(enc.assetCategory || '').trim().toUpperCase();
      const encType = String(enc.type || '').toUpperCase();
      const normalizedCat = removeGreekAccents(encCategory);
      const normalizedType = removeGreekAccents(encType);
      const normalizedAddr = removeGreekAccents(encAddr);
      
      // Strict property detection: If category is explicitly "ΑΚΙΝΗΤΟ", it's a property.
      // If category is something else (e.g. "ΑΥΤΟΚΙΝΗΤΟ", "ΚΑΤΑΘΕΣΕΙΣ"), it's NOT a property.
      // If category is empty, we fall back to keywords in address/type.
      const isPropertyCategory = 
        normalizedCat.includes('AKINHTO') || 
        normalizedCat.includes('PROPERTY') ||
        propertyKeywords.some(kw => normalizedCat.includes(removeGreekAccents(kw))) ||
        (encCategory === '' && (propertyKeywords.some(kw => normalizedAddr.includes(removeGreekAccents(kw))) || propertyKeywords.some(kw => normalizedType.includes(removeGreekAccents(kw)))));

      const isSpecialCategory = (text: string) => {
        const t = removeGreekAccents(text).toUpperCase();
        return t.includes('LOIPA') || t.includes('EGGYHSH') || t.includes('EED') || t.includes('E.E.D.') ||
               t.includes('APOTHEMATA') || t.includes('GRAMMATEIA') || t.includes('EMPOREYMATA') ||
               t.includes('PISTOSH') || t.includes('EXOPLIS') ||
               ['METAFORIKA', 'KINHTA', 'APAITHSEIS', 'KATATHESEIS', 'SYMMETOXES', 'PLOIA', 'AYTOKINHTO', 'SKAFOS'].some(kw => {
                 const nkw = removeGreekAccents(kw);
                 // Ensure "ΑΚΙΝΗΤΟ" doesn't match "ΚΙΝΗΤΟ"
                 if (nkw === 'KINHTA' && t.includes('AKINHTO')) return false;
                 return t.includes(nkw);
               });
      };

      const isSpecial = isSpecialCategory(encCategory) || isSpecialCategory(encAddr) || isSpecialCategory(encType);
      const specialDesc = isSpecialCategory(encCategory) ? enc.assetCategory : (isSpecialCategory(encAddr) ? enc.address : enc.type);

      // 1. Check for manual match first
      if (manualMatches[enc.id]) {
        const targetGlobalCode = manualMatches[enc.id];
        let targetAsset = singularized.find(s => s.globalCode === targetGlobalCode && String(s.asset.afm || s.asset.ownerName || '').trim() === encAfm);
        if (!targetAsset) {
          targetAsset = singularized.find(s => s.globalCode === targetGlobalCode);
        }
        if (targetAsset) {
          targetAsset.encumbrances.push({
            ...enc,
            isFuzzyMatch: false,
            matchReason: 'Χειροκίνητη Ταύτιση'
          });
          targetAsset.bankCode = enc.assetCode || targetAsset.bankCode;
          return;
        }
      }

      // 2. Try to match against existing properties (List A)
      const afmMatches = singularized.filter(s => 
        s.asset.type !== 'OTHER_ASSET' && 
        s.asset.type !== 'FINANCIAL_ASSET' &&
        s.asset.type !== 'SPECIAL' &&
        String(s.asset.afm || s.asset.ownerName || '').trim() === encAfm
      );
      
      if (afmMatches.length > 0) {
        const addrMatches = afmMatches.filter(s => {
          const assetAddr = `${s.asset.description} ${s.asset.region}`;
          return fuzzyMatchStrings(encAddr, assetAddr);
        });

        if (addrMatches.length > 0) {
          let bestMatch: SingularizedAsset;
          const belowOrEqual = addrMatches.filter(m => (m.asset.objectiveValue || 0) <= encVal);
          
          if (belowOrEqual.length > 0) {
            bestMatch = belowOrEqual.reduce((prev, curr) => 
              (curr.asset.objectiveValue || 0) > (prev.asset.objectiveValue || 0) ? curr : prev
            );
          } else {
            bestMatch = addrMatches.reduce((prev, curr) => 
              Math.abs((curr.asset.objectiveValue || 0) - encVal) < Math.abs((prev.asset.objectiveValue || 0) - encVal) ? curr : prev
            );
          }

          const isExact = normalizePhonetic(encAddr) === normalizePhonetic(`${bestMatch.asset.description} ${bestMatch.asset.region}`);
          bestMatch.encumbrances.push({
            ...enc,
            isFuzzyMatch: !isExact,
            matchReason: !isExact ? `Ταυτοποίηση λόγω κοινής Δ/νσης ακινήτου και αξίας (€${bestMatch.asset.objectiveValue?.toLocaleString()})` : undefined
          });
          bestMatch.bankCode = enc.assetCode;
          return;
        }
      }

      // 2.5. Try to match against ALL properties (Third-party property / Ακίνητο Τρίτου)
      if (isPropertyCategory) {
        const allMatches = singularized.filter(s => 
          s.asset.type !== 'OTHER_ASSET' && 
          s.asset.type !== 'FINANCIAL_ASSET' &&
          s.asset.type !== 'SPECIAL' &&
          Number(s.globalCode) > 0 &&
          String(s.asset.afm || s.asset.ownerName || '').trim() !== encAfm
        );
        
        if (allMatches.length > 0) {
          const addrMatches = allMatches.filter(s => {
            const assetAddr = `${s.asset.description} ${s.asset.region}`;
            return fuzzyMatchStrings(encAddr, assetAddr);
          });

          if (addrMatches.length > 0) {
            let bestMatch: SingularizedAsset;
            const belowOrEqual = addrMatches.filter(m => (m.asset.objectiveValue || 0) <= encVal);
            
            if (belowOrEqual.length > 0) {
              bestMatch = belowOrEqual.reduce((prev, curr) => 
                (curr.asset.objectiveValue || 0) > (prev.asset.objectiveValue || 0) ? curr : prev
              );
            } else {
              bestMatch = addrMatches.reduce((prev, curr) => 
                Math.abs((curr.asset.objectiveValue || 0) - encVal) < Math.abs((prev.asset.objectiveValue || 0) - encVal) ? curr : prev
              );
            }

            const isExact = normalizePhonetic(encAddr) === normalizePhonetic(`${bestMatch.asset.description} ${bestMatch.asset.region}`);
            const otherAfm = String(bestMatch.asset.afm || bestMatch.asset.ownerName || '').trim();
            
            const thirdPartyAsset: SingularizedAsset = {
              asset: { 
                id: `THIRD-PARTY-${enc.id}`, 
                description: bestMatch.asset.description || '', 
                afm: encAfm, 
                ownerName: encAfm, 
                region: bestMatch.asset.region || '', 
                objectiveValue: encVal, 
                ownershipPercentage: 0, 
                atak: bestMatch.asset.atak, 
                memberType: '', 
                kaek: bestMatch.asset.kaek, 
                type: 'PROPERTY' 
              },
              originalAssets: [{ 
                id: `THIRD-PARTY-ORIG-${enc.id}`, 
                description: bestMatch.asset.description || '', 
                afm: encAfm, 
                ownerName: encAfm, 
                region: bestMatch.asset.region || '', 
                objectiveValue: encVal, 
                ownershipPercentage: 0, 
                atak: bestMatch.asset.atak, 
                memberType: '', 
                kaek: bestMatch.asset.kaek, 
                type: 'PROPERTY' 
              }],
              encumbrances: [{
                ...enc,
                isFuzzyMatch: !isExact,
                matchReason: `Ακίνητο Τρίτου (Ταυτοποίηση με ΑΦΜ ${otherAfm})`
              }],
              collaterals: [],
              liquidationValue: 0,
              totalAssetValue: 0,
              status: 'FREE',
              alerts: [{ type: 'INFO', message: `Ακίνητο Τρίτου (ΑΦΜ ${otherAfm})` }],
              globalCode: bestMatch.globalCode,
              bankCode: enc.assetCode,
              sharedWith: [],
              totalGroupOwnership: 0,
              matchReason: `Ακίνητο Τρίτου (Ταυτοποίηση με ΑΦΜ ${otherAfm})`
            };
            
            singularized.push(thirdPartyAsset);
            return;
          }
        }
      }

      // 3. If not matched, decide if it's an Orphan Property or an Other Asset
      if (isPropertyCategory) {
        // Orphan Property
        const existingOrphan = singularized.find(s => 
          s.globalCode === 0 && 
          s.asset.type === 'ORPHAN_PROPERTY' &&
          String(s.asset.afm || '').trim() === encAfm &&
          (s.asset.description === `ΟΡΦΑΝΟ ΒΑΡΟΣ: ${encAddr}` || (encVal > 0 && Math.abs((s.asset.objectiveValue || 0) - encVal) <= 0.011))
        );
        if (existingOrphan) {
          existingOrphan.encumbrances.push(enc);
          if (existingOrphan.asset.objectiveValue === encVal && !existingOrphan.asset.description.includes(encAddr)) {
             existingOrphan.asset.description += ` / ${encAddr}`;
          }
        } else {
          singularized.push({
            asset: { id: `ORPHAN-${enc.id}`, description: encAfm ? `ΟΡΦΑΝΟ ΒΑΡΟΣ: ${encAddr}` : `ΟΡΦΑΝΟ ΒΑΡΟΣ (ΑΓΝΩΣΤΟ ΑΦΜ): ${encAddr}`, afm: encAfm, ownerName: encAfm, region: '', objectiveValue: encVal, ownershipPercentage: 0, atak: '', memberType: '', kaek: '', type: 'ORPHAN_PROPERTY' },
            originalAssets: [],
            encumbrances: [enc],
            collaterals: [],
            liquidationValue: 0,
            totalAssetValue: 0,
            status: 'FREE',
            alerts: [{ type: encAfm ? 'WARNING' : 'ERROR', message: encAfm ? 'Βάρος χωρίς ταυτοποιημένο ακίνητο' : 'Βάρος σε ΑΦΜ που δεν υπάρχει στο Ε9' }],
            globalCode: 0,
            bankCode: enc.assetCode,
            sharedWith: [],
            totalGroupOwnership: 0
          });
        }
      } else {
        // Other Asset (Non-Property) or Special Category
        const afm = encAfm;
        const category = isSpecial ? (specialDesc || 'ΕΙΔΙΚΗ ΚΑΤΗΓΟΡΙΑ') : (encCategory || 'ΛΟΙΠΟ ΠΕΡΙΟΥΣΙΑΚΟ ΣΤΟΙΧΕΙΟ');
        const value = encVal;
        const roundedValue = Math.round(value * 100) / 100;

        if (!afm) {
          singularized.push({
            asset: { id: `ORPHAN-OTHER-${enc.id}`, description: `ΟΡΦΑΝΟ ΛΟΙΠΟ ΣΤΟΙΧΕΙΟ (ΑΓΝΩΣΤΟ ΑΦΜ): ${category}`, afm: '', ownerName: '', region: '', objectiveValue: value, ownershipPercentage: 0, atak: '', memberType: '', kaek: '', type: 'ORPHAN_OTHER' },
            originalAssets: [],
            encumbrances: [enc],
            collaterals: [],
            liquidationValue: 0,
            totalAssetValue: 0,
            status: 'FREE',
            alerts: [{ type: 'ERROR', message: 'Λοιπό Περιουσιακό Στοιχείο χωρίς ΑΦΜ' }],
            globalCode: 0,
            bankCode: enc.assetCode,
            sharedWith: [],
            totalGroupOwnership: 0
          });
          return;
        }

        const key = `${afm}-${category}-${roundedValue.toFixed(2)}`; 
        const existing = otherAssetsMap.get(key);

        if (existing) {
          existing.claims.push(enc);
          if (enc.creditor) existing.creditors.add(enc.creditor);
        } else {
          otherAssetsMap.set(key, { 
            afm, 
            category, 
            value, 
            creditors: new Set(enc.creditor ? [enc.creditor] : []),
            claims: [enc] 
          });
        }
      }
    });

    // Process the Other Assets Map
    otherAssetsMap.forEach((group) => {
      const newGlobalCode = Math.max(...singularized.map(s => Number(s.globalCode) || 0), 0) + 1;
      
      const otherAsset: Asset = {
        id: `OTHER-${group.afm}-${group.category}-${group.value}`,
        description: group.category || 'ΛΟΙΠΟ ΠΕΡΙΟΥΣΙΑΚΟ ΣΤΟΙΧΕΙΟ',
        afm: group.afm,
        ownerName: group.afm,
        region: '',
        objectiveValue: group.value, 
        ownershipPercentage: 100,
        atak: '',
        kaek: '',
        type: 'OTHER_ASSET',
        memberType: ''
      };

      // Aggregate all claims into a single representative encumbrance for the group
      const aggregatedEnc = {
        ...group.claims[0], // Take metadata from the first claim
        amount: group.value,
        creditor: Array.from(group.creditors).join(', '),
        isFuzzyMatch: false,
        matchReason: group.claims.length > 1 
          ? `Ομαδοποίηση ${group.claims.length} εγγραφών βάσει ΑΦΜ, Κατηγορίας και Αξίας` 
          : 'Ταυτοποίηση βάσει ΑΦΜ, Κατηγορίας και Αξίας',
        aggregatedCreditors: Array.from(group.creditors).join(', ')
      };

      singularized.push({
        asset: otherAsset,
        originalAssets: [otherAsset],
        encumbrances: [aggregatedEnc],
        collaterals: [],
        liquidationValue: group.value,
        totalAssetValue: group.value,
        status: 'FREE',
        alerts: [{ type: 'INFO', message: 'Λοιπό Περιουσιακό Στοιχείο' }],
        globalCode: newGlobalCode,
        bankCode: group.claims[0].assetCode,
        sharedWith: [],
        totalGroupOwnership: 100,
        matchReason: aggregatedEnc.matchReason
      });
    });

    // Process Financial Assets (List D)
    const financialAssetsMap = new Map<string, { afm: string; category: string; description: string; value: number; claims: any[] }>();
    
    (listD || []).forEach(fin => {
      const afm = String(fin.afm || '').trim();
      const val = fin.value || 0;
      const category = String(fin.assetCategory || '').trim() || 'ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΟ ΠΡΟΪΟΝ';
      const desc = String(fin.description || '').trim();
      
      if (!afm && val === 0) return;
      
      let matchedKey = null;
      for (const [key, existing] of financialAssetsMap.entries()) {
        if (existing.afm === afm && Math.abs(existing.value - val) <= 0.01) {
          matchedKey = key;
          break;
        }
      }
      
      if (matchedKey) {
        const existing = financialAssetsMap.get(matchedKey)!;
        existing.claims.push(fin);
      } else {
        const newKey = `FIN-${afm}-${val}-${Math.random()}`;
        financialAssetsMap.set(newKey, {
          afm,
          category,
          description: desc,
          value: val,
          claims: [fin]
        });
      }
    });

    financialAssetsMap.forEach((group) => {
      const newGlobalCode = Math.max(...singularized.map(s => Number(s.globalCode) || 0), 0) + 1;
      
      const finAsset: Asset = {
        id: `FIN-${group.afm}-${group.value}-${Math.random()}`,
        description: group.description || group.category,
        afm: group.afm,
        ownerName: group.afm,
        region: '',
        objectiveValue: group.value,
        ownershipPercentage: 100,
        atak: '',
        kaek: '',
        type: 'FINANCIAL_ASSET',
        memberType: ''
      };

      const aggregatedEnc = {
        ...group.claims[0],
        amount: group.value,
        creditor: 'ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΟ ΙΔΡΥΜΑ',
        assetCategory: group.category,
        isFuzzyMatch: false,
        matchReason: group.claims.length > 1 
          ? `Ομαδοποίηση ${group.claims.length} λογαριασμών/επενδύσεων βάσει ΑΦΜ και Αξίας (+-0.01€)` 
          : 'Ταυτοποίηση βάσει ΑΦΜ και Αξίας',
        aggregatedCreditors: 'ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΟ ΙΔΡΥΜΑ'
      };

      singularized.push({
        asset: finAsset,
        originalAssets: [finAsset],
        encumbrances: [aggregatedEnc],
        collaterals: [],
        liquidationValue: group.value,
        totalAssetValue: group.value,
        status: 'FREE',
        alerts: [{ type: 'INFO', message: 'Χρηματοοικονομικό Προϊόν' }],
        globalCode: newGlobalCode,
        bankCode: group.claims[0].id,
        sharedWith: [],
        totalGroupOwnership: 100,
        matchReason: aggregatedEnc.matchReason
      });
    });

    // Match Collaterals (List C) to Assets that have the corresponding encumbrance
    (listC || []).forEach(col => {
      singularized.forEach(s => {
        const hasEnc = s.encumbrances.some(e => e.assetCode === col.assetCode);
        if (hasEnc) {
          if (!s.collaterals) s.collaterals = [];
          s.collaterals.push(col);
        }
      });
    });

    return singularized;
  }, [filteredListA, listB, listC, listD, manualMatches]);

  const stats = useMemo(() => {
    const validAssets = (results || []).filter(r => r && r.globalCode !== 0); 
    const uniqueAssetsMap = new Map<string | number, { liquidationValue: number; totalAssetValue: number }>();
    
    validAssets.forEach(r => {
      const code = r.globalCode;
      if (!uniqueAssetsMap.has(code)) {
        uniqueAssetsMap.set(code, { 
          liquidationValue: r.liquidationValue || 0, 
          totalAssetValue: r.totalAssetValue || 0 
        });
      } else {
        const existing = uniqueAssetsMap.get(code)!;
        existing.liquidationValue += (r.liquidationValue || 0);
        existing.totalAssetValue += (r.totalAssetValue || 0);
      }
    });

    const uniqueAssetsList = Array.from(uniqueAssetsMap.values());
    return { 
      totalLiquidation: uniqueAssetsList.reduce((sum, item) => sum + item.liquidationValue, 0), 
      uniqueAssets: uniqueAssetsMap.size 
    };
  }, [results]);

  const groupedByAFM = useMemo(() => {
    const ownerPairs = new Map<string, { afm: string; memberType: string }>();
    
    (filteredListA || []).forEach(a => {
      const afm = String(a.afm || a.ownerName || '').trim();
      const mType = String(a.memberType || '').trim();
      if (!afm) return;

      const existing = ownerPairs.get(afm);
      if (!existing) {
        ownerPairs.set(afm, { afm, memberType: mType });
      } else {
        const priority = (t: string) => {
          if (!t) return 0;
          const ut = String(t).toUpperCase();
          if (ut.includes('ΑΙΤΩΝ') || ut.includes('ΑΙΤΟΥΣΑ')) return 3;
          if (ut.includes('ΣΥΝΟΦΕΙΛΕΤΗΣ')) return 2;
          if (ut.includes('ΣΥΖΥΓΟΣ')) return 1;
          return 0;
        };
        if (priority(mType) > priority(existing.memberType)) {
          ownerPairs.set(afm, { afm, memberType: mType });
        }
      }
    });

    if (activeProject?.afm) {
      const afm = String(activeProject.afm).trim();
      if (afm && !ownerPairs.has(afm)) {
        ownerPairs.set(afm, { afm, memberType: 'ΑΙΤΩΝ' });
      }
    }

    // Include AFMs that might only have special category assets
    (results || []).forEach(r => {
      if (!r || r.globalCode === 0) return;
      const afm = String(r.asset.afm || r.asset.ownerName || '').trim() || 'ΑΓΝΩΣΤΟ_ΑΦΜ';
      if (!ownerPairs.has(afm)) {
        ownerPairs.set(afm, { afm, memberType: 'ΕΝΕΧΟΜΕΝΟΣ' });
      }
    });

    const sortedPairs = Array.from(ownerPairs.values());
    
    const groups = sortedPairs.map(pair => {
      const { afm, memberType } = pair;
      const matchedProperties: any[] = []; 
      const freeProperties: any[] = [];
      const orphanEncumbrances: any[] = [];
      const otherAssets: any[] = [];
      const financialAssets: any[] = [];
      const afmEncumbrances: any[] = []; 
      const afmCollaterals: any[] = [];

      (results || []).forEach(r => {
        if (!r) return;

        const rawAfm = String(r.asset.afm || r.asset.ownerName || '').trim();
        const assetAfm = rawAfm || 'ΑΓΝΩΣΤΟ_ΑΦΜ';
        const isOwner = assetAfm === afm;

        if (r.globalCode === 0) {
          if (isOwner) {
            if (r.asset.type === 'ORPHAN_PROPERTY') {
              orphanEncumbrances.push(r);
            } else if (r.asset.type === 'ORPHAN_OTHER') {
              otherAssets.push(r);
              (r.encumbrances || []).forEach(enc => {
                afmEncumbrances.push({ ...enc, globalCode: r.globalCode, bankCode: r.bankCode });
              });
            }
          }
          return;
        }

        const pairAssets = (r.originalAssets || []).filter(oa => 
          (String(oa.afm || oa.ownerName || '').trim() || 'ΑΓΝΩΣΤΟ_ΑΦΜ') === afm
        );

        if (pairAssets.length > 0) {
          const ownershipPercentage = pairAssets.reduce((sum, oa) => sum + (oa.ownershipPercentage || 0), 0);
          const objectiveValueToShow = pairAssets.reduce((sum, oa) => sum + (oa.objectiveValue || 0), 0);
          
          const assetData = {
            globalCode: r.globalCode,
            bankCode: r.bankCode,
            description: r.asset.description,
            region: r.asset.region,
            ownershipPercentage,
            objectiveValue: Math.round((objectiveValueToShow || 0) * 100) / 100,
            commercialValue: r.totalAssetValue,
            sharedWith: r.sharedWith || [],
            totalGroupOwnership: r.totalGroupOwnership,
            isThirdParty: false,
            alerts: r.alerts || [],
            afm,
            memberType,
            encumbrances: r.encumbrances || []
          };

          if (r.asset.type === 'OTHER_ASSET') {
            otherAssets.push(r);
            (r.encumbrances || []).forEach(enc => {
              afmEncumbrances.push({ ...enc, globalCode: r.globalCode, bankCode: r.bankCode });
            });
          } else if (r.asset.type === 'FINANCIAL_ASSET') {
            financialAssets.push(r);
            (r.encumbrances || []).forEach(enc => {
              afmEncumbrances.push({ ...enc, globalCode: r.globalCode, bankCode: r.bankCode });
            });
          } else {
            if (r.encumbrances && r.encumbrances.length > 0) {
              matchedProperties.push(assetData);
              r.encumbrances.forEach(enc => {
                afmEncumbrances.push({ ...enc, globalCode: r.globalCode, bankCode: r.bankCode });
              });
              (r.collaterals || []).forEach(col => { if(col) afmCollaterals.push(col); });
            } else if (ownershipPercentage > 0) {
              freeProperties.push(assetData);
            }
          }
        }
      });

      const uniqueCols = new Map<string, any>();
      afmCollaterals.forEach(c => { if (!c) return; const key = `${c.assetCode}-${c.creditor}-${c.amount}-${c.order}`; if (!uniqueCols.has(key)) uniqueCols.set(key, c); });
      
      return { 
        afm, 
        memberType, 
        properties: [...matchedProperties, ...freeProperties],
        matchedProperties, 
        freeProperties,
        orphanProperties: orphanEncumbrances,
        otherAssetsGroups: otherAssets,
        financialAssetsGroups: financialAssets,
        encumbrances: afmEncumbrances, 
        collaterals: Array.from(uniqueCols.values()).sort((a, b) => (a.order || 0) - (b.order || 0)) 
      };
    });

    return groups.filter(g => g.matchedProperties.length > 0 || g.freeProperties.length > 0 || g.orphanProperties.length > 0 || g.otherAssetsGroups.length > 0 || g.financialAssetsGroups.length > 0);
  }, [results, filteredListA, activeProject]);

  const discrepancies = useMemo(() => (results || []).filter(r => r && r.globalCode === 0).flatMap(r => r.encumbrances || []), [results]);

  const exportReport = () => {
    if (!results || results.length === 0) return alert(lang === 'EL' ? "Δεν υπάρχουν δεδομένα για εξαγωγή." : "No data to export.");
    const printWindow = window.open('', '_blank'); 
    if (!printWindow) return alert("Παρακαλώ επιτρέψτε τα pop-ups.");
    
    let htmlTables = '';
    (groupedByAFM || []).forEach(group => {
      if (!group) return;
      htmlTables += '<div class="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm" style="page-break-inside: avoid;"><h2 class="text-xl font-bold text-blue-900 border-b border-blue-100 pb-3 mb-4 flex items-center gap-2"><span class="bg-blue-100 text-blue-900 px-3 py-1 rounded-lg text-sm">ΑΦΜ / Ιδιοκτήτης</span> ' + (group.afm || '') + ' ' + (group.memberType ? '- ' + group.memberType.toUpperCase() : '') + '</h2>';
      
      if (group.properties && group.properties.length > 0) {
        htmlTables += '<div style="page-break-inside: avoid;"><h3 class="font-bold text-teal-600 mb-3 uppercase tracking-wider text-sm mt-6">Ιδιοκτησιες</h3><table class="w-full text-left text-sm mb-6 border-collapse"><thead><tr class="border-b-2 border-teal-200 text-blue-900"><th class="py-3 px-4 font-bold w-20">Match ID</th><th class="py-3 px-4 font-bold">Περιγραφη & Διευθυνση</th><th class="py-3 px-4 font-bold text-center">Ποσοστο</th><th class="py-3 px-4 font-bold text-right">Αντικειμενικη Αξια</th><th class="py-3 px-4 font-bold text-right">Εμπορικη Αξια</th></tr></thead><tbody class="divide-y divide-gray-100">';
        group.properties.forEach(p => {
          let statusHtml = '';
          if (p.isThirdParty) {
            statusHtml = p.knownOwnership === 0 ? '<span class="text-rose-600 text-[10px] font-bold px-2 py-1 bg-rose-100 rounded border border-rose-200">100% Ακίνητο Τρίτου / Εγγυητή</span>' : '<span class="text-amber-600 text-[10px] font-bold px-2 py-1 bg-amber-100 rounded border border-amber-200">Υπόλοιπο από: 100% - ' + p.knownOwnership + '%</span>';
          } else if (p.sharedWith && p.sharedWith.length > 0) {
            statusHtml = '<div class="flex flex-col gap-1"><span class="text-indigo-600 text-[10px] font-bold px-2 py-1 bg-indigo-100 rounded border border-indigo-200">ΚΟΙΝΟ ΜΕ ΑΦΜ: ' + p.sharedWith.join(', ') + '</span>';
            if (p.totalGroupOwnership && p.totalGroupOwnership < 99.9) {
              statusHtml += '<span class="text-rose-600 text-[10px] font-bold px-2 py-1 bg-rose-100 rounded border border-rose-200 mt-1">Συνιδιοκτησία με ΤΡΙΤΟ</span>';
            }
            statusHtml += '</div>';
          } else if (p.ownershipPercentage < 100) {
            statusHtml = '<span class="text-rose-600 text-[10px] font-bold px-2 py-1 bg-rose-100 rounded border border-rose-200">Συνιδιοκτησία με ΤΡΙΤΟ</span>';
          } else {
            statusHtml = '<span class="text-teal-600 text-[10px] font-bold px-2 py-1 bg-teal-100 rounded border border-teal-200">Αποκλειστική Κυριότητα</span>';
          }
          
          let alertsHtml = '';
          if (p.alerts && p.alerts.length > 0) {
            alertsHtml = '<div class="mt-2 space-y-1">';
            p.alerts.forEach((a: any) => {
              const alertClass = a.type === 'ERROR' ? 'bg-rose-50 text-rose-700 border border-rose-200' : a.type === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200';
              alertsHtml += '<div class="text-[10px] font-bold px-2 py-1 rounded ' + alertClass + '">' + (a.message || '') + '</div>';
            });
            alertsHtml += '</div>';
          }

          htmlTables += '<tr><td class="py-3 px-4"><span class="inline-flex w-7 h-7 rounded-xl bg-[#0a1d37] text-white items-center justify-center font-bold text-xs shadow-sm">' + (p.globalCode === 0 ? '-' : p.globalCode) + '</span><br/><span class="text-[10px] text-gray-500 mt-1 block">(Κωδ. Τράπεζας: ' + (p.bankCode || '-') + ')</span></td><td class="py-3 px-4 font-medium text-blue-950">' + (p.description || '') + ' ' + (p.region ? '<span class="text-gray-500 text-xs block">' + p.region + '</span>' : '') + ' <div class="mt-2">' + statusHtml + '</div> ' + alertsHtml + '</td><td class="py-3 px-4 text-center font-bold text-gray-600">' + (p.ownershipPercentage || 0) + '%</td><td class="py-3 px-4 text-right font-bold text-teal-600">€' + Number(p.objectiveValue || 0).toLocaleString() + '</td><td class="py-3 px-4 text-right font-bold text-blue-700">€' + (p.commercialValue ? Number(p.commercialValue).toLocaleString() : '-') + '</td></tr>';
          
          const propEncumbrances = (group.encumbrances || []).filter(e => e.globalCode === p.globalCode);
          if (propEncumbrances.length > 0) {
            htmlTables += '<tr><td colspan="5" class="p-0"><div class="bg-slate-50 border-l-4 border-blue-400 p-4 pl-12 shadow-inner"><h4 class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">Βαρη Ακινητου</h4><div class="space-y-3">';
            propEncumbrances.forEach(e => {
              const rawCollaterals = (listC || []).filter(c => c && c.assetCode === e.assetCode);
              const uniqueCollaterals = new Map<string, Collateral>();
              rawCollaterals.forEach(c => {
                const key = c.creditor + '-' + c.amount + '-' + c.order;
                if (!uniqueCollaterals.has(key)) uniqueCollaterals.set(key, c);
              });
              const encCollaterals = Array.from(uniqueCollaterals.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
              
              const thirdPartyTag = e.isThirdParty ? '<span class="text-amber-600 text-[10px] font-bold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">ΤΡΙΤΟΥ</span>' : '';
              const fuzzyTag = e.isFuzzyMatch ? '<span class="text-amber-500 font-bold ml-1" title="' + (e.matchReason || '') + '">⚠️</span>' : '';
              const ownerTag = e.ownerName && e.ownerName !== 'ΑΓΝΩΣΤΟ_ΑΦΜ' ? '<span class="text-blue-700 text-[10px] font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">ΑΦΜ Οφειλέτη: ' + e.ownerName + '</span>' : '';
              
              let encAlertsHtml = '';
              if (e.alerts && e.alerts.length > 0) {
                encAlertsHtml = '<div class="mt-2 space-y-1">';
                e.alerts.forEach((a: any) => {
                  const alertClass = a.type === 'ERROR' ? 'bg-rose-50 text-rose-700 border border-rose-200' : a.type === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200';
                  encAlertsHtml += '<div class="text-[10px] font-bold px-2 py-1 rounded ' + alertClass + '">' + (a.message || '') + '</div>';
                });
                encAlertsHtml += '</div>';
              }
              
              const typeHtml = e.type && e.type !== 'N/A' && e.type !== 'ΜΗ ΔΙΑΘΕΣΙΜΟ' ? '<div class="mt-2 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100"><span class="font-bold text-slate-700">Βάρη:</span> ' + e.type + '</div>' : '';

              htmlTables += '<div class="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden"><div class="p-4 flex justify-between gap-4"><div class="flex-1"><div class="font-bold text-slate-800 mb-1">' + (e.address || e.assetCategory || 'ΧΩΡΙΣ ΔΙΕΥΘΥΝΣΗ') + ' ' + fuzzyTag + '</div><div class="flex flex-wrap items-center gap-2"><span class="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">' + (e.creditor || '') + '</span> ' + ownerTag + ' ' + thirdPartyTag + '</div>' + typeHtml + encAlertsHtml + '</div><div class="text-right"><div class="text-lg font-black text-blue-900">€' + Number(e.amount || 0).toLocaleString() + '</div><div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">ΑΠΑΙΤΗΣΗ</div></div></div>';
              
              if (encCollaterals.length > 0) {
                htmlTables += '<div class="bg-slate-50 border-t border-slate-100 p-3 px-4"><h5 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Σειρα Προσημειωσεων</h5><div class="space-y-1.5">';
                encCollaterals.forEach(c => {
                  htmlTables += '<div class="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-xs"><div class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px]">' + (c.order || 0) + '</span><span class="font-bold text-slate-700">' + (c.creditor || '') + '</span></div><span class="font-bold text-slate-600">€' + Number(c.amount || 0).toLocaleString() + '</span></div>';
                });
                htmlTables += '</div></div>';
              }
              htmlTables += '</div>';
            });
            htmlTables += '</div></div></td></tr>';
          }
        });
        htmlTables += '</tbody></table></div>';
      }

      if (group.otherAssetsGroups && group.otherAssetsGroups.length > 0) {
        htmlTables += '<div style="page-break-inside: avoid;"><h3 class="font-bold text-teal-600 mb-3 uppercase tracking-wider text-sm mt-6">Λοιπα Στοιχεια (Κινητα, Καταθεσεις κ.λπ.)</h3><table class="w-full text-left text-sm mb-6 border-collapse"><thead><tr class="border-b-2 border-teal-200 text-blue-900"><th class="py-3 px-4 font-bold w-20">Match ID</th><th class="py-3 px-4 font-bold">Περιγραφη / Κατηγορια</th><th class="py-3 px-4 font-bold">Περιγραφη Βαρους</th><th class="py-3 px-4 font-bold">Πιστωτης / Διαχειριστης</th><th class="py-3 px-4 font-bold text-right">Αξια / Ποσο</th></tr></thead><tbody class="divide-y divide-gray-100">';
        group.otherAssetsGroups.forEach(asset => {
          const assetEncumbrances = (group.encumbrances || []).filter(e => e.globalCode === asset.globalCode);
          assetEncumbrances.forEach((enc, eIdx) => {
            htmlTables += '<tr>';
            if (eIdx === 0) {
              htmlTables += '<td class="py-4 px-4 font-bold" rowspan="' + assetEncumbrances.length + '"><span style="display: inline-flex; width: 32px; height: 32px; background: #0a1d37; color: white; border-radius: 8px; align-items: center; justify-content: center; font-size: 12px;">' + asset.globalCode + '</span></td>';
              htmlTables += '<td class="py-4 px-4 font-medium" rowspan="' + assetEncumbrances.length + '">' + (asset.asset?.description || asset.description || '') + '</td>';
            }
            htmlTables += '<td class="py-4 px-4 text-slate-600">' + (enc.assetCategory || '-') + '</td>';
            htmlTables += '<td class="py-4 px-4 text-slate-600">' + (enc.aggregatedCreditors || enc.creditor || '') + '</td>';
            htmlTables += '<td class="py-4 px-4 font-bold text-right">€' + Number(enc.amount || 0).toLocaleString() + '</td>';
            htmlTables += '</tr>';
          });
        });
        htmlTables += '</tbody></table></div>';
      }

      if (group.financialAssetsGroups && group.financialAssetsGroups.length > 0) {
        htmlTables += '<div style="page-break-inside: avoid;"><h3 class="font-bold text-indigo-600 mb-3 uppercase tracking-wider text-sm mt-6">Χρηματοοικονομικα Προιοντα</h3><table class="w-full text-left text-sm mb-6 border-collapse"><thead><tr class="border-b-2 border-indigo-200 text-blue-900"><th class="py-3 px-4 font-bold w-20">Match ID</th><th class="py-3 px-4 font-bold">Περιγραφη / Κατηγορια</th><th class="py-3 px-4 font-bold">Περιγραφη Βαρους</th><th class="py-3 px-4 font-bold">Πιστωτης / Διαχειριστης</th><th class="py-3 px-4 font-bold text-right">Αξια / Ποσο</th></tr></thead><tbody class="divide-y divide-gray-100">';
        group.financialAssetsGroups.forEach(asset => {
          const assetEncumbrances = (group.encumbrances || []).filter(e => e.globalCode === asset.globalCode);
          assetEncumbrances.forEach((enc, eIdx) => {
            htmlTables += '<tr>';
            if (eIdx === 0) {
              htmlTables += '<td class="py-4 px-4 font-bold" rowspan="' + assetEncumbrances.length + '"><span style="display: inline-flex; width: 32px; height: 32px; background: #0a1d37; color: white; border-radius: 8px; align-items: center; justify-content: center; font-size: 12px;">' + asset.globalCode + '</span></td>';
              htmlTables += '<td class="py-4 px-4 font-medium" rowspan="' + assetEncumbrances.length + '">' + (asset.asset?.description || asset.description || '') + '</td>';
            }
            htmlTables += '<td class="py-4 px-4 text-slate-600">' + (enc.assetCategory || '-') + '</td>';
            htmlTables += '<td class="py-4 px-4 text-slate-600">' + (enc.aggregatedCreditors || enc.creditor || '') + '</td>';
            htmlTables += '<td class="py-4 px-4 font-bold text-right">€' + Number(enc.amount || 0).toLocaleString() + '</td>';
            htmlTables += '</tr>';
          });
        });
        htmlTables += '</tbody></table></div>';
      }

      htmlTables += '</div>';
    });

    if (discrepancies && discrepancies.length > 0) {
      htmlTables += '<div class="mb-8 p-6 bg-white border border-rose-200 rounded-xl shadow-sm" style="page-break-inside: avoid;"><h2 class="text-xl font-bold text-rose-800 border-b border-rose-100 pb-3 mb-4 flex items-center gap-2"><span class="bg-rose-100 text-rose-800 px-3 py-1 rounded-lg text-sm">ΟΡΦΑΝΑ - ΒΑΡΗ</span> Βάρη που δεν ταυτίστηκαν με ακίνητα</h2><table class="w-full text-left text-sm mb-2 border-collapse"><thead><tr class="border-b-2 border-rose-200 text-rose-900"><th class="py-3 px-4 font-bold">Διεύθυνση / Κατηγορία</th><th class="py-3 px-4 font-bold">Επωνυμία Πιστωτή / Διαχειριστή</th><th class="py-3 px-4 font-bold">ΑΦΜ Οφειλέτη</th><th class="py-3 px-4 font-bold">Αιτιολογία</th><th class="py-3 px-4 font-bold text-right">Ποσό</th></tr></thead><tbody class="divide-y divide-gray-100">';
      discrepancies.forEach(e => {
        const rawCollaterals = (listC || []).filter(c => c && c.assetCode === e.assetCode);
        const uniqueCollaterals = new Map<string, Collateral>();
        rawCollaterals.forEach(c => {
          const key = c.creditor + '-' + c.amount + '-' + c.order;
          if (!uniqueCollaterals.has(key)) uniqueCollaterals.set(key, c);
        });
        const encCollaterals = Array.from(uniqueCollaterals.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const ownerTag = e.ownerName && e.ownerName !== 'ΑΓΝΩΣΤΟ_ΑΦΜ' ? '<span class="text-blue-700 text-[10px] font-bold block mt-1">ΑΦΜ Οφειλέτη: ' + e.ownerName + '</span>' : '';
        
        let encAlertsHtml = '';
        if (e.alerts && e.alerts.length > 0) {
          encAlertsHtml = '<div class="mt-2 space-y-1">';
          e.alerts.forEach((a: any) => {
            const alertClass = a.type === 'ERROR' ? 'bg-rose-50 text-rose-700 border border-rose-200' : a.type === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200';
            encAlertsHtml += '<div class="text-[10px] font-bold px-2 py-1 rounded ' + alertClass + '">' + (a.message || '') + '</div>';
          });
          encAlertsHtml += '</div>';
        }

        const typeHtml = e.type && e.type !== 'N/A' && e.type !== 'ΜΗ ΔΙΑΘΕΣΙΜΟ' ? '<div class="mt-1 text-[10px] text-slate-500"><span class="font-bold text-slate-600">Βάρη:</span> ' + e.type + '</div>' : '';

        htmlTables += '<tr><td class="py-3 px-4 font-medium text-blue-950">' + (e.address || (e as any).assetCategory || 'ΧΩΡΙΣ ΔΙΕΥΘΥΝΣΗ') + ' ' + typeHtml + ' ' + ownerTag + ' ' + encAlertsHtml + '</td><td class="py-3 px-4 text-gray-500 text-xs">' + (e.creditor || '') + '</td><td class="py-3 px-4 text-gray-500 font-mono text-xs">' + (e.ownerName || '-') + '</td><td class="py-3 px-4 text-gray-500 text-xs">' + (e.matchReason || 'Δεν βρέθηκε ταύτιση') + '</td><td class="py-3 px-4 text-right font-bold text-rose-700">€' + Number(e.amount || 0).toLocaleString() + '</td></tr>';
        
        if (encCollaterals.length > 0) {
          htmlTables += '<tr><td colspan="5" class="py-2 px-4 bg-slate-50"><div class="pl-4"><h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Σειρα Προσημειωσεων</h4><div class="space-y-1">';
          encCollaterals.forEach(c => {
            htmlTables += '<div class="flex items-center justify-between text-xs"><div class="flex items-center gap-2"><span class="inline-flex w-4 h-4 rounded-full bg-slate-200 text-slate-700 items-center justify-center font-bold" style="font-size: 8px;">' + (c.order || 0) + '</span><span class="font-medium text-slate-700">' + (c.creditor || '') + '</span><span class="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">' + (c.type || '') + '</span></div><span class="font-bold text-slate-700">€' + Number(c.amount || 0).toLocaleString() + '</span></div>';
          });
          htmlTables += '</div></div></td></tr>';
        }
      });
      htmlTables += '</tbody></table></div>';
    }

    let reasoningHtml = '';
    let hasMatchedProperties = false;

    (groupedByAFM || []).forEach(group => {
      if (!group) return;
      
      // Properties reasoning
      if (group.properties) {
        group.properties.forEach((p: any) => {
          const propEncumbrances = (group.encumbrances || []).filter((e: any) => e.globalCode === p.globalCode);
          if (propEncumbrances.length > 0 && p.globalCode > 0) {
            const resultMatch = (results || []).find(r => r.globalCode === p.globalCode);
            const reason = resultMatch?.matchReason || 'Βρίσκεται στην ίδια δ/νση ή έχει την ίδια αξία και ποσοστό.';
            if (!hasMatchedProperties) {
              reasoningHtml += '<div class="mt-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm" style="page-break-inside: avoid;"><h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Σκεπτικό Μοναδικοποίησης</h2><ul class="space-y-3 text-sm text-slate-700">';
              hasMatchedProperties = true;
            }
            reasoningHtml += '<li class="p-3 bg-slate-50 rounded-lg border border-slate-100"><b>Ακίνητο με Match ID ' + p.globalCode + '</b> έγινε μοναδικοποίηση με το ακίνητο στην οδό <i>"' + (p.asset?.description || p.description || '-') + '"</i>, αξίας <b>€' + Number(p.asset?.objectiveValue || p.objectiveValue || 0).toLocaleString() + '</b> διότι: ' + reason + '</li>';
          }
        });
      }

      // Other assets reasoning
      if (group.otherAssetsGroups) {
        group.otherAssetsGroups.forEach((o: any) => {
          const resultMatch = (results || []).find(r => r.globalCode === o.globalCode);
          if (resultMatch && resultMatch.matchReason && resultMatch.matchReason.includes('Ομαδοποίηση')) {
            if (!hasMatchedProperties) {
              reasoningHtml += '<div class="mt-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm" style="page-break-inside: avoid;"><h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Σκεπτικό Μοναδικοποίησης</h2><ul class="space-y-3 text-sm text-slate-700">';
              hasMatchedProperties = true;
            }
            reasoningHtml += '<li class="p-3 bg-slate-50 rounded-lg border border-slate-100"><b>Λοιπό Στοιχείο με Match ID ' + o.globalCode + '</b> έγινε μοναδικοποίηση (<i>"' + (o.asset?.description || o.description || '-') + '"</i>), συνολικής αξίας <b>€' + Number(o.asset?.objectiveValue || o.objectiveValue || 0).toLocaleString() + '</b> διότι: ' + resultMatch.matchReason + '</li>';
          }
        });
      }

      // Financial assets reasoning
      if (group.financialAssetsGroups) {
        group.financialAssetsGroups.forEach((f: any) => {
          const resultMatch = (results || []).find(r => r.globalCode === f.globalCode);
          if (resultMatch && resultMatch.matchReason && resultMatch.matchReason.includes('Ομαδοποίηση')) {
            if (!hasMatchedProperties) {
              reasoningHtml += '<div class="mt-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm" style="page-break-inside: avoid;"><h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Σκεπτικό Μοναδικοποίησης</h2><ul class="space-y-3 text-sm text-slate-700">';
              hasMatchedProperties = true;
            }
            reasoningHtml += '<li class="p-3 bg-slate-50 rounded-lg border border-slate-100"><b>Χρηματοοικονομικό Προϊόν με Match ID ' + f.globalCode + '</b> έγινε μοναδικοποίηση (<i>"' + (f.asset?.description || f.description || '-') + '"</i>), συνολικής αξίας <b>€' + Number(f.asset?.objectiveValue || f.objectiveValue || 0).toLocaleString() + '</b> διότι: ' + resultMatch.matchReason + '</li>';
          }
        });
      }
    });

    if (hasMatchedProperties) {
      reasoningHtml += '</ul></div>';
    }

    let appendixHtml = '<div class="mt-12 p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm" style="page-break-inside: avoid;"><h2 class="text-xl font-extrabold text-slate-800 border-b border-slate-200 pb-4 mb-6 flex items-center gap-2"><svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Επεξηγηματικό Υπόμνημα Ταυτοποίησης (Methodology & Audit Trail)</h2><p class="text-sm text-slate-500 mb-6">Η παρούσα αναφορά παρήχθη μέσω του αλγορίθμου τεχνητής νοημοσύνης ExoMatch PRO.</p><ul class="space-y-4 text-sm text-slate-700"><li class="flex gap-3"><span class="text-teal-500 font-bold mt-0.5">✓</span> <div><b class="text-slate-900">Κοινή Διεύθυνση & Αξία:</b> Επιτυχής.</div></li><li class="flex gap-3"><span class="text-amber-500 font-bold mt-0.5">⚠️</span> <div><b class="text-slate-900">Εγγυητές & Τρίτα Πρόσωπα:</b> Υπολογίστηκαν αυτόματα.</div></li>';

    if (discrepancies && discrepancies.length > 0) {
      appendixHtml += '<li class="flex gap-3"><span class="text-rose-500 font-bold mt-0.5">🛑</span> <div><b class="text-slate-900">Ορφανά Βάρη (' + discrepancies.length + '):</b> Εντοπίστηκαν βάρη που αδυνατούν να ταυτιστούν με το Ε9.</div></li>';
    }

    if (spouseAlerts && spouseAlerts.length > 0) {
      appendixHtml += '<li class="flex gap-3"><span class="text-blue-500 font-bold mt-0.5">ℹ️</span> <div><b class="text-slate-900">Εξαίρεση Μελών:</b> ' + spouseAlerts.join(' ') + '</div></li>';
    }

    appendixHtml += '</ul></div>';

    const safeTotalLiq = stats && stats.totalLiquidation ? Number(stats.totalLiquidation).toLocaleString() : '0';
    const safeFullName = activeProject && activeProject.fullName ? activeProject.fullName : '';
    const safeAfm = activeProject && activeProject.afm ? activeProject.afm : '-';
    const safeOcw = activeProject && activeProject.ocwNumber ? activeProject.ocwNumber : '-';
    const safeDate = new Date().toLocaleString('el-GR');

    const htmlContent = `<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <title>Εμπιστευτική Αναφορά - ExoMatch PRO</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #f8fafc !important; margin: 0; padding: 0; }
            .cover-page { height: 95vh; page-break-after: always; display: flex; flex-direction: column; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            h2, h3 { page-break-after: avoid; break-after: avoid; }
            table { page-break-before: auto; }
        }
    </style>
</head>
<body class="font-sans bg-slate-50 text-blue-950">
    <div class="cover-page">
        <div class="bg-[#0a1d37] w-full py-8 flex justify-center items-center">
            <div style="max-height: 80px;">${LOGO_SVG_STRING_LIGHT}</div>
        </div>
        <div class="flex-1 flex flex-col justify-center items-center p-8 max-w-4xl mx-auto text-center relative w-full">
            <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div style="width: 80%;">${LOGO_SVG_STRING}</div>
            </div>
            <h1 class="text-4xl font-extrabold text-blue-900 tracking-tight mb-4 mt-4">Αναφορά Μοναδικοποίησης Περιουσίας</h1>
        <p class="text-xl text-teal-600 font-medium mb-10">Εξωδικαστικός Μηχανισμός Ρύθμισης Οφειλών</p>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 w-full max-w-2xl mx-auto mb-10 text-left relative z-10">
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Ονοματεπωνυμο Οφειλετη</p>
                    <p class="text-xl font-bold text-blue-950">${safeFullName}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">ΑΦΜ Οφειλετη</p>
                    <p class="text-xl font-mono text-blue-900">${safeAfm}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Αρ. Αιτησης</p>
                    <p class="text-base font-mono text-blue-900">${safeOcw}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Συνολικη Αξια Ρευστοποιησης</p>
                    <p class="text-2xl font-bold text-teal-600">€${safeTotalLiq}</p>
                </div>
            </div>
        </div>

        <div class="mt-auto pt-6 border-t border-gray-200 w-full">
            <div class="inline-flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-lg text-sm font-bold border border-rose-200 mb-4">
                ΑΚΡΩΣ ΕΜΠΙΣΤΕΥΤΙΚΟ ΕΓΓΡΑΦΟ (GDPR)
            </div>
            <p class="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
                Το παρόν έγγραφο περιέχει αυστηρά προσωπικά και οικονομικά δεδομένα. Απαγορεύεται η κοινοποίηση σε τρίτους.
            </p>
            <p class="text-xs font-bold text-gray-400 mt-4">Ημερομηνία: ${safeDate}</p>
        </div>
        </div>
    </div>

    <div class="p-8 max-w-5xl mx-auto">
        ${htmlTables}
        ${reasoningHtml}
        ${appendixHtml}
    </div>

    <script>
        setTimeout(() => { window.print(); }, 1000);
    </script>
</body>
</html>`;
    
    printWindow.document.open(); 
    printWindow.document.write(htmlContent); 
    printWindow.document.close();
  };

  if (appMode === 'APP' && authStatus === 'INITIALIZING') { 
    return (
      <div className="min-h-screen bg-[#050b18] flex flex-col items-center justify-center relative">
        <BackgroundWatermark />
        <Loader2 className="w-8 h-8 text-blue-900 animate-spin relative z-10" />
      </div>
    ); 
  }

  // Comparison Section Icons
  const ComparisonIcon = ({ type }: { type: 'manual' | 'exomatch' }) => (
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${type === 'manual' ? 'bg-rose-500/10 text-rose-500' : 'bg-teal/10 text-teal'}`}>
      {type === 'manual' ? <AlertCircle className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
    </div>
  );

  return (
    <>
      {showIntro && <MotionIntro onComplete={() => setShowIntro(false)} />}
      {/* 1. MODALS ΝΟΜΙΚΩΝ ΚΕΙΜΕΝΩΝ */}
      {legalModal !== 'NONE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setLegalModal('NONE')} />
           <div className="glass-card-light rounded-[2.5rem] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] glow-teal">
              <div className="flex justify-between items-center p-8 border-b border-slate-200 bg-slate-50">
                 <h3 className="font-sans font-bold text-2xl text-slate-900 flex items-center gap-3">
                    <ShieldCheck className="text-teal w-8 h-8"/>
                    {legalModal === 'TOS' && "Όροι Χρήσης"}
                    {legalModal === 'PRIVACY' && "Πολιτική Απορρήτου"}
                    {legalModal === 'DPA' && "Σύμβαση Επεξεργασίας"}
                 </h3>
                 <button onClick={() => setLegalModal('NONE')} className="text-slate-400 hover:text-slate-900 p-2 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 md:p-10 overflow-y-auto flex-1 text-slate-600 space-y-6 text-sm leading-relaxed font-medium">
                 {legalModal === 'TOS' && (
                   <>
                     <p>Η πλατφόρμα <strong className="text-slate-900">ExoMatch PRO</strong> παρέχεται ως εργαλείο λογισμικού (SaaS) για την υποβοήθηση επαγγελματιών στη διαδικασία του Εξωδικαστικού Μηχανισμού.</p>
                     <p>Η εφαρμογή λειτουργεί αποκλειστικά ως <span className="text-teal font-bold uppercase tracking-widest text-[10px]">Local Processing</span> εργαλείο στον περιηγητή σας. Ο χρήστης παραμένει ο αποκλειστικός <strong className="text-slate-900">'Υπεύθυνος Επεξεργασίας' (Data Controller)</strong>.</p>
                     <p>Το ExoMatch PRO δεν φέρει καμία ευθύνη για την ορθότητα των αποτελεσμάτων, τα οποία ο επαγγελματίας οφείλει να ελέγχει πριν την υποβολή.</p>
                   </>
                 )}
                 {legalModal === 'PRIVACY' && (
                   <>
                     <p>Στο ExoMatch PRO σεβόμαστε απόλυτα την ιδιωτικότητα. Συλλέγουμε μόνο τα απαραίτητα στοιχεία για τη λειτουργία του λογαριασμού σας (Email και Κρυπτογραφημένο Password).</p>
                     <p>Οι πληρωμές διεκπεραιώνονται μέσω <strong className="text-slate-900">Stripe</strong>. Δεν αποθηκεύουμε στοιχεία καρτών.</p>
                     <div className="p-6 rounded-2xl bg-teal/5 border border-teal/20 text-teal">
                        <p className="font-bold uppercase tracking-widest text-[10px] mb-2">Σημαντικη Ενημερωση:</p>
                        Τα αρχεία και τα δεδομένα οφειλετών επεξεργάζονται <strong className="text-slate-900">τοπικά</strong>. Το ExoMatch PRO <strong className="text-slate-900">ΔΕΝ</strong> αποθηκεύει και <strong className="text-slate-900">ΔΕΝ</strong> έχει πρόσβαση σε κανένα αρχείο πελάτη σας.
                     </div>
                   </>
                 )}
                 {legalModal === 'DPA' && (
                   <>
                     <p>Με τη χρήση της εφαρμογής, συνάπτεται αυτόματα η παρούσα <strong className="text-slate-900">Σύμβαση Επεξεργασίας Δεδομένων</strong>.</p>
                     <p>Το ExoMatch PRO ενεργεί ως <strong className="text-slate-900">'Εκτελών την Επεξεργασία' (Data Processor)</strong>.</p>
                     <ul className="space-y-3 mt-4">
                        <li className="flex gap-3 items-start"><span className="text-teal font-bold">✓</span> Δεν διατηρούμε αντίγραφα ασφαλείας των αρχείων σας.</li>
                        <li className="flex gap-3 items-start"><span className="text-teal font-bold">✓</span> Τα δεδομένα ζουν προσωρινά στη μνήμη του Browser (localStorage).</li>
                        <li className="flex gap-3 items-start"><span className="text-teal font-bold">✓</span> Με τον 'Καθαρισμό Δεδομένων', τα πάντα διαγράφονται οριστικά.</li>
                     </ul>
                   </>
                 )}
              </div>
              <div className="p-8 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button onClick={() => setLegalModal('NONE')} className="px-8 py-3 text-sm font-black uppercase tracking-widest text-white bg-teal hover:bg-teal/90 rounded-2xl shadow-lg shadow-teal/20 transition-all">Κλεισιμο</button>
              </div>
           </div>
        </div>
      )}

      {/* 2. LANDING PAGE */}
      {appMode === 'LANDING' && (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-teal selection:text-white scroll-smooth">
          <nav className="fixed top-0 w-full bg-[#050b18] border-b border-white/10 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
              <ExoMatchLogo className="h-20" theme="dark" />
              <div className="hidden md:flex items-center gap-8 font-black text-[10px] uppercase tracking-[0.2em] text-white">
                <a href="#how-it-works" className="hover:text-teal transition-colors">Πως Λειτουργει</a>
                <a href="#pricing" className="hover:text-teal transition-colors">Τιμοκαταλογος</a>
                <a href="#security" className="hover:text-teal transition-colors">Ασφαλεια</a>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setAppMode('APP')} className="text-xs font-black uppercase tracking-[0.15em] text-white hover:text-teal transition-colors hidden sm:block">Εισοδος</button>
                <button onClick={() => setAppMode('APP')} className="bg-teal hover:bg-teal/80 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-teal/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">Ξεκινηστε τωρα <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </nav>

          <section className="pt-48 pb-20 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal/5 blur-[120px] rounded-full pointer-events-none"></div>
            <BackgroundWatermark />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col items-center text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl">
                  <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider mb-6 border border-teal/20 glow-teal"><Scale className="w-4 h-4"/> Για Δικηγορους, Λογιστες & Συμβουλους</span>
                  <h1 className="text-5xl md:text-8xl font-sans font-black text-slate-900 tracking-tight leading-[1] mb-8">
                    Εξωδικαστικός Μηχανισμός:<br/>Μοναδικοποίηση Περιουσίας <br/>
                    <span className="text-teal text-glow-teal">σε δευτερόλεπτα.</span>
                  </h1>
                  <p className="text-lg md:text-2xl text-slate-800 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
                    Το απόλυτο και πλέον εξειδικευμένο λογισμικό για την μοναδικοποίηση ακινήτων και βαρών. Ανεβάστε τα αρχεία Excel ακίνητης περιουσίας και τα Excel βαρών των Funds/Τραπεζών. Ο έξυπνος αλγόριθμος αναλαμβάνει την ταύτιση, την κωδικοποίηση και τον υπολογισμό αξιών ρευστοποίησης.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => setAppMode('APP')} className="w-full sm:w-auto bg-[#0a1d37] hover:bg-[#0a1d37]/90 text-white px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-900/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">ΔΗΜΙΟΥΡΓΙΑ ΛΟΓΑΡΙΑΣΜΟΥ</button>
                    <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-[#0a1d37] hover:bg-[#0a1d37]/90 text-white px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest transition-all shadow-xl transform hover:-translate-y-1">ΠΩΣ ΛΕΙΤΟΥΡΓΕΙ</button>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="py-24 relative z-10 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-sans font-bold text-slate-900 mb-4">Το απαραίτητο εργαλείο για κάθε επαγγελματία</h2>
                <p className="text-slate-600 font-medium max-w-2xl mx-auto text-lg">Σχεδιασμένο να καλύπτει τις αυξημένες απαιτήσεις του Εξωδικαστικού Μηχανισμού, προσφέροντας ταχύτητα και οργάνωση.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Bento Grid Item 1 */}
                <motion.div whileHover={{ y: -5 }} className="glass-card-light rounded-[2.5rem] p-8 group transition-all flex flex-col md:col-span-2">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/2 h-64 overflow-hidden rounded-3xl bg-slate-100 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent z-10 pointer-events-none"></div>
                      <img src={dikigorosImg} alt="Δικηγόρος" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-teal/20 flex items-center justify-center text-teal mb-6"><Scale className="w-6 h-6"/></div>
                      <h3 className="text-3xl font-sans font-bold text-slate-900 mb-4">Δικηγόροι</h3>
                      <p className="text-slate-600 text-lg leading-relaxed">Οργανώστε τις υποθέσεις σας και προστατέψτε την περιουσία των εντολέων σας, γλιτώνοντάς ταυτόχρονα πολύτιμο χρόνο.</p>
                    </div>
                  </div>
                </motion.div>

                {/* Bento Grid Item 2 */}
                <motion.div whileHover={{ y: -5 }} className="glass-card-light rounded-[2.5rem] p-8 group transition-all flex flex-col">
                  <div className="w-full h-48 mb-6 overflow-hidden rounded-3xl bg-slate-100 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent z-10 pointer-events-none"></div>
                    <img src={logistisImg} alt="Λογιστής" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  </div>
                  <h3 className="text-2xl font-sans font-bold text-slate-900 mb-3">Λογιστές & Φοροτεχνικοί</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Τέλος στα ατελείωτα, χειροκίνητα Excel. Ταυτίστε τα στοιχεία του Ε9 με τα βάρη των Funds αυτόματα και χωρίς απολύτως κανένα περιθώριο λάθους.</p>
                </motion.div>

                {/* Bento Grid Item 3 */}
                <motion.div whileHover={{ y: -5 }} className="glass-card-light rounded-[2.5rem] p-8 group transition-all flex flex-col md:col-span-3">
                  <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                    <div className="w-full md:w-1/3 h-64 overflow-hidden rounded-3xl bg-slate-100 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent z-10 pointer-events-none"></div>
                      <img src={symvoulosImg} alt="Σύμβουλος" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-600 mb-6"><Landmark className="w-6 h-6"/></div>
                      <h3 className="text-3xl font-sans font-bold text-slate-900 mb-4">Σύμβουλοι Ρύθμισης</h3>
                      <p className="text-slate-600 text-lg leading-relaxed">Αναλύστε την ικανότητα αποπληρωμής και υπολογίστε την αξία ρευστοποίησης άμεσα, προσφέροντας κορυφαίες και γρήγορες συμβουλευτικές υπηρεσίες.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Comparison Section */}
          <section className="py-24 relative z-10 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-sans font-bold text-slate-900 mb-4">Γιατί να επιλέξετε το ExoMatch PRO;</h2>
                <p className="text-slate-600 font-medium text-lg max-w-2xl mx-auto">Συγκρίνετε την παραδοσιακή μέθοδο με την αυτοματοποιημένη λύση μας και δείτε τη διαφορά στην παραγωγικότητά σας.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Manual Method */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  <ComparisonIcon type="manual" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Χειροκίνητη Επεξεργασία</h3>
                  <ul className="space-y-5">
                    {[
                      "Υψηλός κίνδυνος ανθρώπινου λάθους στην ταύτιση.",
                      "Δυσκολία στον υπολογισμό αξιών ρευστοποίησης.",
                      "Χρονοβόρα δημιουργία αναφορών και πινάκων.",
                      "Άγχος για την ακρίβεια των στοιχείων προς τους πιστωτές."
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600">
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* ExoMatch PRO */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-[#0a1d37] rounded-[2.5rem] p-10 border border-teal/30 shadow-2xl relative overflow-hidden group glow-teal"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  <ComparisonIcon type="exomatch" />
                  <h3 className="text-2xl font-bold text-white mb-6">ExoMatch PRO</h3>
                  <ul className="space-y-5">
                    {[
                      "Αυτόματη ταύτιση σε λιγότερο από 1 λεπτό.",
                      "Μηδενικό περιθώριο λάθους με έξυπνο αλγόριθμο.",
                      "Άμεσος υπολογισμός αξιών με ένα κλικ.",
                      "Επαγγελματικά PDF έτοιμα για υποβολή.",
                      "Πλήρης ασφάλεια δεδομένων (Privacy by Design)."
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                </motion.div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="py-24 relative z-10 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-sans font-bold text-slate-900 mb-4">ΠΩΣ ΛΕΙΤΟΥΡΓΕΙ Η ΕΦΑΡΜΟΓΗ;</h2>
                <p className="text-slate-600 font-medium text-lg">4 απλά βήματα για να ολοκληρώσετε τη δουλειά μιας ώρας σε 1 λεπτό.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
                <div className="order-2 md:order-1 space-y-10">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-[#0a1d37] text-white flex items-center justify-center font-black shrink-0 text-xl shadow-lg shadow-blue-900/20">1</div>
                    <div>
                      <h3 className="text-2xl font-sans font-bold text-slate-900 mb-2">Δημιουργία Φακέλου</h3>
                      <p className="text-slate-600 leading-relaxed">Φτιάχνετε τον ψηφιακό φάκελο του οφειλέτη εισάγοντας απλά το Ονοματεπώνυμο και το ΑΦΜ του.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-[#0a1d37] text-white flex items-center justify-center font-black shrink-0 text-xl shadow-lg shadow-blue-900/20">2</div>
                    <div>
                      <h3 className="text-2xl font-sans font-bold text-slate-900 mb-2">Ανέβασμα Αρχείων (Drag & Drop)</h3>
                      <p className="text-slate-600 leading-relaxed">Ανεβάζετε με ένα κλικ το Excel των Ακινήτων (Ε9) στο ένα πεδίο και το Excel των Βαρών στο άλλο.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-[#0a1d37] text-white flex items-center justify-center font-black shrink-0 text-xl shadow-lg shadow-blue-900/20">3</div>
                    <div>
                      <h3 className="text-2xl font-sans font-bold text-slate-900 mb-2">Αυτόματη Ταύτιση & Υπολογισμός</h3>
                      <p className="text-slate-600 leading-relaxed">Ο αλγόριθμος σαρώνει τα δεδομένα, ταυτίζει διευθύνσεις και κατανέμει τα βάρη υπολογίζοντας αυτόματα τη Συνολική Αξία Ρευστοποίησης.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-[#0a1d37] text-white flex items-center justify-center font-black shrink-0 text-xl shadow-lg shadow-blue-900/20">4</div>
                    <div>
                      <h3 className="text-2xl font-sans font-bold text-slate-900 mb-2">Εξαγωγή Επίσημου PDF</h3>
                      <p className="text-slate-600 leading-relaxed">Εξάγετε την τελική αναφορά με ενσωματωμένο Εξώφυλλο Εμπιστευτικότητας (GDPR).</p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 glass-card-light rounded-[3rem] p-8 border border-slate-200 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-12 bg-slate-50 border-b border-slate-200 flex items-center px-6 gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="pt-12 space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center border-dashed">
                        <FileUp className="w-10 h-10 mx-auto mb-3 text-teal" />
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Drop E9 Excel</span>
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center border-dashed">
                        <FileUp className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Drop Claims Excel</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 overflow-x-auto shadow-sm">
                      <table className="w-full text-left text-[10px] sm:text-xs border-collapse min-w-[500px]">
                        <thead>
                          <tr>
                            <th className="px-3 pb-3 font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">Match ID</th>
                            <th className="px-3 pb-3 font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΔΙΕΥΘΥΝΣΗ</th>
                            <th className="px-3 pb-3 font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 text-center">ΠΟΣΟΣΤΟ</th>
                            <th className="px-3 pb-3 font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΑΞΙΑ</th>
                            <th className="px-3 pb-3 font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-3 py-3 font-semibold text-slate-700">
                              <span className="inline-flex w-8 h-8 rounded-xl bg-[#0a1d37] text-white items-center justify-center font-black text-xs shadow-md shadow-blue-900/20 group-hover:scale-110 transition-transform">1</span>
                            </td>
                            <td className="px-3 py-3 font-medium text-slate-800">
                              ΚΑΛΛΙΘΕΑ, ΑΘΗΝΑ
                            </td>
                            <td className="px-3 py-3 font-bold text-slate-700 text-center">
                              100%
                            </td>
                            <td className="px-3 py-3 font-bold text-slate-900">
                              € 145.200
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Ταυτίστηκε
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-3 py-3 font-semibold text-slate-700">
                              <span className="inline-flex w-8 h-8 rounded-xl bg-[#0a1d37] text-white items-center justify-center font-black text-xs shadow-md shadow-blue-900/20 group-hover:scale-110 transition-transform">2</span>
                            </td>
                            <td className="px-3 py-3 font-medium text-slate-800">
                              ΠΕΡΙΣΤΕΡΙ, ΑΘΗΝΑ
                            </td>
                            <td className="px-3 py-3 font-bold text-slate-700 text-center">
                              50%
                            </td>
                            <td className="px-3 py-3 font-bold text-slate-900">
                              € 85.000
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Ταυτίστηκε
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-teal hover:bg-teal/90 rounded-2xl p-4 flex justify-center cursor-pointer transition-all shadow-lg shadow-teal/20">
                      <span className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                        <Printer className="w-4 h-4" /> Print Official PDF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="pricing" className="py-24 relative z-10 border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-sans font-bold text-slate-900 mb-4">ΕΠΙΛΕΞΤΕ ΤΟ ΠΛΑΝΟ ΠΟΥ ΣΑΣ ΤΑΙΡΙΑΖΕΙ</h2>
                <p className="text-slate-600 font-medium text-lg">Ξεκινήστε σήμερα και κερδίστε εκατοντάδες χαμένες εργατοώρες.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-[#0a1d37] rounded-[2.5rem] p-10 border border-white/10 flex flex-col text-white shadow-xl">
                  <h3 className="text-2xl font-sans font-bold mb-2">Basic</h3>
                  <p className="text-slate-400 text-sm mb-6">Ιδανικό για μικρά γραφεία.</p>
                  <div className="mb-6"><span className="text-5xl font-black">19,90€</span><span className="text-slate-400">/μηνα</span></div>
                  <ul className="space-y-4 mb-8 flex-1 text-slate-300">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span>εως <strong>5 υποθέσεις</strong> τον μήνα</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span>Αυτόματη ταύτιση Ε9 & Βαρών</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span>Εξαγωγή PDF Αναφορών</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span>100% GDPR Compliant</span></li>
                  </ul>
                  <button onClick={() => setAppMode('APP')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl transform hover:-translate-y-1">ΞΕΚΙΝΗΣΤΕ ΜΕ BASIC</button>
                </div>

                <div className="bg-[#0a1d37] rounded-[2.5rem] p-10 border-2 border-teal/30 flex flex-col relative transform md:-translate-y-4 shadow-2xl glow-teal text-white">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Προτεινομενο</div>
                  <h3 className="text-2xl font-sans font-bold mb-2">Pro</h3>
                  <p className="text-slate-400 text-sm mb-6 font-medium">Για γραφεία με μεγάλο όγκο υποθέσεων.</p>
                  <div className="mb-6"><span className="text-5xl font-black">39,90€</span><span className="text-teal font-bold ml-1">/μηνα</span></div>
                  <ul className="space-y-4 mb-8 flex-1 text-slate-300 font-medium">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span><strong>Απεριόριστες</strong> υποθέσεις</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span>Αυτόματη ταύτιση Ε9 & Βαρών</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span>Εξαγωγή PDF Αναφορών</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span>100% GDPR Compliant</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal"/> <span>Άμεση υποστήριξη (Priority Support)</span></li>
                  </ul>
                  <button onClick={() => setAppMode('APP')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl shadow-emerald-600/20 transform hover:-translate-y-1">ΑΝΑΒΑΘΜΙΣΤΕ ΣΕ PRO</button>
                </div>
              </div>
            </div>
          </section>

          <section id="security" className="py-24 relative z-10 overflow-hidden border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-6 text-center">
               <div className="w-20 h-20 rounded-3xl bg-teal/20 flex items-center justify-center text-teal mx-auto mb-8 glow-teal">
                 <ShieldCheck className="w-10 h-10" />
               </div>
              <h2 className="text-4xl md:text-5xl font-sans font-bold text-slate-900 mb-6">Απόλυτη Προστασία & Συμμόρφωση με τον GDPR</h2>
              <p className="text-slate-600 mb-10 text-lg leading-relaxed">Γνωρίζουμε πόσο ευαίσθητα είναι τα δεδομένα των πελατών σας. Γι' αυτό το ExoMatch PRO χτίστηκε με την αρχή <strong>Privacy by Design</strong>. Ο αλγόριθμος εκτελείται αποκλειστικά στον περιηγητή σας (Browser). <strong>Τα Excel, τα ΑΦΜ και οι οφειλές ΔΕΝ αποθηκεύονται και ΔΕΝ διαβιβάζονται ποτέ στους servers μας.</strong></p>
            </div>
          </section>

          <footer className="bg-[#050b18] border-t border-white/10 pt-16 pb-8 relative z-10 text-white">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 mb-12">
              <div>
                <ExoMatchLogo className="h-10 mb-6" theme="dark" />
                <p className="text-sm text-slate-400 font-medium leading-relaxed">Το κορυφαίο λογισμικό μοναδικοποίησης περιουσίας και βαρών, σχεδιασμένο ειδικά για επαγγελματίες του Εξωδικαστικού Μηχανισμού.</p>
              </div>
              <div>
                <h4 className="font-sans font-bold text-white mb-6 text-lg uppercase tracking-wider">ΕΠΙΚΟΙΝΩΝΙΑ</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-teal"/> Δ/νση: Αγίου Νικολάου 1, Σάμος 83100</li>
                  <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-teal"/> 2273081618</li>
                  <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-teal"/> <a href="mailto:info@bizboost.gr" className="hover:text-teal transition-colors">info@bizboost.gr</a></li>
                  <li className="flex items-center gap-3"><Globe className="w-4 h-4 text-teal"/> <a href="https://www.bizboost.gr" target="_blank" rel="noopener noreferrer" className="hover:text-teal transition-colors">www.bizboost.gr</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-sans font-bold text-white mb-6 text-lg uppercase tracking-wider">ΝΟΜΙΚΑ ΕΓΓΡΑΦΑ</h4>
                <ul className="space-y-4 text-sm text-white font-bold">
                  <li><button onClick={() => setLegalModal('TOS')} className="hover:text-teal transition-colors flex items-center gap-2 uppercase tracking-wider"><ChevronRight className="w-3 h-3 text-teal"/> ΟΡΟΙ ΧΡΗΣΗΣ (TOS)</button></li>
                  <li><button onClick={() => setLegalModal('PRIVACY')} className="hover:text-teal transition-colors flex items-center gap-2 uppercase tracking-wider"><ChevronRight className="w-3 h-3 text-teal"/> ΠΟΛΙΤΙΚΗ ΑΠΟΡΡΗΤΟΥ</button></li>
                  <li><button onClick={() => setLegalModal('DPA')} className="hover:text-teal transition-colors flex items-center gap-2 uppercase tracking-wider"><ChevronRight className="w-3 h-3 text-teal"/> ΣΥΜΒΑΣΗ ΕΠΕΞΕΡΓΑΣΙΑΣ (DPA)</button></li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ΣΧΕΔΙΑΣΗ & ΑΝΑΠΤΥΞΗ: THE BIZBOOST BY G. DIONYSIOU</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">© 2024-2026 - THE BIZBOOST BY G. DIONYSIOU</p>
            </div>
          </footer>
        </div>
      )}

      {/* 3. AUTH LOGIC */}
      {appMode === 'APP' && (authStatus === 'RESET_PASSWORD' || authStatus === 'LOGIN') && (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <BackgroundWatermark />
          <button onClick={() => setAppMode('LANDING')} className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 font-bold text-slate-600 hover:text-teal transition-all"><ArrowLeft className="w-4 h-4" /> Πίσω στη Σελίδα</button>
          <div className="w-full max-w-md glass-card-light rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 glow-teal">
            <div className="p-8 text-center bg-slate-50 border-b border-slate-200">
              <ExoMatchLogo className="h-24 w-auto mx-auto mb-6" />
              <p className="text-xs text-teal font-black uppercase tracking-widest mt-1">
                {authStatus === 'RESET_PASSWORD' ? 'ΕΠΑΝΑΦΟΡΑ ΚΩΔΙΚΟΥ' : (isLoginMode ? 'ΕΙΣΟΔΟΣ ΣΤΟ WORKSPACE' : 'ΔΗΜΙΟΥΡΓΙΑ ΝΕΟΥ ΛΟΓΑΡΙΑΣΜΟΥ')}
              </p>
            </div>
            <form onSubmit={authStatus === 'RESET_PASSWORD' ? handleResetPassword : handleAuthAction} className="p-8 space-y-5">
              {(loginError || resetMessage) && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl text-center">
                  {loginError || resetMessage?.text}
                </div>
              )}
              
              {authStatus !== 'RESET_PASSWORD' && (
                <div className="mb-6 space-y-3">
                    <button type="button" onClick={handleOAuthLogin} className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-sm font-black uppercase tracking-widest text-slate-900 shadow-xl">
                      <Globe className="w-5 h-5 text-teal" />
                      Συνδεση με Google
                    </button>
                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Η με Email</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                </div>
              )}

              {!isLoginMode && authStatus !== 'RESET_PASSWORD' && (
                <>
                  <div className="mb-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={requireInvoice} 
                        onChange={(e) => setRequireInvoice(e.target.checked)}
                        className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <span className="text-sm font-bold text-blue-900">Επιθυμώ έκδοση Τιμολογίου</span>
                    </label>
                    {requireInvoice && (
                      <p className="mt-2 text-xs text-slate-500">
                        Συμπληρώστε το ΑΦΜ σας παρακάτω και τα στοιχεία σας θα συμπληρωθούν αυτόματα.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-teal uppercase tracking-widest mb-2">ΟΝΟΜΑΤΕΠΩΝΥΜΟ</label>
                      <input type="text" required value={registerFullName} onChange={(e) => setRegisterFullName(e.target.value)} placeholder="Γιώργος Παππάς" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-teal uppercase tracking-widest mb-2">
                        {requireInvoice ? 'ΑΦΜ (ΥΠΟΧΡΕΩΤΙΚΟ)' : 'ΑΦΜ (ΠΡΟΑΙΡΕΤΙΚΟ)'}
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required={requireInvoice}
                          maxLength={9}
                          value={registerAfm} 
                          onChange={handleAfmChange} 
                          placeholder="012345678" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" 
                        />
                        {isFetchingAfm && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-teal uppercase tracking-widest mb-2">ΕΠΩΝΥΜΙΑ ΕΠΙΧΕΙΡΗΣΗΣ / ΓΡΑΦΕΙΟΥ</label>
                      <input type="text" required value={registerOfficeName} onChange={(e) => setRegisterOfficeName(e.target.value)} placeholder="Pappas Law Firm" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                    </div>
                    
                    {requireInvoice && (
                      <>
                        <div>
                          <label className="block text-[10px] font-black text-teal uppercase tracking-widest mb-2">ΔΙΕΥΘΥΝΣΗ ΕΔΡΑΣ</label>
                          <input type="text" required value={registerAddress} onChange={(e) => setRegisterAddress(e.target.value)} placeholder="Οδός, Αριθμός, ΤΚ, Πόλη" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-teal uppercase tracking-widest mb-2">Δ.Ο.Υ.</label>
                          <input type="text" required value={registerDoy} onChange={(e) => setRegisterDoy(e.target.value)} placeholder="π.χ. Α' ΑΘΗΝΩΝ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-[10px] font-black text-teal uppercase tracking-widest mb-2">ΕΙΔΙΚΟΤΗΤΑ</label>
                      <select required value={registerProfession} onChange={(e) => setRegisterProfession(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 transition-all">
                        <option value="" disabled>Επιλέξτε...</option>
                        <option value="Δικηγόρος">Δικηγόρος</option>
                        <option value="Λογιστής / Φοροτεχνικός">Λογιστής / Φοροτεχνικός</option>
                        <option value="Αναλογιστής">Αναλογιστής</option>
                        <option value="Σύμβουλος Επιχειρήσεων">Σύμβουλος Επιχειρήσεων</option>
                        <option value="Άλλο">Άλλο</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-teal uppercase tracking-widest mb-2">ΤΗΛΕΦΩΝΟ</label>
                      <input type="tel" required value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} placeholder="210..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-black text-teal uppercase tracking-widest mb-2">EMAIL ΕΠΑΓΓΕΛΜΑΤΙΑ</label>
                <input type="email" required value={authStatus === 'RESET_PASSWORD' ? resetEmail : loginEmail} onChange={(e) => authStatus === 'RESET_PASSWORD' ? setResetEmail(e.target.value) : setLoginEmail(e.target.value)} placeholder="info@lawoffice.gr" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
              </div>
              
              {authStatus !== 'RESET_PASSWORD' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-teal uppercase tracking-widest">ΚΩΔΙΚΟΣ ΠΡΟΣΒΑΣΗΣ</label>
                    {isLoginMode && (
                      <button type="button" onClick={() => setAuthStatus('RESET_PASSWORD')} className="text-[10px] font-bold text-teal/60 hover:text-teal transition-colors">
                        Ξεχάσατε τον κωδικό;
                      </button>
                    )}
                  </div>
                  <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder={isLoginMode ? "••••••••" : "Τουλάχιστον 6 χαρακτήρες"} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                  {!isLoginMode && (loginPassword || '').length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden bg-slate-100">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <div key={index} className={`flex-1 transition-all duration-500 ${index <= strength ? strengthColors[strength] : 'bg-transparent'}`}></div>
                        ))}
                      </div>
                      <p className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${strength < 2 ? 'text-rose-500' : strength < 4 ? 'text-amber-500' : 'text-teal'}`}>{strengthLabels[strength]}</p>
                    </div>
                  )}
                </div>
              )}

              {!isLoginMode && authStatus !== 'RESET_PASSWORD' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-teal uppercase tracking-widest">ΕΠΙΒΕΒΑΙΩΣΗ ΚΩΔΙΚΟΥ</label>
                  </div>
                  <input type="password" required value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} placeholder="Επαναλάβετε τον κωδικό" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/50 text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                </div>
              )}

              {!isLoginMode && authStatus !== 'RESET_PASSWORD' && (
                <div className="flex items-start gap-3 mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <input type="checkbox" id="gdprTerms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-200 bg-white text-teal focus:ring-teal/50" />
                  <label htmlFor="gdprTerms" className="text-[10px] text-slate-600 leading-relaxed font-medium">
                    Αποδέχομαι τους <button type="button" onClick={() => setLegalModal('TOS')} className="text-teal font-bold hover:underline">Όρους Χρήσης</button> και την <button type="button" onClick={() => setLegalModal('PRIVACY')} className="text-teal font-bold hover:underline">Πολιτική Απορρήτου</button>. Κατανοώ ότι ως επαγγελματίας διατηρώ την ευθύνη τήρησης του GDPR.
                  </label>
                </div>
              )}

              <button disabled={isLoggingIn || isResetting} type="submit" className="w-full py-4 mt-4 text-sm font-black uppercase tracking-widest text-white bg-[#0a1d37] hover:bg-[#0a1d37]/90 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50">
                {isLoggingIn || isResetting ? <Loader2 className="w-5 h-5 animate-spin" /> : (authStatus === 'RESET_PASSWORD' ? 'ΑΠΟΣΤΟΛΗ' : (isLoginMode ? 'ΣΥΝΔΕΣΗ' : 'ΕΓΓΡΑΦΗ'))}
              </button>

              {authStatus !== 'RESET_PASSWORD' ? (
                <div className="pt-6 text-center mt-2 border-t border-slate-200">
                  <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setLoginError(''); setAcceptTerms(false); setIsLoggingIn(false); }} className="text-xs font-black uppercase tracking-widest text-teal hover:text-teal/80 transition-colors">
                    {isLoginMode ? "ΔΕΝ ΕΧΕΤΕ ΛΟΓΑΡΙΑΣΜΟ; ΚΑΝΤΕ ΕΓΓΡΑΦΗ" : "ΕΧΕΤΕ ΗΔΗ ΛΟΓΑΡΙΑΣΜΟ; ΚΑΝΤΕ ΕΙΣΟΔΟ"}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setAuthStatus('LOGIN')} className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl border border-slate-200 transition-all">
                  Επιστροφη στην Εισοδο
                </button>
              )}
            </form>
          </div>
          <div className="mt-12 text-center relative z-10 flex flex-col items-center justify-center gap-2">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">ΣΧΕΔΙΑΣΗ & ΑΝΑΠΤΥΞΗ: THE BIZBOOST BY G. DIONYSIOU</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">© 2024-2026 - THE BIZBOOST BY G. DIONYSIOU</p>
          </div>
        </div>
      )}

      {/* 4. UNVERIFIED EMAIL */}
      {appMode === 'APP' && authStatus === 'UNVERIFIED_EMAIL' && (
        <div className="min-h-screen bg-[#050b18] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <BackgroundWatermark />
          <div className="w-full max-w-md glass-card rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-10 text-center glow-teal">
            <div className="w-20 h-20 bg-teal/10 text-teal rounded-3xl flex items-center justify-center mx-auto mb-8 glow-teal">
              <Mail className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-sans font-bold text-white mb-4">Επιβεβαίωση Email</h2>
            <p className="text-slate-400 mb-10 leading-relaxed font-medium">
              Έχουμε στείλει ένα email επιβεβαίωσης στο <strong className="text-teal">{currentUser}</strong>. 
              Παρακαλούμε ελέγξτε τα εισερχόμενά σας και κάντε κλικ στο σύνδεσμο για να ενεργοποιήσετε τον λογαριασμό σας.
            </p>
            <button 
              onClick={handleCheckVerification} 
              disabled={isLoggingIn}
              className="w-full py-4 text-sm font-black uppercase tracking-widest text-[#050b18] bg-teal hover:bg-teal/90 rounded-2xl shadow-lg shadow-teal/20 mb-6 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Εχω κανει επιβεβαιωση'}
            </button>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-500 hover:text-teal transition-colors uppercase tracking-widest">
              Αποσυνδεση
            </button>
          </div>
          <div className="mt-12 text-center relative z-10 flex flex-col items-center justify-center gap-2">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">ΣΧΕΔΙΑΣΗ & ΑΝΑΠΤΥΞΗ: THE BIZBOOST BY G. DIONYSIOU</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">© 2024-2026 - THE BIZBOOST BY G. DIONYSIOU</p>
          </div>
        </div>
      )}

      {/* 5. PAYWALL */}
      {appMode === 'APP' && authStatus === 'PAYWALL' && (
        <div className="min-h-screen bg-[#050b18] flex flex-col items-center justify-center p-4 relative overflow-hidden">
  <BackgroundWatermark />
  <div className="w-full max-w-4xl glass-card rounded-[3rem] shadow-2xl overflow-hidden text-center p-12 relative z-10 glow-teal">
    <ExoMatchLogo className="h-24 mx-auto mb-8" />
    <h2 className="text-4xl font-sans font-bold text-white mb-4">Ενεργοποίηση Συνδρομής</h2>
    
    {window !== window.top && (
      <div className="mb-8 bg-rose-500/10 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-3 text-left">
        <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-rose-400 font-bold text-sm mb-1">Προσοχή: Εκτελείτε την εφαρμογή σε προεπισκόπηση (iframe)</h4>
          <p className="text-rose-300/80 text-xs leading-relaxed">
            Το Stripe δεν επιτρέπει πληρωμές μέσα σε iframe για λόγους ασφαλείας. Το κουμπί πληρωμής ενδέχεται να μην λειτουργεί. 
            Παρακαλώ <strong>ανοίξτε την εφαρμογή σε νέα καρτέλα</strong> για να προχωρήσετε στην πληρωμή.
          </p>
        </div>
      </div>
    )}

    <p className="text-slate-400 font-medium mb-12 bg-white/5 inline-block px-8 py-3 rounded-full border border-white/10 shadow-inner">
      Επιλέξτε το <strong className="text-white">Basic (εως 5 υποθέσεις/μήνα)</strong> ή το <strong className="text-teal">Pro (Απεριόριστες)</strong>.
    </p>

    <div className="w-full min-h-[500px] bg-white rounded-[2rem] p-4 shadow-2xl">
      <stripe-pricing-table
        pricing-table-id={import.meta.env.VITE_STRIPE_PRICING_TABLE_ID || ""}
        publishable-key={import.meta.env.VITE_STRIPE_PUBLIC_KEY || ""}
        client-reference-id={auth.currentUser?.uid || ""}
        customer-email={auth.currentUser?.email || ""}
      >
      </stripe-pricing-table>
    </div>
            
            <button onClick={handleLogout} className="mt-12 text-slate-500 hover:text-teal flex items-center gap-2 mx-auto font-black uppercase tracking-widest text-xs transition-colors">
              <LogOut className="w-4 h-4"/> Αποσυνδεση Λογαριασμου
            </button>
          </div>
          <div className="mt-12 text-center relative z-10 flex flex-col items-center justify-center gap-2">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">ΣΧΕΔΙΑΣΗ & ΑΝΑΠΤΥΞΗ: THE BIZBOOST BY G. DIONYSIOU</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">© 2024-2026 - THE BIZBOOST BY G. DIONYSIOU</p>
          </div>
        </div>
      )}

      {/* 6. ΕΣΩΤΕΡΙΚΟ ΕΦΑΡΜΟΓΗΣ (DASHBOARD/TUTORIAL/SETTINGS) */}
      {appMode === 'APP' && authStatus === 'AUTHORIZED' && currentView !== 'WORKSPACE' && (
        <div className="min-h-screen bg-slate-50/50 text-blue-950 font-sans flex relative overflow-hidden">
          <BackgroundWatermark />
          
          {isModalOpen && currentView === 'DASHBOARD' && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-blue-200 p-8">
                <div className="flex justify-between items-center mb-6 bg-blue-50/50 p-4 rounded-xl -mt-4 -mx-4 border-b border-blue-100">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center"><FolderOpen className="w-4 h-4" /></div><h3 className="font-bold text-lg text-blue-950 tracking-tight">{t.newCase}</h3></div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-blue-900 hover:bg-blue-100 p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreateProject} className="space-y-5">
                  <div><label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">ΟΝΟΜΑΤΕΠΩΝΥΜΟ ΟΦΕΙΛΕΤΗ <span className="text-rose-500">*</span></label><input type="text" autoFocus required value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="π.χ. Παπαδόπουλος Ιωάννης" className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-blue-950 font-medium" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">ΑΦΜ</label>
                      <input type="text" maxLength={9} value={newAfm} onChange={(e) => { setNewAfm(e.target.value.replace(/\D/g, '')); setAfmError(''); }} placeholder="π.χ. 012345678" className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border ${afmError ? 'border-rose-500 focus:ring-rose-500/50' : 'border-blue-200 focus:ring-blue-500/50'} rounded-xl focus:ring-2 text-sm font-mono text-blue-950`} />
                      {afmError && <p className="text-rose-500 text-xs mt-1 font-medium">{afmError}</p>}
                    </div>
                    <div><label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">ΑΡ. ΑΙΤΗΣΗΣ</label><input type="text" value={newOcwNumber} onChange={(e) => setNewOcwNumber(e.target.value)} placeholder="π.χ. ΑΙΤ-2026-891" className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm font-mono text-blue-950" /></div>
                  </div>
                  {createError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
                      {createError}
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors">Ακύρωση</button>
                    {(!newFullName.trim() || isCreatingCase) ? (
                      <button 
                        type="button" 
                        disabled 
                        className="px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 cursor-not-allowed opacity-60"
                        style={{ backgroundColor: '#e2e8f0', color: '#475569' }}
                      >
                        {isCreatingCase && <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#475569' }} />}
                        <span style={{ color: '#475569' }}>Δημιουργία</span>
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all hover:opacity-90"
                        style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
                      >
                        <span style={{ color: '#ffffff' }}>Δημιουργία</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {projectToDelete && currentView === 'DASHBOARD' && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setProjectToDelete(null)} />
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden border border-slate-200 p-8 text-center">
                <div className="w-20 h-20 bg-rose-50/80 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 border-8 border-white/50 shadow-sm"><AlertTriangle className="w-10 h-10" /></div>
                <h3 className="text-xl font-bold text-blue-950 mb-2">Διαγραφή Φακέλου;</h3><p className="text-sm text-slate-500 mb-8 font-medium">Όλα τα δεδομένα της υπόθεσης θα διαγραφούν οριστικά. Η ενέργεια δεν αναιρείται.</p>
                <div className="flex gap-3 justify-center"><button onClick={() => setProjectToDelete(null)} className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100/80 hover:bg-slate-200 rounded-xl transition-colors">Ακύρωση</button><button onClick={confirmDeleteProject} className="flex-1 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md">Διαγραφή</button></div>
              </div>
            </div>
          )}

          <aside className="w-72 bg-white/70 backdrop-blur-md border-r border-blue-100/50 p-6 flex flex-col z-10 hidden md:flex shadow-sm relative">
            <div className="flex justify-center mb-8 bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50"><ExoMatchLogo className="h-20 w-auto" theme="light" /></div>
            <nav className="flex-1 space-y-2">
              <button onClick={() => setCurrentView('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${currentView === 'DASHBOARD' ? 'bg-[#0a1d37] text-white shadow-xl shadow-blue-900/20' : 'text-slate-600 hover:bg-blue-50/80'}`}><LayoutDashboard className="w-4 h-4" /> {t.dashboard}</button>
              <button onClick={() => setCurrentView('TUTORIAL')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${currentView === 'TUTORIAL' ? 'bg-[#0a1d37] text-white shadow-xl shadow-blue-900/20' : 'text-slate-600 hover:bg-blue-50/80'}`}><BookOpen className="w-4 h-4" /> {t.tutorial}</button>
              <button onClick={() => setCurrentView('SETTINGS')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${currentView === 'SETTINGS' ? 'bg-[#0a1d37] text-white shadow-xl shadow-blue-900/20' : 'text-slate-600 hover:bg-blue-50/80'}`}><Settings className="w-4 h-4" /> {t.settings}</button>
              <a href="https://billing.stripe.com/p/login/00w28sa6H8b48YI6O09k400" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-4 py-4 text-slate-600 hover:bg-blue-50/80 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"><CreditCard className="w-4 h-4" /> {t.subscription}</a>
            </nav>
            <div className="pt-4 border-t border-slate-200/50">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-100/80 text-blue-900 flex items-center justify-center font-bold text-xs uppercase">{currentUser?.substring(0, 2)}</div><div className="overflow-hidden"><p className="text-[10px] uppercase font-bold text-blue-800">{userPlan === 'PRO' ? 'PRO PLAN' : 'BASIC PLAN'}</p><p className="text-xs font-semibold text-blue-950 truncate w-32">{currentUser}</p></div></div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500"><LogOut className="w-4 h-4" /></button>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-8 md:p-12 overflow-y-auto pb-20 relative z-10">
            {currentView === 'DASHBOARD' && (
              <>
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-blue-950 tracking-tight mb-2">{t.myCases}</h2>
                    <p className="text-slate-500 font-medium text-sm">Διαχειριστείτε τους φακέλους των πελατών σας και δημιουργήστε νέους.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {userPlan === 'BASIC' && currentUser !== 'info@bizboost.gr' && (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-100 mb-1">
                          Υποθέσεις: <span className={usageCount >= 10 ? 'text-rose-600' : 'text-blue-600'}>{usageCount} / 10</span>
                        </span>
                        {usageCount >= 8 && <span className="text-[10px] text-amber-600 font-bold">Πλησιάζετε το όριο!</span>}
                      </div>
                    )}
                    <button onClick={() => {
                        if (currentUser !== 'info@bizboost.gr' && userPlan === 'BASIC' && usageCount >= 5) {
                           alert("Έχετε φτάσει το μηνιαίο όριο των 5 υποθέσεων του Basic πλάνου.\n\nΠαρακαλώ αναβαθμίστε σε PRO από το μενού 'Συνδρομή'.");
                        } else { setIsModalOpen(true); }
                    }} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-teal-600/20 transition-all transform hover:-translate-y-1"><Plus className="w-5 h-5" /> {t.newCase}</button>
                  </div>
                </header>
                {(projects || []).length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-md border-2 border-blue-200/60 border-dashed rounded-3xl p-16 flex flex-col items-center text-center max-w-2xl mx-auto mt-10">
                    <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <FolderOpen className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-950 mb-3">{t.emptyWorkspace}</h3>
                    <p className="text-base text-slate-500 mb-8 max-w-md leading-relaxed">Δεν έχετε δημιουργήσει ακόμα κάποιον φάκελο πελάτη. Ξεκινήστε προσθέτοντας την πρώτη σας υπόθεση για να κάνετε αυτόματη μοναδικοποίηση.</p>
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-bold text-base flex items-center gap-3 shadow-xl shadow-blue-900/20 transition-all transform hover:-translate-y-1">
                      <Plus className="w-5 h-5" /> Δημιουργία Πρώτου Φακέλου
                    </button>
                  </div>
                ) : (
                  casesViewMode === 'LIST' ? (
                    <div className="flex flex-col gap-3">
                      {projects.map(project => (
                        <div key={project.id} onClick={() => openProject(project)} className="bg-white/90 backdrop-blur-md border border-blue-100/80 rounded-2xl p-4 hover:shadow-lg hover:shadow-blue-900/5 cursor-pointer flex items-center justify-between group transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="flex items-center gap-5 flex-1 min-w-0 pl-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-900 rounded-xl flex items-center justify-center shadow-sm border border-blue-100/50 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <FolderOpen className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                              <div className="md:col-span-2">
                                <h3 className="font-extrabold text-blue-950 text-base truncate group-hover:text-blue-700 transition-colors">{project.fullName}</h3>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">{project.date}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-400 font-medium">ΑΦΜ:</span>
                                <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md">{project.afm}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-400 font-medium">ΑΙΤ:</span>
                                <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md truncate">{project.ocwNumber}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 ml-4">
                            <div className="flex items-center gap-1 text-teal-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300 whitespace-nowrap">
                              Άνοιγμα <ChevronRight className="w-4 h-4" />
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.id); }} className="p-2 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all z-10 opacity-0 group-hover:opacity-100" title={lang === 'EL' ? "Διαγραφή" : "Delete"}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {projects.map(project => (
                        <div key={project.id} onClick={() => openProject(project)} className="bg-white/90 backdrop-blur-md border border-blue-100/80 rounded-3xl p-6 hover:shadow-xl hover:shadow-blue-900/5 cursor-pointer flex flex-col relative group transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           
                           <div className="flex justify-between items-start mb-5">
                             <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-900 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
                               <FolderOpen className="w-6 h-6" />
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.id); }} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all z-10 opacity-0 group-hover:opacity-100" title={lang === 'EL' ? "Διαγραφή" : "Delete"}>
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                           
                           <h3 className="font-extrabold text-blue-950 text-xl mb-1 truncate pr-4 group-hover:text-blue-700 transition-colors">{project.fullName}</h3>
                           
                           <div className="space-y-2 mt-4 flex-1">
                             <div className="flex items-center gap-2 text-sm">
                               <span className="text-slate-400 font-medium w-12">ΑΦΜ:</span>
                               <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md">{project.afm}</span>
                             </div>
                             <div className="flex items-center gap-2 text-sm">
                               <span className="text-slate-400 font-medium w-12">ΑΙΤ:</span>
                               <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md truncate">{project.ocwNumber}</span>
                             </div>
                           </div>
                           
                           <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{project.date}</span>
                             <div className="flex items-center gap-1 text-teal-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                               Άνοιγμα <ChevronRight className="w-4 h-4" />
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}

            {currentView === 'TUTORIAL' && (
               <div className="max-w-4xl mx-auto">
                  <header className="mb-10 text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6"><BookOpen className="w-8 h-8" /></div>
                    <h2 className="text-3xl font-bold text-blue-950 tracking-tight">Πώς λειτουργεί το ExoMatch PRO;</h2>
                    <p className="text-slate-500 mt-3 text-lg">Οδηγός βήμα-προς-βήμα για τη γρήγορη και ακριβή μοναδικοποίηση περιουσίας.</p>
                  </header>
                  <div className="space-y-8">
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-blue-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1"><span className="text-teal-600 font-extrabold text-sm uppercase tracking-wider mb-2 block">Βημα 1ο</span><h3 className="text-2xl font-bold text-blue-950 mb-3">Δημιουργία Φακέλου Πελάτη</h3><p className="text-slate-600 leading-relaxed">Ξεκινήστε πηγαίνοντας στον Πίνακα Ελέγχου (Dashboard) και πατώντας το κουμπί <strong>"Νέος Φάκελος"</strong>. Συμπληρώστε το Ονοματεπώνυμο του οφειλέτη και προαιρετικά το ΑΦΜ ή τον Αριθμό Αίτησης.</p></div>
                      <div className="w-full md:w-64 h-40 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 flex items-center justify-center flex-col text-blue-400"><FolderOpen className="w-10 h-10 mb-2" /><span className="font-bold text-sm">Νέα Υπόθεση</span></div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-blue-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1 order-2 md:order-1"><span className="text-teal-600 font-extrabold text-sm uppercase tracking-wider mb-2 block">Βημα 2ο</span><h3 className="text-2xl font-bold text-blue-950 mb-3">Εισαγωγή Αρχείων Excel / CSV</h3><p className="text-slate-600 leading-relaxed">Μέσα στον φάκελο της υπόθεσης θα δείτε τρεις περιοχές μεταφόρτωσης για τα αρχεία του Εξωδικαστικού:<br/><br/>• <strong>Ανέβασμα Ε9 (Ακίνητα):</strong> Ανεβάζετε το αρχείο "Ακίνητα" / PropertytaxbuildingsXLS<br/>• <strong>Ανέβασμα Βαρών:</strong> Ανεβάζετε το αρχείο "Περιουσιακά Στοιχεία - Πιστωτές" / assetsXLS<br/>• <strong>Ανέβασμα Προσημειώσεων:</strong> Ανεβάζετε το αρχείο "Εξασφαλίσεις - Πιστωτές" / CollateralXLS</p></div>
                      <div className="w-full md:w-64 flex gap-2 order-1 md:order-2"><div className="flex-1 h-40 bg-teal-50 rounded-2xl border-2 border-teal-200 flex flex-col items-center justify-center text-teal-600 p-2"><FileUp className="w-6 h-6 mb-2"/><span className="text-[10px] font-bold text-center">Ακίνητα</span></div><div className="flex-1 h-40 bg-blue-50 rounded-2xl border-2 border-blue-200 flex flex-col items-center justify-center text-blue-800 p-2"><FileUp className="w-6 h-6 mb-2"/><span className="text-[10px] font-bold text-center">Βάρη</span></div><div className="flex-1 h-40 bg-indigo-50 rounded-2xl border-2 border-indigo-200 flex flex-col items-center justify-center text-indigo-800 p-2"><FileUp className="w-6 h-6 mb-2"/><span className="text-[10px] font-bold text-center">Προσημειώσεις</span></div></div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-blue-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1"><span className="text-teal-600 font-extrabold text-sm uppercase tracking-wider mb-2 block">Βημα 3ο</span><h3 className="text-2xl font-bold text-blue-950 mb-3">Αυτόματη Ταύτιση (Matching)</h3><p className="text-slate-600 leading-relaxed">Μόλις "πέσουν" τα αρχεία, το ExoMatch PRO εκτελεί τον αλγόριθμό του σε κλάσματα δευτερολέπτου. Αναλύει διευθύνσεις, παραλλαγές κειμένου, ποσά και ποσοστά. Κατανέμει "έξυπνα" τα βάρη στα σωστά ακίνητα.</p></div>
                      <div className="w-full md:w-64 h-40 bg-gradient-to-br from-teal-500 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg text-white"><Wand2 className="w-12 h-12" /></div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-blue-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1 order-2 md:order-1"><span className="text-teal-600 font-extrabold text-sm uppercase tracking-wider mb-2 block">Βημα 4ο</span><h3 className="text-2xl font-bold text-blue-950 mb-3">Εξαγωγή Αναφοράς σε PDF</h3><p className="text-slate-600 leading-relaxed">Ελέγξτε τα αποτελέσματα και πατήστε το κουμπί <strong>"Εκτύπωση"</strong>. Θα παραχθεί αυτόματα ένα επίσημο έγγραφο με Εξώφυλλο Εμπιστευτικότητας, έτοιμο να εκτυπωθεί ή να σωθεί ως PDF.</p></div>
                      <div className="w-full md:w-64 h-40 bg-slate-800 rounded-2xl flex items-center justify-center flex-col text-white shadow-lg"><FileDown className="w-10 h-10 mb-2" /><span className="font-bold text-sm">Print Report</span></div>
                    </div>
                  </div>
               </div>
            )}

            {currentView === 'SETTINGS' && (
               <div className="max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-200/50">
                      <h3 className="text-lg font-bold text-blue-950 mb-4">Προφίλ Χρήστη</h3>
                      <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-blue-100/80 text-blue-900 flex items-center justify-center font-bold text-xl uppercase shadow-inner">{currentUser?.substring(0, 2)}</div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Email Συνδεσης</p><p className="text-lg font-semibold text-blue-950">{currentUser}</p></div></div>
                   </div>
                   <div className="p-8 border-b border-slate-200/50">
                      <h3 className="text-lg font-bold text-blue-950 mb-6 flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-blue-900"/> Προτιμήσεις Εμφάνισης</h3>
                      <div className="flex items-center justify-between bg-white/60 p-4 rounded-xl border border-blue-100">
                        <div>
                          <p className="font-bold text-blue-950 text-sm">Προβολή Υποθέσεων</p>
                          <p className="text-xs text-slate-500 mt-1">Επιλέξτε πώς θέλετε να εμφανίζονται οι υποθέσεις σας στο Dashboard.</p>
                        </div>
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button onClick={() => { setCasesViewMode('GRID'); localStorage.setItem('exoMatchPro_viewMode', 'GRID'); }} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${casesViewMode === 'GRID' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-blue-700'}`}>Πινακάκια</button>
                          <button onClick={() => { setCasesViewMode('LIST'); localStorage.setItem('exoMatchPro_viewMode', 'LIST'); }} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${casesViewMode === 'LIST' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-blue-700'}`}>Λίστα</button>
                        </div>
                      </div>
                   </div>
                   <div className="p-8 bg-blue-50/40">
                     <h3 className="text-lg font-bold text-blue-950 mb-6 flex items-center gap-2"><KeyRound className="w-5 h-5 text-blue-900"/> Αλλαγή Κωδικού Πρόσβασης</h3>
                     <form onSubmit={handleChangePassword} className="space-y-4">
                        {settingsMessage && <div className={`p-4 rounded-xl text-sm font-medium ${settingsMessage.type === 'success' ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-200' : 'bg-rose-50/80 text-rose-700 border border-rose-200'}`}>{settingsMessage.text}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">ΝΕΟΣ ΚΩΔΙΚΟΣ</label><input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες" className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm text-blue-950" /></div>
                          <div><label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">ΕΠΙΒΕΒΑΙΩΣΗ</label><input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Επαναλάβετε τον κωδικό" className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm text-blue-950" /></div>
                        </div>
                        <button type="submit" disabled={!newPassword || !confirmPassword} className="mt-4 px-6 py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 disabled:opacity-50 rounded-xl shadow-md">Αποθήκευση Νέου Κωδικού</button>
                     </form>
                   </div>
               </div>
            )}
            <div className="mt-12 text-center relative z-10 flex flex-col items-center justify-center gap-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ΣΧΕΔΙΑΣΗ & ΑΝΑΠΤΥΞΗ: THE BIZBOOST BY G. DIONYSIOU</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024-2026 - THE BIZBOOST BY G. DIONYSIOU</p>
            </div>
          </main>
        </div>
      )}

      {/* 7. ΕΣΩΤΕΡΙΚΟ ΕΦΑΡΜΟΓΗΣ (WORKSPACE - Μέσα στον Φάκελο) */}
      {appMode === 'APP' && authStatus === 'AUTHORIZED' && currentView === 'WORKSPACE' && (
        <div className="min-h-screen bg-slate-50/50 text-blue-950 font-sans flex flex-col relative overflow-hidden">
          <BackgroundWatermark />
          
          <header className="bg-[#0a1d37] border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm relative">
            <div className="flex items-center gap-5">
              <button onClick={goToDashboard} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors shadow-sm border border-white/10"><ChevronLeft className="w-5 h-5" /></button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-teal/20 text-teal-200 text-[10px] uppercase font-extrabold tracking-wider rounded-md border border-teal-500/30">{t.activeProject}</span>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{activeProject?.fullName}</h2>
                  {saveStatus === 'SAVING' && <span className="ml-2 text-[10px] text-slate-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Αποθήκευση...</span>}
                  {saveStatus === 'ERROR' && <span className="ml-2 text-[10px] text-rose-400 flex items-center gap-1" title="Σφάλμα αποθήκευσης"><AlertCircle className="w-3 h-3"/> Εκτός Σύνδεσης</span>}
                  {saveStatus === 'SAVED' && <span className="ml-2 text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Αποθηκεύτηκε</span>}
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block"><ExoMatchLogo className="h-10 w-auto opacity-90" /></div>
            <div className="flex items-center gap-3 relative z-10">
              <button onClick={clearData} className="px-5 py-2.5 bg-white/10 hover:bg-rose-500/20 text-rose-200 border border-rose-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all"><Trash2 className="w-4 h-4 hidden sm:block" /> {t.clearData}</button>
              <button onClick={exportReport} className="px-6 py-2.5 bg-teal hover:bg-teal/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"><Printer className="w-4 h-4 hidden sm:block" /> {t.printReport}</button>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 pb-24 relative z-10">
            <section className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              <label className="flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-md border-2 border-teal-200 border-dashed hover:border-teal-500 hover:bg-teal-50/30 transition-all rounded-3xl p-8 cursor-pointer shadow-sm group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input type="file" multiple className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, 'A')} />
                <div className="w-16 h-16 bg-teal-100/50 text-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10"><Building className="w-8 h-8" /></div>
                <div className="text-center relative z-10">
                  <p className="text-lg font-extrabold text-teal-900 mb-1">{t.uploadAsset}</p>
                  <p className="text-xs text-slate-500 font-medium px-4">{t.uploadAssetDesc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">ΕΠΙΛΟΓΗ ΑΡΧΕΙΟΥ <FileUp className="w-3 h-3"/></div>
                </div>
              </label>

              <label className="flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-md border-2 border-blue-200 border-dashed hover:border-blue-500 hover:bg-blue-50/30 transition-all rounded-3xl p-8 cursor-pointer shadow-sm group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input type="file" multiple className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, 'B')} />
                <div className="w-16 h-16 bg-blue-100/50 text-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10"><Lock className="w-8 h-8" /></div>
                <div className="text-center relative z-10">
                  <p className="text-lg font-extrabold text-blue-950 mb-1">{t.uploadClaim}</p>
                  <p className="text-xs text-slate-500 font-medium px-4">{t.uploadClaimDesc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">ΕΠΙΛΟΓΗ ΑΡΧΕΙΟΥ <FileUp className="w-3 h-3"/></div>
                </div>
              </label>

              <label className="flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-md border-2 border-purple-200 border-dashed hover:border-purple-500 hover:bg-purple-50/30 transition-all rounded-3xl p-8 cursor-pointer shadow-sm group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input type="file" multiple className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, 'C')} />
                <div className="w-16 h-16 bg-purple-100/50 text-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10"><Lock className="w-8 h-8" /></div>
                <div className="text-center relative z-10">
                  <p className="text-lg font-extrabold text-purple-950 mb-1">{t.uploadCollateral}</p>
                  <p className="text-xs text-slate-500 font-medium px-4">{t.uploadCollateralDesc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">ΕΠΙΛΟΓΗ ΑΡΧΕΙΟΥ <FileUp className="w-3 h-3"/></div>
                </div>
              </label>

              <label className="flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-md border-2 border-emerald-200 border-dashed hover:border-emerald-500 hover:bg-emerald-50/30 transition-all rounded-3xl p-8 cursor-pointer shadow-sm group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input type="file" multiple className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, 'D')} />
                <div className="w-16 h-16 bg-emerald-100/50 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10"><Wallet className="w-8 h-8" /></div>
                <div className="text-center relative z-10">
                  <p className="text-lg font-extrabold text-emerald-950 mb-1">Ανέβασμα Χρηματοοικονομικών</p>
                  <p className="text-xs text-slate-500 font-medium px-4">"Λογαριασμοί / Επενδύσεις" / financialassetXLS</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">ΕΠΙΛΟΓΗ ΑΡΧΕΙΟΥ <FileUp className="w-3 h-3"/></div>
                </div>
              </label>
              
              {discrepancies.length > 0 ? (
                 <button onClick={() => setActiveStatModal('ORPHANS')} className="text-left bg-gradient-to-br from-rose-500 to-rose-600 text-white p-8 rounded-3xl shadow-lg shadow-rose-500/20 flex flex-col justify-between border border-rose-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative group overflow-hidden">
                   <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                   <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider text-rose-200 group-hover:text-white transition-colors flex items-center gap-1"><Info className="w-3 h-3"/> {t.clickForDetails}</span>
                   <div className="relative z-10">
                     <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm"><Unlink className="w-5 h-5 text-white" /></div>
                     <h3 className="font-extrabold text-xl mb-1">{t.orphanEncumbrances}</h3>
                     <p className="text-sm text-rose-100 font-medium line-clamp-2">{t.orphanDesc}</p>
                   </div>
                   <div className="flex justify-between items-end mt-6 w-full relative z-10">
                     <span className="text-6xl font-black tracking-tighter">{discrepancies.length}</span>
                   </div>
                 </button>
              ) : (
                 <div className="bg-slate-50/80 backdrop-blur-md border border-slate-200/60 p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-slate-300" /></div>
                    <p className="text-sm font-bold text-center">{t.noOrphans}</p>
                 </div>
              )}
            </section>

            {(results || []).length > 0 && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <button onClick={() => setActiveStatModal('LIQUIDATION')} className="text-left w-full bg-gradient-to-br from-blue-900 to-blue-950 p-8 rounded-3xl shadow-xl shadow-blue-900/10 flex justify-between items-center group hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden border border-blue-800">
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-blue-300 mb-2 uppercase tracking-wider flex items-center gap-2">{t.totalLiq}</p>
                    <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">€{stats.totalLiquidation.toLocaleString()}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-300 shadow-inner group-hover:scale-110 group-hover:bg-white/20 transition-all relative z-10"><Landmark className="w-8 h-8" /></div>
                </button>
                <button onClick={() => setActiveStatModal('UNIQUE_ASSETS')} className="text-left w-full bg-white/90 backdrop-blur-md border border-teal-200 p-8 rounded-3xl shadow-lg shadow-teal-100/50 flex justify-between items-center group hover:-translate-y-1 hover:border-teal-300 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-100/50 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">{t.uniqueAssets}</p>
                    <p className="text-4xl sm:text-5xl font-black text-teal-600 tracking-tight">{stats.uniqueAssets}</p>
                  </div>
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner group-hover:scale-110 group-hover:bg-teal-100 transition-all relative z-10"><Building className="w-8 h-8" /></div>
                </button>
              </motion.section>
            )}

            {spouseAlerts.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-6">
                <h4 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" /> Προειδοποιήσεις Μελών
                </h4>
                <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
                  {spouseAlerts.map((alert, idx) => (
                    <li key={idx}>{alert}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {(listA || []).length === 0 && (listB || []).length === 0 && (listC || []).length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
                  <div className="w-24 h-24 bg-white border border-blue-100 rounded-3xl shadow-xl flex items-center justify-center relative z-10 transform -rotate-6">
                    <FileSpreadsheet className="w-10 h-10 text-blue-400" />
                  </div>
                  <div className="w-24 h-24 bg-white border border-teal-100 rounded-3xl shadow-xl flex items-center justify-center absolute top-2 left-4 z-0 transform rotate-6 opacity-70">
                    <FileSpreadsheet className="w-10 h-10 text-teal-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-blue-950 mb-3">Ο Φάκελος είναι Άδειος</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Ανεβάστε τα αρχεία Excel του οφειλέτη (Ε9 και Βάρη) στα παραπάνω πεδία για να ξεκινήσει η αυτόματη μοναδικοποίηση.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedByAFM.map((group, groupIdx) => (
                  (group.properties.length > 0 || group.otherAssetsGroups.length > 0 || group.financialAssetsGroups.length > 0 || group.encumbrances.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIdx * 0.05 }} key={groupIdx} className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/20 overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-5 flex justify-between items-center border-b border-slate-100 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shadow-inner"><Building className="w-5 h-5" /></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Στοιχεια Μελους / ΑΦΜ</span>
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none flex items-center gap-3">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm shadow-sm">
                                {group.memberType ? group.memberType.toUpperCase() : 'ΜΕΛΟΣ'}
                              </span>
                              <span className="text-slate-600 font-mono tracking-wider">{group.afm}</span>
                            </h2>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-teal-700 text-sm bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                          <CheckCircle2 className="w-4 h-4" /> {t.resultSingularized}
                        </div>
                      </div>
                      <div className="overflow-x-auto p-0 sm:p-8">
                        <table className="w-full text-left text-sm min-w-[700px] border-collapse">
                          {group.properties.length > 0 && (
                            <>
                              <thead>
                                <tr>
                                  <th className="px-6 sm:px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-24">{t.matchId}</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΔΙΕΥΘΥΝΣΗ / ΠΕΡΙΟΧΗ</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-24 text-center">ΠΟΣΟΣΤΟ</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-32">ΑΞΙΑ ΑΚΙΝΗΤΟΥ</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-32">ΑΦΜ / ΤΥΠΟΣ</th>
                                  <th className="pr-6 sm:pr-4 px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-32">{t.status}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {group.properties.map((prop, idx) => {
                                  const propEncumbrances = group.encumbrances.filter(e => e.globalCode === prop.globalCode);
                                  return (
                                  <React.Fragment key={`prop-${idx}`}>
                                    <tr className="hover:bg-slate-50/80 transition-colors group">
                                      <td className="px-6 sm:px-4 py-5 font-semibold text-slate-700">
                                        <span className="inline-flex w-10 h-10 rounded-xl bg-[#0a1d37] text-white items-center justify-center font-black text-sm shadow-md shadow-blue-900/20 group-hover:scale-110 transition-transform">{prop.globalCode === 0 ? '-' : prop.globalCode}</span>
                                        <span className="block text-gray-500 text-[10px] mt-2">(Κωδ. Τράπεζας: {prop.bankCode || '-'})</span>
                                      </td>
                                      <td className="px-4 py-5 font-medium text-slate-800">
                                        {prop.description} 
                                        {prop.region && <span className="block text-slate-400 text-xs mt-1 font-normal">{prop.region}</span>}
                                        <div className="mt-2">
                                          {prop.isThirdParty ? (
                                            prop.knownOwnership === 0 ? (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">100% Ακίνητο Τρίτου / Εγγυητή</span>
                                            ) : (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">Υπόλοιπο από: 100% - {prop.knownOwnership}%</span>
                                            )
                                          ) : prop.sharedWith && prop.sharedWith.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 w-fit">ΚΟΙΝΟ ΜΕ ΑΦΜ: {prop.sharedWith.join(', ')}</span>
                                              {prop.totalGroupOwnership && prop.totalGroupOwnership < 99.9 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 w-fit">Συνιδιοκτησία με ΤΡΙΤΟ</span>
                                              )}
                                            </div>
                                          ) : prop.ownershipPercentage < 100 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">Συνιδιοκτησία με ΤΡΙΤΟ</span>
                                          ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 border border-teal-200">Αποκλειστική Κυριότητα</span>
                                          )}
                                        </div>
                                        {prop.alerts && prop.alerts.length > 0 && (
                                          <div className="mt-3 space-y-2">
                                            {prop.alerts.map((alert: any, aidx: number) => (
                                              <div key={aidx} className={`p-2.5 rounded-lg text-[11px] font-bold flex items-start gap-2 ${
                                                alert.type === 'ERROR' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                alert.type === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                'bg-blue-50 text-blue-700 border border-blue-200'
                                              }`}>
                                                {alert.type === 'ERROR' ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <Info className="w-3.5 h-3.5 shrink-0" />}
                                                <span className="leading-tight">{alert.message}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-4 py-5 font-bold text-slate-600 text-center">{prop.ownershipPercentage}%</td>
                                      <td className="px-4 py-5 font-bold text-slate-700">€{prop.objectiveValue.toLocaleString()}</td>
                                      <td className="px-4 py-5 font-bold text-blue-700">
                                        <div className="flex flex-col">
                                          <span className="text-sm">{prop.afm || prop.ownerName}</span>
                                          <span className="text-[10px] text-slate-400 font-normal">{prop.memberType || '-'}</span>
                                        </div>
                                      </td>
                                      <td className="pr-6 sm:pr-4 px-4 py-5 font-bold text-teal-600 flex items-center gap-1.5 h-full mt-2">
                                        <div className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center"><Check className="w-3 h-3 stroke-[3]" /></div> 
                                        <span className="text-xs uppercase tracking-wider">{t.resultSingularized}</span>
                                      </td>
                                    </tr>
                                    {propEncumbrances.length > 0 && (
                                      <tr>
                                        <td colSpan={6} className="p-0">
                                          <div className="bg-slate-50 border-l-4 border-blue-400 p-4 pl-6 sm:pl-20 shadow-inner">
                                            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Lock className="w-4 h-4" /> ΒΑΡΗ ΑΚΙΝΗΤΟΥ</h4>
                                            <div className="space-y-3">
                                              {propEncumbrances.map((enc, eIdx) => {
                                                const rawCollaterals = group.collaterals?.filter(c => c.assetCode === enc.assetCode) || [];
                                                const uniqueCollaterals = new Map<string, Collateral>();
                                                rawCollaterals.forEach(c => {
                                                  const key = `${c.creditor}-${c.amount}-${c.order}`;
                                                  if (!uniqueCollaterals.has(key)) uniqueCollaterals.set(key, c);
                                                });
                                                const encCollaterals = Array.from(uniqueCollaterals.values()).sort((a, b) => a.order - b.order);
                                                
                                                return (
                                                  <div key={eIdx} className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                                                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                      <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                          <span className="font-bold text-slate-800">{enc.address || (enc as any).assetCategory || 'ΧΩΡΙΣ ΔΙΕΥΘΥΝΣΗ'}</span>
                                                          {enc.isFuzzyMatch && (
                                                            <span className="inline-flex items-center text-amber-500 hover:text-amber-600 cursor-help" title={enc.matchReason}>
                                                              <AlertTriangle className="w-4 h-4" />
                                                            </span>
                                                          )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{enc.creditor}</span>
                                                          {enc.ownerName && enc.ownerName !== 'ΑΓΝΩΣΤΟ_ΑΦΜ' && (
                                                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">ΑΦΜ Οφειλέτη: {enc.ownerName}</span>
                                                          )}
                                                          {enc.isThirdParty && (
                                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">ΤΡΙΤΟΥ</span>
                                                          )}
                                                        </div>
                                                        {enc.type && enc.type !== 'N/A' && enc.type !== 'ΜΗ ΔΙΑΘΕΣΙΜΟ' && (
                                                          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                                            <span className="font-bold text-slate-700">Βάρη:</span> {enc.type}
                                                          </div>
                                                        )}
                                                        {enc.alerts && enc.alerts.length > 0 && (
                                                          <div className="mt-3 space-y-2">
                                                            {enc.alerts.map((alert: any, aidx: number) => (
                                                              <div key={aidx} className={`p-2.5 rounded-lg text-[11px] font-bold flex items-start gap-2 ${
                                                                alert.type === 'ERROR' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                                alert.type === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                                'bg-blue-50 text-blue-700 border border-blue-200'
                                                              }`}>
                                                                {alert.type === 'ERROR' ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <Info className="w-3.5 h-3.5 shrink-0" />}
                                                                <span className="leading-tight">{alert.message}</span>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                                                        <span className="text-lg font-black text-blue-900">€{enc.amount.toLocaleString()}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md"><Lock className="w-3 h-3" /> {t.claimType}</span>
                                                      </div>
                                                    </div>
                                                    {encCollaterals.length > 0 && (
                                                      <div className="bg-slate-50 border-t border-slate-100 p-3 sm:px-4">
                                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">ΣΕΙΡΑ ΠΡΟΣΗΜΕΙΩΣΕΩΝ (ΑΠΟ COLLATERALXLS)</h5>
                                                        <div className="space-y-1.5">
                                                          {encCollaterals.map((col, cIdx) => (
                                                            <div key={cIdx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-xs">
                                                              <div className="flex items-center gap-3">
                                                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px]">{col.order}</span>
                                                                <span className="font-bold text-slate-700">{col.creditor}</span>
                                                              </div>
                                                              <span className="font-bold text-slate-600">€{col.amount.toLocaleString()}</span>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </>
                          )}
                          {group.otherAssetsGroups && group.otherAssetsGroups.length > 0 && (
                            <>
                              <thead>
                                <tr>
                                  <th colSpan={5} className="px-6 sm:px-4 pt-10 pb-4 text-xs font-extrabold text-teal-900 uppercase tracking-wider border-b-2 border-teal-100 bg-teal-50/30">
                                    <div className="flex items-center gap-2"><Car className="w-4 h-4" /> ΛΟΙΠΑ ΠΕΡΙΟΥΣΙΑΚΑ ΣΤΟΙΧΕΙΑ (ΚΙΝΗΤΑ, ΚΑΤΑΘΕΣΕΙΣ Κ.ΛΠ.)</div>
                                  </th>
                                </tr>
                                <tr>
                                  <th className="px-6 sm:px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-24">MATCH ID</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΠΕΡΙΓΡΑΦΗ / ΚΑΤΗΓΟΡΙΑ</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΠΕΡΙΓΡΑΦΗ ΒΑΡΟΥΣ</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΠΙΣΤΩΤΗΣ / ΔΙΑΧΕΙΡΙΣΤΗΣ</th>
                                  <th className="pr-6 sm:pr-4 px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-40 text-right">ΑΞΙΑ / ΠΟΣΟ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {group.otherAssetsGroups.map((asset, idx) => {
                                  const assetEncumbrances = group.encumbrances.filter(e => e.globalCode === asset.globalCode);
                                  return (
                                    <React.Fragment key={`other-${idx}`}>
                                      {assetEncumbrances.map((enc: any, eIdx: number) => (
                                        <tr key={`${idx}-${eIdx}`} className="hover:bg-teal-50/30 transition-colors group">
                                          {eIdx === 0 && (
                                            <>
                                              <td className="px-6 sm:px-4 py-5 font-semibold text-slate-700" rowSpan={assetEncumbrances.length}>
                                                <span className="inline-flex w-10 h-10 rounded-xl bg-[#0a1d37] text-white items-center justify-center font-black text-sm shadow-md shadow-blue-900/20 group-hover:scale-110 transition-transform">{asset.globalCode}</span>
                                              </td>
                                              <td className="px-4 py-5 font-medium text-slate-800" rowSpan={assetEncumbrances.length}>
                                                {asset.asset?.description || asset.description}
                                                <div className="mt-2">
                                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 border border-teal-200">Λοιπό Περιουσιακό Στοιχείο</span>
                                                </div>
                                              </td>
                                            </>
                                          )}
                                          <td className="px-4 py-5 text-slate-600 font-medium">
                                            {enc.assetCategory || '-'}
                                          </td>
                                          <td className="px-4 py-5 font-bold text-slate-600">
                                            {enc.aggregatedCreditors || enc.creditor}
                                          </td>
                                          <td className="pr-6 sm:pr-4 px-4 py-5 font-black text-blue-900 text-right">
                                            €{enc.amount.toLocaleString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </>
                          )}

                          {group.financialAssetsGroups && group.financialAssetsGroups.length > 0 && (
                            <>
                              <thead>
                                <tr>
                                  <th colSpan={5} className="px-6 sm:px-4 pt-10 pb-4 text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b-2 border-indigo-100 bg-indigo-50/30">
                                    <div className="flex items-center gap-2"><Wallet className="w-4 h-4" /> ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΑ ΠΡΟΪΟΝΤΑ</div>
                                  </th>
                                </tr>
                                <tr>
                                  <th className="px-6 sm:px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-24">MATCH ID</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΠΕΡΙΓΡΑΦΗ / ΚΑΤΗΓΟΡΙΑ</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΠΕΡΙΓΡΑΦΗ ΒΑΡΟΥΣ</th>
                                  <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΠΙΣΤΩΤΗΣ / ΔΙΑΧΕΙΡΙΣΤΗΣ</th>
                                  <th className="pr-6 sm:pr-4 px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 w-40 text-right">ΑΞΙΑ / ΠΟΣΟ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {group.financialAssetsGroups.map((asset, idx) => {
                                  const assetEncumbrances = group.encumbrances.filter(e => e.globalCode === asset.globalCode);
                                  return (
                                    <React.Fragment key={`fin-${idx}`}>
                                      {assetEncumbrances.map((enc: any, eIdx: number) => (
                                        <tr key={`${idx}-${eIdx}`} className="hover:bg-indigo-50/30 transition-colors group">
                                          {eIdx === 0 && (
                                            <>
                                              <td className="px-6 sm:px-4 py-5 font-semibold text-slate-700" rowSpan={assetEncumbrances.length}>
                                                <span className="inline-flex w-10 h-10 rounded-xl bg-[#0a1d37] text-white items-center justify-center font-black text-sm shadow-md shadow-blue-900/20 group-hover:scale-110 transition-transform">{asset.globalCode}</span>
                                              </td>
                                              <td className="px-4 py-5 font-medium text-slate-800" rowSpan={assetEncumbrances.length}>
                                                {asset.asset?.description || asset.description}
                                                <div className="mt-2">
                                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">Χρηματοοικονομικό Προϊόν</span>
                                                </div>
                                              </td>
                                            </>
                                          )}
                                          <td className="px-4 py-5 text-slate-600 font-medium">
                                            {enc.assetCategory || '-'}
                                          </td>
                                          <td className="px-4 py-5 font-bold text-slate-600">
                                            {enc.aggregatedCreditors || enc.creditor}
                                          </td>
                                          <td className="pr-6 sm:pr-4 px-4 py-5 font-black text-blue-900 text-right">
                                            €{enc.amount.toLocaleString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </>
                          )}
                        </table>
                      </div>
                    </motion.div>
                  )
                ))}
              </div>
            )}

            {discrepancies.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/90 backdrop-blur-xl rounded-3xl border border-rose-200/60 shadow-lg shadow-rose-200/20 overflow-hidden mt-8">
                <div className="bg-gradient-to-r from-rose-50 to-white px-8 py-5 flex justify-between items-center border-b border-rose-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center shadow-inner"><Unlink className="w-5 h-5" /></div>
                    <div className="flex flex-col">
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none flex items-center gap-3">
                        ΟΡΦΑΝΑ - ΒΑΡΗ
                      </h2>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Βαρη που δεν ταυτιστηκαν με ακινητα</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-rose-700 text-sm bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                    <AlertTriangle className="w-4 h-4" /> {discrepancies.length} Βάρη (Σύνολο: {listB?.length || 0})
                  </div>
                </div>
                <div className="overflow-x-auto p-0 sm:p-8">
                  <table className="w-full text-left text-sm min-w-[700px] border-collapse">
                    <thead>
                      <tr>
                        <th className="px-6 sm:px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΔΙΕΥΘΥΝΣΗ / ΠΕΡΙΟΧΗ</th>
                        <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΠΙΣΤΩΤΗΣ</th>
                        <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΑΦΜ ΟΦΕΙΛΕΤΗ</th>
                        <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΠΟΣΟ</th>
                        <th className="px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">ΑΙΤΙΟΛΟΓΙΑ</th>
                        <th className="pr-6 sm:pr-4 px-4 pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 text-right">ΕΝΕΡΓΕΙΑ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {discrepancies.map((enc, idx) => (
                        <tr key={`orphan-${idx}`} className="hover:bg-rose-50/30 transition-colors">
                          <td className="px-6 sm:px-4 py-5 font-medium text-slate-800">
                            {enc.address || (enc as any).assetCategory || 'ΧΩΡΙΣ ΔΙΕΥΘΥΝΣΗ'}
                            {enc.type && enc.type !== 'N/A' && enc.type !== 'ΜΗ ΔΙΑΘΕΣΙΜΟ' && (
                              <div className="mt-1 text-xs text-slate-500 font-normal">
                                <span className="font-semibold text-slate-600">Βάρη:</span> {enc.type}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-5 font-bold text-slate-600">{enc.creditor}</td>
                          <td className="px-4 py-5 font-mono text-slate-600">{enc.ownerName || '-'}</td>
                          <td className="px-4 py-5 font-bold text-rose-700">€{enc.amount?.toLocaleString() || '0'}</td>
                          <td className="px-4 py-5 text-xs text-slate-500">{enc.matchReason || 'Δεν βρέθηκε ταύτιση'}</td>
                          <td className="pr-6 sm:pr-4 px-4 py-5 text-right">
                            <button 
                              onClick={() => setEncToMatch(enc)}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1"
                            >
                              <Link2 className="w-3 h-3" /> Ταύτιση
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            <div className="mt-12 text-center relative z-10 flex flex-col items-center justify-center gap-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ΣΧΕΔΙΑΣΗ & ΑΝΑΠΤΥΞΗ: THE BIZBOOST BY G. DIONYSIOU</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024-2026 - THE BIZBOOST BY G. DIONYSIOU</p>
            </div>
          </main>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/40 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-3xl shadow-2xl border border-blue-100 flex flex-col items-center gap-6 max-w-sm text-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <Wand2 className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-blue-950 text-lg">Επεξεργασία Αρχείων</h3>
                    <p className="text-slate-600 font-bold leading-relaxed">
                      Παρακαλώ περιμένετε.<br />
                      Γίνεται μοναδικοποίηση περιουσιακών στοιχείων
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Manual Match Modal */}
            {encToMatch && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm" onClick={() => setEncToMatch(null)} />
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden border border-blue-200 flex flex-col max-h-[85vh]">
                  <div className="flex justify-between items-center p-6 border-b border-blue-100 bg-blue-50/50">
                    <h3 className="font-bold text-xl text-blue-950 flex items-center gap-2">
                      <Link2 className="text-teal-600 w-6 h-6"/>
                      Χειροκίνητη Ταύτιση Βάρους
                    </h3>
                    <button onClick={() => setEncToMatch(null)} className="text-slate-400 hover:text-blue-900 p-1"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">ΣΤΟΙΧΕΙΑ ΒΑΡΟΥΣ ΠΡΟΣ ΤΑΥΤΙΣΗ</p>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{encToMatch.address || encToMatch.assetCategory || 'ΧΩΡΙΣ ΔΙΕΥΘΥΝΣΗ'}</div>
                        <div className="text-sm text-slate-500 mt-1">ΑΦΜ: {encToMatch.ownerName} | Πιστωτής: {encToMatch.creditor}</div>
                      </div>
                      <div className="text-xl font-black text-rose-700">€{encToMatch.amount?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">ΕΠΙΛΕΞΤΕ ΑΚΙΝΗΤΟ (Ε9)</p>
                    <div className="space-y-3">
                      {Array.from(new Map((results || []).filter(r => r.globalCode !== 0).map(r => [r.globalCode, r])).values()).map(r => (
                        <div 
                          key={r.globalCode} 
                          onClick={() => {
                            setManualMatches(prev => ({ ...prev, [encToMatch.id]: r.globalCode }));
                            setEncToMatch(null);
                          }}
                          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md cursor-pointer transition-all flex justify-between items-center group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                              {r.globalCode}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{r.asset.description}</div>
                              <div className="text-xs text-slate-500 mt-1">ΑΦΜ: {r.asset.afm || r.asset.ownerName} | Περιοχή: {r.asset.region}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-teal-700">€{r.asset.objectiveValue?.toLocaleString()}</div>
                            <div className="text-xs text-slate-400 mt-1">Αξία</div>
                          </div>
                        </div>
                      ))}
                      {(results || []).filter(r => r.globalCode !== 0).length === 0 && (
                        <div className="text-center py-8 text-slate-500">Δεν βρέθηκαν ακίνητα για ταύτιση.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modals for Stats */}
            {activeStatModal !== 'NONE' && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setActiveStatModal('NONE')} />
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
                  <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      {activeStatModal === 'ORPHANS' && <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><Unlink className="w-5 h-5" /></div>}
                      {activeStatModal === 'LIQUIDATION' && <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center"><Landmark className="w-5 h-5" /></div>}
                      {activeStatModal === 'UNIQUE_ASSETS' && <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center"><Building className="w-5 h-5" /></div>}
                      <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">
                        {activeStatModal === 'ORPHANS' && t.orphanEncumbrances}
                        {activeStatModal === 'LIQUIDATION' && t.totalLiq}
                        {activeStatModal === 'UNIQUE_ASSETS' && t.uniqueAssets}
                      </h3>
                    </div>
                    <button onClick={() => setActiveStatModal('NONE')} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-500"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    {activeStatModal === 'ORPHANS' && (
                      <div className="space-y-4">
                        <p className="text-slate-600 font-medium mb-4">Τα παρακάτω βάρη δεν ταυτίστηκαν με κάποιο ακίνητο από το Ε9 του οφειλέτη.</p>
                        {discrepancies.length > 0 ? (
                          <div className="space-y-3">
                            {discrepancies.map((d, i) => (
                              <div key={i} className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                  <span className="font-bold text-rose-900">{d.address || 'Χωρίς Διεύθυνση'}</span>
                                  <span className="font-black text-rose-700">€{d.amount?.toLocaleString() || '0'}</span>
                                </div>
                                {d.type && d.type !== 'N/A' && d.type !== 'ΜΗ ΔΙΑΘΕΣΙΜΟ' && (
                                  <div className="text-xs text-rose-800 bg-rose-100/50 p-1.5 rounded border border-rose-100">
                                    <span className="font-semibold">Βάρη:</span> {d.type}
                                  </div>
                                )}
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-1 rounded-md">{d.creditor || '-'}</span>
                                  <span className="text-xs text-rose-500">ΑΦΜ: {d.ownerName || '-'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-slate-500 py-8">Δεν υπάρχουν ορφανά βάρη.</p>
                        )}
                      </div>
                    )}
                    {activeStatModal === 'LIQUIDATION' && (
                      <div className="space-y-6">
                        <div className="text-center py-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Landmark className="w-8 h-8 text-blue-600" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-800 mb-1">Συνολική Αξία Ρευστοποίησης</h4>
                          <p className="text-4xl font-black text-blue-600 tracking-tight">€{stats.totalLiquidation.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-slate-700 mb-3 px-2">Ανάλυση ανά Ακίνητο</h5>
                          <div className="space-y-2">
                            {Array.from(new Map(results.filter(r => r.liquidationValue > 0 && r.globalCode !== 0).map(r => [r.globalCode, r])).values()).map((r, i) => (
                              <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center hover:border-blue-300 transition-colors">
                                <div className="flex-1 pr-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex w-6 h-6 rounded-md bg-[#0a1d37] text-white items-center justify-center font-bold text-[10px]">{r.globalCode === 0 ? '-' : r.globalCode}</span>
                                    <span className="font-bold text-slate-800 text-sm line-clamp-1">{r.asset.description || 'Άγνωστο Ακίνητο'}</span>
                                  </div>
                                  {r.bankCode && <div className="text-[10px] text-indigo-600 font-bold mb-1">(Κωδ. Τράπεζας: {r.bankCode})</div>}
                                  <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span>{r.asset.region || '-'}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-blue-700">€{r.liquidationValue.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                            {Array.from(new Map((results || []).filter(r => r.liquidationValue > 0 && r.globalCode !== 0).map(r => [r.globalCode, r])).values()).length === 0 && (
                              <p className="text-center text-slate-500 py-4">Δεν υπάρχουν ακίνητα με αξία ρευστοποίησης.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeStatModal === 'UNIQUE_ASSETS' && (
                      <div className="space-y-6">
                        <div className="text-center py-6 bg-teal-50/50 rounded-3xl border border-teal-100">
                          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building className="w-8 h-8 text-teal-600" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-800 mb-1">Μοναδικά Ακίνητα</h4>
                          <p className="text-4xl font-black text-teal-600 tracking-tight">{stats.uniqueAssets}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-slate-700 mb-3 px-2">Λίστα Ακινήτων</h5>
                          <div className="space-y-2">
                            {Array.from(new Map((results || []).filter(r => r.originalAssets && r.originalAssets.length > 0 && r.globalCode !== 0).map(r => [r.globalCode, r])).values()).map((r, i) => (
                              <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center hover:border-teal-300 transition-colors">
                                <div className="flex-1 pr-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex w-6 h-6 rounded-md bg-[#0a1d37] text-white items-center justify-center font-bold text-[10px]">{r.globalCode === 0 ? '-' : r.globalCode}</span>
                                    <span className="font-bold text-slate-800 text-sm line-clamp-1">{r.asset.description || 'Άγνωστο Ακίνητο'}</span>
                                  </div>
                                  {r.bankCode && <div className="text-[10px] text-indigo-600 font-bold mb-1">(Κωδ. Τράπεζας: {r.bankCode})</div>}
                                  <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span>{r.asset.region || '-'}</span>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                  <span className="font-bold text-slate-700">€{r.totalAssetValue?.toLocaleString() || '0'}</span>
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">Συνολική Αξία</span>
                                </div>
                              </div>
                            ))}
                            {Array.from(new Map((results || []).filter(r => r.originalAssets && r.originalAssets.length > 0 && r.globalCode !== 0).map(r => [r.globalCode, r])).values()).length === 0 && (
                              <p className="text-center text-slate-500 py-4">Δεν βρέθηκαν ακίνητα.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button onClick={() => setActiveStatModal('NONE')} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md transition-colors">Κλείσιμο</button>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </>
  );
}
