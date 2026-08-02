import React, { useState, useEffect } from "react";
import {
  Eye, EyeOff, LayoutDashboard, Camera, ClipboardList, BarChart2,
  Bell, LogOut, CheckCircle, Download, Leaf, Activity, TrendingUp,
  Calendar, MapPin, Thermometer, Droplets, AlertTriangle, ChevronDown,
  FileText, RefreshCw, Map, Check, Navigation, Zap, ScanLine, TreePine,
  Users, UserPlus, Trash2, FileDown, Lock,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen = "login" | "dashboard" | "analysis" | "labor" | "lot" | "gps" | "reports" | "alerts" | "personal";
type Role = "Administrador" | "Supervisor" | "Operario";
interface Account { username: string; password: string; role: Role; name: string; }
interface PersonnelItem {
  id: number;
  name: string;
  cargo: string;
  lot: string;
  phone: string;
  dateAdded: string;
}
interface LaborRecord {
  id: number;
  date: string;
  lot: string;
  laborType: string;
  responsible: string;
  verified: boolean;
  gpsCount: number;
}
interface AlertItem {
  id: number;
  type: "Crítica" | "Advertencia" | "Info";
  status: "Abierta" | "En proceso" | "Atendida";
  lot: string;
  title: string;
  date: string;
  description: string;
  action: string;
}

// ── Constants & Mock Data ─────────────────────────────────────────────────────
const LOTS = ["Lote 1", "Lote 2", "Lote 3", "Lote 4", "Lote 5", "Lote 6"];
const ANALYSIS_TYPES = ["Hoja", "Racimo", "Planta completa", "Suelo"];
const LABOR_TYPES = ["Chapia", "Corona", "Control químico de malezas", "Eliminación de flores andróginas", "Sanidad vegetal", "Abastecimiento"];
// NOTA: nombres provisionales (placeholders), pendientes de reemplazar por el personal real de la finca.
const WORKERS = ["Trabajador 1", "Trabajador 2", "Trabajador 3", "Trabajador 4", "Trabajador 5"];

// ── Cuentas de acceso ──────────────────────────────────────────────────────
// Cuenta Administrador: única con permiso para añadir/gestionar personal y cuentas.
// Cuentas Supervisor y Operario: SIN acceso a esos módulos.
// El Administrador puede cambiar contraseñas o crear cuentas nuevas desde la app;
// esos cambios se guardan en este navegador (localStorage) mientras no hay backend.
const DEFAULT_ACCOUNTS: Account[] = [
  { username: "admin", password: "admin123", role: "Administrador", name: "Admin. González" },
  { username: "supervisor", password: "super123", role: "Supervisor", name: "Sup. Rueda" },
  { username: "operario", password: "oper123", role: "Operario", name: "Op. Mendoza" },
];

const ACCOUNTS_STORAGE_KEY = "simpa_cuentas_v1";
const PERSONNEL_STORAGE_KEY = "simpa_personal_v1";
const ALERTS_STORAGE_KEY = "simpa_alertas_v1";
const LABOR_STORAGE_KEY = "simpa_labores_v1";

const INITIAL_PERSONNEL: PersonnelItem[] = [
  { id: 1, name: "Trabajador 1", cargo: "Operario de campo", lot: "Lote 1", phone: "3001234567", dateAdded: "10 Ene 2026" },
  { id: 2, name: "Trabajador 2", cargo: "Supervisora", lot: "Lote 2", phone: "3007654321", dateAdded: "12 Ene 2026" },
  { id: 3, name: "Trabajador 3", cargo: "Operario de campo", lot: "Lote 3", phone: "3009876543", dateAdded: "15 Ene 2026" },
];

const INITIAL_ALERTS: AlertItem[] = [
  { id: 1, type: "Crítica", status: "Abierta", lot: "Lote 2", title: "Pudrición del cogollo detectada", date: "29 Jun 2026", description: "IA detectó síntomas tempranos de Phytophthora palmivora en 3 palmas del sector norte.", action: "Aplicar fungicida cúprico inmediatamente y aislar plantas afectadas. Notificar al agrónomo jefe." },
  { id: 2, type: "Advertencia", status: "En proceso", lot: "Lote 1", title: "Déficit hídrico detectado", date: "28 Jun 2026", description: "Sensores de suelo reportan humedad por debajo del 35% en zona sur del lote.", action: "Activar riego de emergencia y revisar el sistema de drenaje en las próximas 4 horas." },
  { id: 3, type: "Advertencia", status: "Abierta", lot: "Lote 3", title: "Baja tasa de polinización", date: "27 Jun 2026", description: "El conteo GPS registra 68% de eficiencia, por debajo del umbral mínimo del 80%.", action: "Reforzar equipo de polinización con 2 operarios adicionales durante las próximas 48 horas." },
  { id: 4, type: "Info", status: "Atendida", lot: "Lote 4", title: "Análisis foliar programado", date: "26 Jun 2026", description: "Periodo de análisis foliar Q2 para revisión de nutrición de Nitrógeno y Potasio.", action: "Tomar muestras en las primeras horas de la mañana antes de las 9am." },
  { id: 5, type: "Crítica", status: "Abierta", lot: "Lote 5", title: "Presencia de Rhynchophorus palmarum", date: "25 Jun 2026", description: "Trampas de feromona registran capturas superiores al umbral de acción económica.", action: "Instalar trampas adicionales y revisar palmas con síntomas de anillo rojo." },
];

const PRODUCTION_DATA = [
  { mes: "Ene", produccion: 42, meta: 45 },
  { mes: "Feb", produccion: 38, meta: 45 },
  { mes: "Mar", produccion: 51, meta: 50 },
  { mes: "Abr", produccion: 47, meta: 50 },
  { mes: "May", produccion: 55, meta: 52 },
  { mes: "Jun", produccion: 49, meta: 52 },
];

const LABOR_REPORT = [
  { semana: "S1", polinizacion: 320, cosecha: 85, mantenimiento: 40 },
  { semana: "S2", polinizacion: 298, cosecha: 92, mantenimiento: 55 },
  { semana: "S3", polinizacion: 341, cosecha: 78, mantenimiento: 38 },
  { semana: "S4", polinizacion: 315, cosecha: 95, mantenimiento: 62 },
];

const GPS_ROUTES = [
  { worker: "Trabajador 1", color: "#2D6A4F", count: 142, points: [[60,40],[80,55],[90,75],[85,95],[70,105],[50,110],[35,95],[30,75],[40,55],[55,45]] as number[][] },
  { worker: "Trabajador 2", color: "#E8A020", count: 118, points: [[110,30],[130,45],[140,65],[135,85],[120,95],[100,90],[90,75],[95,55],[105,40]] as number[][] },
  { worker: "Trabajador 3", color: "#3B82F6", count: 97, points: [[50,120],[65,130],[80,140],[95,135],[105,120],[100,105],[85,100],[70,105],[55,115]] as number[][] },
  { worker: "Trabajador 4", color: "#8B5CF6", count: 89, points: [[115,100],[130,110],[140,125],[135,140],[120,145],[105,140],[95,130],[100,115],[110,105]] as number[][] },
];

const LOT_HISTORY = [
  { date: "29 Jun", action: "Chapia", worker: "Trabajador 1", status: "Completado" },
  { date: "27 Jun", action: "Análisis IA - Hoja", worker: "Sistema IA", status: "Normal" },
  { date: "25 Jun", action: "Corona", worker: "Trabajador 3", status: "Completado" },
  { date: "22 Jun", action: "Sanidad vegetal", worker: "Trabajador 2", status: "Completado" },
  { date: "18 Jun", action: "Control químico de malezas", worker: "Trabajador 5", status: "Alerta" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const typeBadge = (type: string): string => {
  const map: Record<string, string> = {
    "Crítica": "bg-red-100 text-red-700",
    "Advertencia": "bg-amber-100 text-amber-700",
    "Info": "bg-blue-100 text-blue-700",
    "Abierta": "bg-red-100 text-red-700",
    "En proceso": "bg-amber-100 text-amber-700",
    "Atendida": "bg-green-100 text-green-700",
    "Completado": "bg-green-100 text-green-700",
    "Normal": "bg-blue-100 text-blue-700",
    "Alerta": "bg-red-100 text-red-700",
    "Alta": "bg-amber-100 text-amber-700",
    "Óptimo": "bg-green-100 text-green-700",
    "Saludable": "bg-green-100 text-green-700",
    "Bajo": "bg-blue-100 text-blue-700",
  };
  return map[type] ?? "bg-gray-100 text-gray-600";
};

const NAV_ITEMS: { id: Screen; label: string; icon: React.ElementType; roles?: Role[] }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analysis", label: "Análisis IA", icon: Camera },
  { id: "labor", label: "Labores", icon: ClipboardList },
  { id: "gps", label: "Mapa GPS", icon: Map },
  { id: "reports", label: "Reportes", icon: BarChart2 },
  { id: "alerts", label: "Alertas", icon: Bell },
  // Solo la cuenta Administrador ve este acceso — Supervisor y Operario no lo tienen
  { id: "personal", label: "Personal", icon: Users, roles: ["Administrador"] },
];

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role>("Administrador");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [selectedLot, setSelectedLot] = useState(LOTS[0]);
  const [analysisType, setAnalysisType] = useState(ANALYSIS_TYPES[0]);
  const [analysisResult, setAnalysisResult] = useState<null | { condition: string; confidence: number; severity: string; recommendation: string }>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [quality, setQuality] = useState(0);

  const [laborType, setLaborType] = useState(LABOR_TYPES[0]);
  const [responsible, setResponsible] = useState(WORKERS[0]);
  const [gpsCount, setGpsCount] = useState(0);
  const [gpsActive, setGpsActive] = useState(false);

  const [lotTab, setLotTab] = useState("labores");
  const [activeWorkers, setActiveWorkers] = useState<string[]>(GPS_ROUTES.map(r => r.worker));
  const [reportType, setReportType] = useState("Producción");
  const [reportPeriod, setReportPeriod] = useState("Junio 2026");
  const [alertList, setAlertList] = useState<AlertItem[]>(() => {
    try {
      const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch { return INITIAL_ALERTS; }
  });
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [alertFilter, setAlertFilter] = useState("Todas");

  useEffect(() => {
    try { localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alertList)); } catch {}
  }, [alertList]);

  const [userFullName, setUserFullName] = useState("");

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    } catch { return DEFAULT_ACCOUNTS; }
  });
  useEffect(() => {
    try { localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts)); } catch {}
  }, [accounts]);

  const changeAccountPassword = (username: string, newPassword: string) => {
    setAccounts(prev => prev.map(a => a.username === username ? { ...a, password: newPassword } : a));
  };

  const createAccount = (acc: Account): string | null => {
    if (accounts.some(a => a.username.toLowerCase() === acc.username.toLowerCase())) {
      return "Ese nombre de usuario ya existe.";
    }
    setAccounts(prev => [...prev, acc]);
    return null;
  };

  const deleteAccount = (username: string) => {
    setAccounts(prev => prev.filter(a => a.username !== username));
  };

  const [laborHistory, setLaborHistory] = useState<LaborRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LABOR_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(LABOR_STORAGE_KEY, JSON.stringify(laborHistory)); } catch {}
  }, [laborHistory]);

  const saveLaborRecord = (rec: Omit<LaborRecord, "id" | "date">) => {
    const record: LaborRecord = { ...rec, id: Date.now(), date: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short" }) };
    setLaborHistory(prev => [record, ...prev]);
    setGpsCount(0);
  };

  const [personnel, setPersonnel] = useState<PersonnelItem[]>(() => {
    try {
      const saved = localStorage.getItem(PERSONNEL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PERSONNEL;
    } catch {
      return INITIAL_PERSONNEL;
    }
  });

  // Persistencia temporal: mientras no hay backend, cada cambio se guarda
  // automáticamente en el navegador (localStorage) y puede respaldarse en .txt
  useEffect(() => {
    try { localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(personnel)); } catch {}
  }, [personnel]);

  const addPersonnel = (p: Omit<PersonnelItem, "id" | "dateAdded">) => {
    const newItem: PersonnelItem = {
      ...p,
      id: Date.now(),
      dateAdded: new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date()),
    };
    setPersonnel(prev => [newItem, ...prev]);
    downloadPersonnelTxt([newItem, ...personnel]);
  };

  const removePersonnel = (id: number) => setPersonnel(prev => prev.filter(p => p.id !== id));

  const editPersonnel = (id: number, updates: Partial<Omit<PersonnelItem, "id" | "dateAdded">>) => {
    setPersonnel(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const downloadPersonnelTxt = (list: PersonnelItem[]) => {
    const lines = [
      "SIMPA — Registro de Personal",
      `Generado: ${new Date().toLocaleString("es-CO")}`,
      "".padEnd(50, "="),
      ...list.map(p => `Nombre: ${p.name}\nCargo: ${p.cargo}\nLote asignado: ${p.lot}\nTeléfono: ${p.phone}\nFecha de registro: ${p.dateAdded}\n${"-".repeat(40)}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simpa_personal.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const navigate = (s: Screen) => {
    setScreen(s);
    if (s !== "analysis") { setAnalysisResult(null); setAnalyzing(false); setCameraActive(false); setQuality(0); }
    if (s !== "labor") setGpsActive(false);
    if (s !== "alerts") setSelectedAlert(null);
  };

  const handleLogin = () => {
    if (!username || !password) { setLoginError("Por favor complete todos los campos."); return; }
    const account = accounts.find(
      a => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password
    );
    if (!account) { setLoginError("Usuario o contraseña incorrectos."); return; }
    setRole(account.role);
    setUserFullName(account.name);
    setLoginError("");
    navigate("dashboard");
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult({ condition: "Deficiencia de Magnesio", confidence: 87, severity: "Moderada", recommendation: "Aplicar sulfato de magnesio foliar a 2 kg/200 L de agua. Repetir en 21 días y monitorear con nuevo análisis de imagen para confirmar recuperación." });
    }, 2500);
  };

  const handleCameraActivate = () => {
    setCameraActive(true);
    let q = 0;
    const interval = setInterval(() => {
      q = Math.min(q + 8 + Math.floor(Math.random() * 6), 92);
      setQuality(q);
      if (q >= 90) clearInterval(interval);
    }, 160);
  };

  useEffect(() => {
    if (!gpsActive) return;
    const interval = setInterval(() => {
      setGpsCount(prev => {
        if (prev >= 48) { setGpsActive(false); return prev; }
        return prev + 1;
      });
    }, 280);
    return () => clearInterval(interval);
  }, [gpsActive]);

  const markAlertAttended = (id: number) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, status: "Atendida" as const } : a));
    setSelectedAlert(prev => prev?.id === id ? { ...prev, status: "Atendida" as const } : prev);
  };

  const toggleWorker = (w: string) =>
    setActiveWorkers(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);

  const openAlerts = alertList.filter(a => a.status === "Abierta").length;

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0A1E10 0%, #1B4332 50%, #2D6A4F 100%)" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 border border-white/20" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
              <TreePine className="w-10 h-10 text-[#E8A020]" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">SIMPA</h1>
            <p className="text-white/55 text-sm mt-1.5 leading-relaxed">Sistema Inteligente de Mantenimiento<br />de Palma Africana</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-bold text-foreground mb-5 tracking-tight">Iniciar Sesión</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Usuario</label>
                <input type="text" value={username} onChange={e => { setUsername(e.target.value); setLoginError(""); }} placeholder="usuario@simpa.co" className="w-full bg-[#F0F4EE] border border-border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Contraseña</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setLoginError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" className="w-full bg-[#F0F4EE] border border-border rounded-xl px-3 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] placeholder:text-muted-foreground" />
                  <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {loginError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              )}
              <button onClick={handleLogin} className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl py-3.5 font-bold text-sm transition-all duration-200 shadow-sm hover:shadow-md mt-1">
                Ingresar al Sistema
              </button>
              <div className="text-center">
                <button className="text-sm text-[#2D6A4F] hover:text-[#1B4332] font-semibold transition-colors">¿Olvidó su contraseña?</button>
              </div>
            </div>
          </div>
          <div className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 mt-4">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Cuentas de prueba</p>
            <p className="text-xs text-white/70 leading-relaxed font-mono">admin / admin123 <span className="text-white/35">(Administrador)</span><br />supervisor / super123 <span className="text-white/35">(Supervisor)</span><br />operario / oper123 <span className="text-white/35">(Operario)</span></p>
          </div>
          <p className="text-center text-white/25 text-xs mt-5">SIMPA v2.4.1 · © 2026 AgroPalma S.A.S.</p>
        </div>
      </div>
    );
  }

  // ── APP SHELL ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0" style={{ background: "#0D2B1A" }}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#2D6A4F] rounded-xl flex items-center justify-center shrink-0">
              <TreePine className="w-5 h-5 text-[#E8A020]" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight">SIMPA</p>
              <p className="text-[10px] text-white/35 font-mono">v2.4.1</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 border-b border-white/10">
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-bold text-white leading-tight">
              {userFullName || (role === "Administrador" ? "Admin. González" : role === "Supervisor" ? "Sup. Rueda" : "Op. Mendoza")}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <p className="text-[10px] text-white/50">{role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(role)).map(item => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${active ? "bg-[#2D6A4F] text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/8"}`}>
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {item.id === "alerts" && openAlerts > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shrink-0">{openAlerts}</span>
                )}
              </button>
            );
          })}
          {/* Lot detail access */}
          <div className="pt-3 pb-1 px-3">
            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1">Acceso rápido</p>
          </div>
          <button onClick={() => navigate("lot")} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${screen === "lot" ? "bg-[#2D6A4F] text-white" : "text-white/50 hover:text-white hover:bg-white/8"}`}>
            <Leaf className="w-4 h-4 shrink-0" />
            Lote 1
          </button>
        </nav>

        <div className="p-2 border-t border-white/10">
          <button onClick={() => navigate("login")} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-all duration-150">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden px-4 py-3 flex items-center gap-3 border-b border-white/10" style={{ background: "#0D2B1A" }}>
          <div className="w-7 h-7 bg-[#2D6A4F] rounded-lg flex items-center justify-center">
            <TreePine className="w-4 h-4 text-[#E8A020]" />
          </div>
          <span className="font-bold text-sm text-white flex-1">SIMPA</span>
          <button onClick={() => navigate("alerts")} className="relative p-1">
            <Bell className="w-5 h-5 text-white/60" />
            {openAlerts > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">{openAlerts}</span>}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {screen === "dashboard" && <DashboardScreen role={role} navigate={navigate} alertList={alertList} laborHistory={laborHistory} />}
          {screen === "analysis" && <AnalysisScreen selectedLot={selectedLot} setSelectedLot={setSelectedLot} analysisType={analysisType} setAnalysisType={setAnalysisType} analysisResult={analysisResult} analyzing={analyzing} handleAnalyze={handleAnalyze} cameraActive={cameraActive} quality={quality} handleCameraActivate={handleCameraActivate} />}
          {screen === "labor" && <LaborScreen selectedLot={selectedLot} setSelectedLot={setSelectedLot} laborType={laborType} setLaborType={setLaborType} responsible={responsible} setResponsible={setResponsible} gpsCount={gpsCount} gpsActive={gpsActive} onGpsToggle={() => setGpsActive(v => !v)} saveLaborRecord={saveLaborRecord} />}
          {screen === "lot" && <LotDetailScreen lotTab={lotTab} setLotTab={setLotTab} laborHistory={laborHistory} />}
          {screen === "gps" && <GPSScreen activeWorkers={activeWorkers} toggleWorker={toggleWorker} />}
          {screen === "reports" && <ReportsScreen reportType={reportType} setReportType={setReportType} reportPeriod={reportPeriod} setReportPeriod={setReportPeriod} />}
          {screen === "alerts" && <AlertsScreen alertList={alertList} alertFilter={alertFilter} setAlertFilter={setAlertFilter} selectedAlert={selectedAlert} setSelectedAlert={setSelectedAlert} markAlertAttended={markAlertAttended} />}
          {screen === "personal" && (
            role === "Administrador"
              ? <PersonnelScreen personnel={personnel} addPersonnel={addPersonnel} removePersonnel={removePersonnel} editPersonnel={editPersonnel} downloadPersonnelTxt={() => downloadPersonnelTxt(personnel)}
                  accounts={accounts} currentUsername={username} changeAccountPassword={changeAccountPassword} createAccount={createAccount} deleteAccount={deleteAccount} />
              : <AccessDeniedScreen navigate={navigate} />
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden border-t border-white/10 px-1 py-1" style={{ background: "#0D2B1A" }}>
          <div className="flex items-center justify-around">
            {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(role)).map(item => {
              const Icon = item.icon;
              const active = screen === item.id;
              return (
                <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl relative transition-colors ${active ? "text-[#E8A020]" : "text-white/35"}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold">{item.label.split(" ")[0]}</span>
                  {item.id === "alerts" && openAlerts > 0 && (
                    <span className="absolute top-1.5 right-0.5 w-3 h-3 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">{openAlerts}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardScreen({ role, navigate, alertList, laborHistory }: { role: Role; navigate: (s: Screen) => void; alertList: AlertItem[]; laborHistory: LaborRecord[] }) {
  const today = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const todayShort = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  const openAlerts = alertList.filter(a => a.status === "Abierta").length;
  const laborsToday = 20 + laborHistory.filter(l => l.date === todayShort).length;

  const kpis = [
    { label: "Lotes Activos", value: "14", sub: "de 18 totales", icon: Leaf, iconColor: "text-green-600", iconBg: "bg-green-100" },
    { label: "Labores del Día", value: String(laborsToday), sub: "en 6 lotes", icon: ClipboardList, iconColor: "text-blue-600", iconBg: "bg-blue-100" },
    { label: "Alertas Abiertas", value: String(openAlerts), sub: "requieren atención", icon: AlertTriangle, iconColor: "text-red-600", iconBg: "bg-red-100" },
    { label: "Producción Est.", value: "49 T", sub: "este mes", icon: TrendingUp, iconColor: "text-amber-600", iconBg: "bg-amber-100" },
  ];

  const quickAccess =
    role === "Operario"
      ? [{ label: "Registrar Labor", s: "labor" as Screen, icon: ClipboardList }, { label: "Análisis IA", s: "analysis" as Screen, icon: Camera }, { label: "Ver Alertas", s: "alerts" as Screen, icon: Bell }]
      : role === "Supervisor"
      ? [{ label: "Registrar Labor", s: "labor" as Screen, icon: ClipboardList }, { label: "Mapa GPS", s: "gps" as Screen, icon: Map }, { label: "Análisis IA", s: "analysis" as Screen, icon: Camera }, { label: "Reportes", s: "reports" as Screen, icon: BarChart2 }]
      : [{ label: "Análisis IA", s: "analysis" as Screen, icon: Camera }, { label: "Registrar Labor", s: "labor" as Screen, icon: ClipboardList }, { label: "Mapa GPS", s: "gps" as Screen, icon: Map }, { label: "Reportes", s: "reports" as Screen, icon: BarChart2 }, { label: "Lote 1", s: "lot" as Screen, icon: Leaf }, { label: "Alertas", s: "alerts" as Screen, icon: Bell }];

  const recentAlerts = alertList.filter(a => a.status !== "Atendida").slice(0, 3);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Panel Principal</h1>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shrink-0">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-foreground">{role}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow">
              <div className={`w-9 h-9 ${kpi.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${kpi.iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-foreground font-mono leading-none">{kpi.value}</p>
              <p className="text-xs font-bold text-foreground mt-1.5">{kpi.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Recent alerts */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-foreground">Alertas Recientes</h3>
            <button onClick={() => navigate("alerts")} className="text-xs font-semibold text-[#2D6A4F] hover:text-[#1B4332] transition-colors">Ver todas →</button>
          </div>
          <div className="space-y-2">
            {recentAlerts.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-6">No hay alertas pendientes</p>
              : recentAlerts.map(alert => (
                <button key={alert.id} onClick={() => navigate("alerts")} className="w-full flex items-start gap-3 p-3 bg-background hover:bg-[#E8EDE6] rounded-xl cursor-pointer transition-colors text-left">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.type === "Crítica" ? "bg-red-500" : alert.type === "Advertencia" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.lot} · {alert.date}</p>
                  </div>
                  <span className={`text-xs rounded-full px-2 py-0.5 font-bold shrink-0 ${typeBadge(alert.type)}`}>{alert.type}</span>
                </button>
              ))
            }
          </div>
        </div>

        {/* Quick access */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">Acceso Rápido</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickAccess.map(qa => {
              const Icon = qa.icon;
              return (
                <button key={qa.label} onClick={() => navigate(qa.s)} className="flex flex-col items-center gap-1.5 p-3 bg-background hover:bg-[#D8EDDF] rounded-xl transition-colors border border-transparent hover:border-[#2D6A4F]/20">
                  <Icon className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-semibold text-foreground text-center leading-tight">{qa.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conditions strip */}
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #1B4332, #2D6A4F)" }}>
        <p className="text-[10px] font-bold text-white/50 mb-3 uppercase tracking-widest">Condiciones del cultivo · Hoy</p>
        <div className="flex items-center gap-5 overflow-x-auto pb-1">
          {[
            { icon: Thermometer, label: "28.4°C", sub: "Temp. máx." },
            { icon: Droplets, label: "76%", sub: "Humedad" },
            { icon: Activity, label: "12.2 mm", sub: "Precipitación" },
            { icon: Zap, label: "Alta", sub: "Rad. solar" },
            { icon: Navigation, label: "N 14 km/h", sub: "Viento" },
            { icon: MapPin, label: "5 lotes", sub: "Con operarios" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 shrink-0">
                <Icon className="w-4 h-4 text-[#E8A020]" />
                <div>
                  <p className="text-sm font-bold leading-tight">{item.label}</p>
                  <p className="text-[10px] text-white/45">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PERSONAL (solo Administrador) ───────────────────────────────────────────
function PersonnelScreen({ personnel, addPersonnel, removePersonnel, editPersonnel, downloadPersonnelTxt, accounts, currentUsername, changeAccountPassword, createAccount, deleteAccount }: {
  personnel: PersonnelItem[];
  addPersonnel: (p: { name: string; cargo: string; lot: string; phone: string }) => void;
  removePersonnel: (id: number) => void;
  editPersonnel: (id: number, updates: Partial<Omit<PersonnelItem, "id" | "dateAdded">>) => void;
  downloadPersonnelTxt: () => void;
  accounts: Account[];
  currentUsername: string;
  changeAccountPassword: (username: string, newPassword: string) => void;
  createAccount: (acc: Account) => string | null;
  deleteAccount: (username: string) => void;
}) {
  const [name, setName] = useState("");
  const [cargo, setCargo] = useState("Operario de campo");
  const [lot, setLot] = useState(LOTS[0]);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", cargo: "", lot: "", phone: "" });

  const startEdit = (p: PersonnelItem) => {
    setEditingId(p.id);
    setEditDraft({ name: p.name, cargo: p.cargo, lot: p.lot, phone: p.phone });
  };
  const saveEdit = (id: number) => {
    editPersonnel(id, editDraft);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) { setError("Completa el nombre y el teléfono del trabajador."); return; }
    addPersonnel({ name: name.trim(), cargo, lot, phone: phone.trim() });
    setName(""); setPhone(""); setError("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Gestión de Personal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Añadir y administrar trabajadores del sistema</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shrink-0">
          <Lock className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span className="text-xs font-bold text-foreground">Solo Administrador</span>
        </div>
      </div>

      {/* Formulario de alta */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4 text-[#2D6A4F]" /> Añadir trabajador</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Nombre completo</label>
            <input value={name} onChange={e => { setName(e.target.value); setError(""); }} placeholder="Ej. Jorge Ramírez" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Teléfono</label>
            <input value={phone} onChange={e => { setPhone(e.target.value); setError(""); }} placeholder="Ej. 3001234567" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Cargo</label>
            <select value={cargo} onChange={e => setCargo(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
              <option>Operario de campo</option>
              <option>Supervisor</option>
              <option>Agrónomo</option>
              <option>Técnico de monitoreo</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Lote asignado</label>
            <select value={lot} onChange={e => setLot(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
              {LOTS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mt-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mt-3">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700">Trabajador añadido y respaldo .txt descargado.</p>
          </div>
        )}
        <button onClick={handleAdd} className="w-full md:w-auto bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl px-5 py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4">
          <UserPlus className="w-4 h-4" /> Añadir personal
        </button>
      </div>

      {/* Lista de personal */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-foreground">Personal registrado ({personnel.length})</h3>
          <button onClick={downloadPersonnelTxt} className="flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F] hover:text-[#1B4332] transition-colors">
            <FileDown className="w-3.5 h-3.5" /> Descargar .txt
          </button>
        </div>
        <div className="space-y-2">
          {personnel.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-6">Aún no hay personal registrado</p>
            : personnel.map(p => (
              editingId === p.id ? (
                <div key={p.id} className="p-3 bg-background rounded-xl space-y-2 border-2 border-[#2D6A4F]/30">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editDraft.name} onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))} className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" placeholder="Nombre" />
                    <input value={editDraft.phone} onChange={e => setEditDraft(d => ({ ...d, phone: e.target.value }))} className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" placeholder="Teléfono" />
                    <select value={editDraft.cargo} onChange={e => setEditDraft(d => ({ ...d, cargo: e.target.value }))} className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
                      <option>Operario de campo</option><option>Supervisor</option><option>Agrónomo</option><option>Técnico de monitoreo</option>
                    </select>
                    <select value={editDraft.lot} onChange={e => setEditDraft(d => ({ ...d, lot: e.target.value }))} className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
                      {LOTS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(p.id)} className="flex-1 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-lg py-2 text-xs font-bold transition-colors">Guardar cambios</button>
                    <button onClick={() => setEditingId(null)} className="px-3 bg-muted hover:bg-border rounded-lg py-2 text-xs font-bold text-foreground transition-colors">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-background rounded-xl">
                  <div className="w-9 h-9 bg-[#D8EDDF] rounded-full flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.cargo} · {p.lot} · {p.phone}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:block">{p.dateAdded}</span>
                  <button onClick={() => startEdit(p)} className="p-1.5 text-muted-foreground hover:text-[#2D6A4F] hover:bg-[#D8EDDF] rounded-lg transition-colors shrink-0" title="Editar">
                    <ClipboardList className="w-4 h-4" />
                  </button>
                  <button onClick={() => removePersonnel(p.id)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            ))
          }
        </div>
        <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
          Nota: mientras se conecta la base de datos definitiva, el personal se guarda automáticamente en este navegador y cada alta genera un respaldo descargable en formato .txt.
        </p>
      </div>

      <AccountsPanel accounts={accounts} currentUsername={currentUsername} changeAccountPassword={changeAccountPassword} createAccount={createAccount} deleteAccount={deleteAccount} />
    </div>
  );
}

// ── Panel de cuentas del sistema (solo Administrador) ──────────────────────
function AccountsPanel({ accounts, currentUsername, changeAccountPassword, createAccount, deleteAccount }: {
  accounts: Account[]; currentUsername: string;
  changeAccountPassword: (username: string, newPassword: string) => void;
  createAccount: (acc: Account) => string | null;
  deleteAccount: (username: string) => void;
}) {
  const [pwdEditUser, setPwdEditUser] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const [showNewAccount, setShowNewAccount] = useState(false);
  const [naUser, setNaUser] = useState("");
  const [naPwd, setNaPwd] = useState("");
  const [naName, setNaName] = useState("");
  const [naRole, setNaRole] = useState<Role>("Operario");
  const [naError, setNaError] = useState("");
  const [naSuccess, setNaSuccess] = useState(false);

  const submitPasswordChange = (username: string) => {
    if (newPwd.length < 4) { setPwdError("La contraseña debe tener al menos 4 caracteres."); return; }
    if (newPwd !== confirmPwd) { setPwdError("Las contraseñas no coinciden."); return; }
    changeAccountPassword(username, newPwd);
    setPwdError(""); setPwdEditUser(null); setNewPwd(""); setConfirmPwd("");
    setPwdSuccess(username);
    setTimeout(() => setPwdSuccess(null), 2500);
  };

  const submitNewAccount = () => {
    if (!naUser.trim() || !naPwd.trim() || !naName.trim()) { setNaError("Completa usuario, nombre y contraseña."); return; }
    if (naPwd.length < 4) { setNaError("La contraseña debe tener al menos 4 caracteres."); return; }
    const err = createAccount({ username: naUser.trim().toLowerCase(), password: naPwd, name: naName.trim(), role: naRole });
    if (err) { setNaError(err); return; }
    setNaUser(""); setNaPwd(""); setNaName(""); setNaRole("Operario"); setNaError("");
    setShowNewAccount(false);
    setNaSuccess(true);
    setTimeout(() => setNaSuccess(false), 2500);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Lock className="w-4 h-4 text-[#2D6A4F]" /> Cuentas del sistema</h3>
        <button onClick={() => setShowNewAccount(v => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F] hover:text-[#1B4332] transition-colors">
          <UserPlus className="w-3.5 h-3.5" /> {showNewAccount ? "Cancelar" : "Nueva cuenta"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Cambia contraseñas o crea nuevas cuentas de acceso (Administrador, Supervisor u Operario).</p>

      {naSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /><p className="text-sm text-green-700">Cuenta creada correctamente.</p>
        </div>
      )}

      {showNewAccount && (
        <div className="bg-background border border-border rounded-xl p-3 mb-3 space-y-2">
          <div className="grid md:grid-cols-2 gap-2">
            <input value={naName} onChange={e => { setNaName(e.target.value); setNaError(""); }} placeholder="Nombre a mostrar (Ej. Sup. Ríos)" className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
            <input value={naUser} onChange={e => { setNaUser(e.target.value); setNaError(""); }} placeholder="usuario (sin espacios)" className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
            <input value={naPwd} onChange={e => { setNaPwd(e.target.value); setNaError(""); }} type="text" placeholder="contraseña" className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
            <select value={naRole} onChange={e => setNaRole(e.target.value as Role)} className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
              <option>Administrador</option><option>Supervisor</option><option>Operario</option>
            </select>
          </div>
          {naError && <p className="text-xs text-red-600">{naError}</p>}
          <button onClick={submitNewAccount} className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-lg px-4 py-2 text-xs font-bold transition-colors">Crear cuenta</button>
        </div>
      )}

      <div className="space-y-2">
        {accounts.map(acc => (
          <div key={acc.username} className="p-3 bg-background rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#D8EDDF] rounded-full flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{acc.name} {acc.username === currentUsername && <span className="text-[10px] text-[#2D6A4F] font-bold">(tú)</span>}</p>
                <p className="text-xs text-muted-foreground">usuario: {acc.username} · {acc.role}</p>
              </div>
              <button onClick={() => { setPwdEditUser(pwdEditUser === acc.username ? null : acc.username); setPwdError(""); setNewPwd(""); setConfirmPwd(""); }} className="text-xs font-semibold text-[#2D6A4F] hover:text-[#1B4332] transition-colors shrink-0">
                Cambiar contraseña
              </button>
              {accounts.length > 1 && (
                <button onClick={() => deleteAccount(acc.username)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Eliminar cuenta">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {pwdSuccess === acc.username && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mt-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" /><p className="text-xs text-green-700">Contraseña actualizada.</p>
              </div>
            )}
            {pwdEditUser === acc.username && (
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                <input value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdError(""); }} type="text" placeholder="Nueva contraseña" className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                <input value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setPwdError(""); }} type="text" placeholder="Confirmar contraseña" className="bg-card border border-border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                {pwdError && <p className="text-xs text-red-600 md:col-span-2">{pwdError}</p>}
                <button onClick={() => submitPasswordChange(acc.username)} className="md:col-span-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-lg py-2 text-xs font-bold transition-colors">Guardar nueva contraseña</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AccessDeniedScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="p-4 md:p-6 max-w-md mx-auto text-center py-16">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-red-600" />
      </div>
      <h2 className="font-bold text-foreground mb-1.5">No tienes permiso para ver esta sección</h2>
      <p className="text-sm text-muted-foreground mb-5">Solo la cuenta Administrador puede gestionar personal.</p>
      <button onClick={() => navigate("dashboard")} className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl px-5 py-2.5 font-bold text-sm transition-all">
        Volver al Dashboard
      </button>
    </div>
  );
}

// ── ANALYSIS SCREEN ───────────────────────────────────────────────────────────
function AnalysisScreen({ selectedLot, setSelectedLot, analysisType, setAnalysisType, analysisResult, analyzing, handleAnalyze, cameraActive, quality, handleCameraActivate }: {
  selectedLot: string; setSelectedLot: (v: string) => void;
  analysisType: string; setAnalysisType: (v: string) => void;
  analysisResult: null | { condition: string; confidence: number; severity: string; recommendation: string };
  analyzing: boolean; handleAnalyze: () => void;
  cameraActive: boolean; quality: number; handleCameraActivate: () => void;
}) {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Análisis IA de Imagen</h1>
        <p className="text-sm text-muted-foreground">Captura y diagnóstico inteligente de palmas</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[{ label: "Lote", value: selectedLot, options: LOTS, onChange: setSelectedLot }, { label: "Tipo de análisis", value: analysisType, options: ANALYSIS_TYPES, onChange: setAnalysisType }].map(sel => (
          <div key={sel.label}>
            <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">{sel.label}</label>
            <div className="relative">
              <select value={sel.value} onChange={e => sel.onChange(e.target.value)} className="w-full appearance-none bg-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] font-medium pr-8">
                {sel.options.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Camera viewer */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="relative bg-[#071510] aspect-video flex items-center justify-center">
          {!cameraActive ? (
            <button onClick={handleCameraActivate} className="flex flex-col items-center gap-3 text-white/40 hover:text-white/80 transition-colors group">
              <div className="w-20 h-20 rounded-full border-2 border-white/20 group-hover:border-white/40 flex items-center justify-center transition-colors">
                <Camera className="w-9 h-9" />
              </div>
              <span className="text-sm font-semibold">Activar cámara</span>
            </button>
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0D2B1A 0%, #1B4332 60%, #0A1E10 100%)" }} />
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <TreePine className="w-28 h-28 text-green-400" />
              </div>
              {[...Array(7)].map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-green-400/15" style={{ top: `${(i + 1) * 12.5}%` }} />
              ))}
              {/* Corner brackets */}
              {[["top-4 left-4", "border-t-2 border-l-2"], ["top-4 right-4", "border-t-2 border-r-2"], ["bottom-4 left-4", "border-b-2 border-l-2"], ["bottom-4 right-4", "border-b-2 border-r-2"]].map(([pos, border]) => (
                <div key={pos} className={`absolute w-7 h-7 ${pos} ${border} border-[#E8A020]`} />
              ))}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#E8A020] text-[#1A2218] text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wider">
                CAPTURANDO
              </div>
            </>
          )}
        </div>

        {cameraActive && (
          <div className="p-3 border-t border-border bg-background">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Calidad de imagen</span>
              <span className="text-xs font-bold text-foreground font-mono">{quality}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${quality >= 80 ? "bg-green-500" : quality >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${quality}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {quality >= 80 ? "✓ Calidad óptima para análisis" : quality >= 50 ? "Mejorando enfoque..." : "Acerque la palma a la cámara"}
            </p>
          </div>
        )}
      </div>

      <button onClick={handleAnalyze} disabled={!cameraActive || analyzing || quality < 70} className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] disabled:bg-muted disabled:text-muted-foreground text-white rounded-2xl py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:shadow-none">
        {analyzing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando imagen con IA...</> : <><ScanLine className="w-4 h-4" /> Analizar con IA</>}
      </button>

      {analysisResult && (
        <div className="bg-card border-2 border-[#2D6A4F]/30 rounded-2xl overflow-hidden">
          <div className="bg-[#2D6A4F] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">Diagnóstico IA</span>
            </div>
            <span className="text-xs text-white/60 font-mono">{analysisType} · {selectedLot}</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-foreground text-base leading-tight">{analysisResult.condition}</p>
                <p className="text-xs text-muted-foreground mt-1">Severidad: <span className="text-amber-600 font-bold">{analysisResult.severity}</span></p>
              </div>
              <div className="text-center shrink-0">
                <p className="text-3xl font-bold text-[#2D6A4F] font-mono leading-none">{analysisResult.confidence}%</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wide">Confianza</p>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Recomendación agrónoma</p>
              <p className="text-sm text-foreground leading-relaxed">{analysisResult.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LABOR SCREEN ──────────────────────────────────────────────────────────────
function LaborScreen({ selectedLot, setSelectedLot, laborType, setLaborType, responsible, setResponsible, gpsCount, gpsActive, onGpsToggle, saveLaborRecord }: {
  selectedLot: string; setSelectedLot: (v: string) => void;
  laborType: string; setLaborType: (v: string) => void;
  responsible: string; setResponsible: (v: string) => void;
  gpsCount: number; gpsActive: boolean; onGpsToggle: () => void;
  saveLaborRecord: (rec: { lot: string; laborType: string; responsible: string; verified: boolean; gpsCount: number }) => void;
}) {
  const [anthesis, setAnthesis] = useState({ a: false, b: true, c: false, d: false });
  const [verified, setVerified] = useState(false);
  const [saved, setSaved] = useState(false);
  const today = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });

  const handleSave = () => {
    saveLaborRecord({ lot: selectedLot, laborType, responsible, verified, gpsCount });
    setSaved(true);
    setVerified(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const anthesisLabels = [
    { key: "a" as const, label: "A — Pre-antesis" },
    { key: "b" as const, label: "B — Antesis plena" },
    { key: "c" as const, label: "C — Post-antesis" },
    { key: "d" as const, label: "D — Fructificación" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Registro de Labor</h1>
        <p className="text-sm text-muted-foreground">Registra jornadas y actividades de campo</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Lote", value: selectedLot, options: LOTS, onChange: setSelectedLot },
            { label: "Tipo de labor", value: laborType, options: LABOR_TYPES, onChange: setLaborType },
          ].map(sel => (
            <div key={sel.label}>
              <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">{sel.label}</label>
              <div className="relative">
                <select value={sel.value} onChange={e => sel.onChange(e.target.value)} className="w-full appearance-none bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] font-medium pr-8">
                  {sel.options.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Fecha</label>
            <input type="text" value={today} readOnly className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground font-medium cursor-default" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Responsable</label>
            <div className="relative">
              <select value={responsible} onChange={e => setResponsible(e.target.value)} className="w-full appearance-none bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] font-medium pr-8">
                {WORKERS.map(w => <option key={w}>{w}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {laborType === "Polinización" && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Estado de Antesis</h3>
          <div className="grid grid-cols-2 gap-2">
            {anthesisLabels.map(({ key, label }) => (
              <button key={key} onClick={() => setAnthesis(prev => ({ ...prev, [key]: !prev[key] }))} className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm transition-all ${anthesis[key] ? "bg-[#2D6A4F] border-[#2D6A4F] text-white" : "bg-background border-border text-foreground hover:border-[#2D6A4F]/40"}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${anthesis[key] ? "bg-white border-white" : "border-muted-foreground"}`}>
                  {anthesis[key] && <Check className="w-2.5 h-2.5 text-[#2D6A4F]" />}
                </div>
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Verificación Visual</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Confirmar ejecución del trabajo</p>
          </div>
          <button onClick={() => setVerified(!verified)} className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${verified ? "bg-[#2D6A4F]" : "bg-muted"}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${verified ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
        {verified && <p className="text-xs text-[#2D6A4F] font-semibold mt-2.5">✓ Labor verificada visualmente</p>}
      </div>

      {laborType === "Polinización" && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Conteo Automático GPS</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Flores polinizadas por recorrido</p>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${gpsActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${gpsActive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
              {gpsActive ? "GPS Activo" : "GPS Inactivo"}
            </div>
          </div>
          <div className="text-center mb-4">
            <p className="text-6xl font-bold text-[#2D6A4F] font-mono leading-none">{gpsCount}</p>
            <p className="text-sm text-muted-foreground font-medium mt-2">flores registradas</p>
          </div>
          <button onClick={onGpsToggle} className={`w-full rounded-2xl py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${gpsActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"}`}>
            <Navigation className="w-4 h-4" />
            {gpsActive ? "Detener conteo GPS" : "Iniciar conteo GPS"}
          </button>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">Labor guardada correctamente en el historial del lote.</p>
        </div>
      )}
      <button onClick={handleSave} className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-2xl py-4 font-bold text-sm transition-all shadow-sm hover:shadow-md">
        Guardar Registro de Labor
      </button>
    </div>
  );
}

// ── LOT DETAIL ────────────────────────────────────────────────────────────────
function LotDetailScreen({ lotTab, setLotTab, laborHistory }: { lotTab: string; setLotTab: (v: string) => void; laborHistory: LaborRecord[] }) {
  const tabs = [
    { id: "labores", label: "Labores" },
    { id: "monitoreo", label: "Monitoreo" },
    { id: "diagnósticos", label: "Diagnósticos" },
    { id: "análisis", label: "Análisis" },
    { id: "timeline", label: "Línea de tiempo" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-white p-5 md:p-6" style={{ background: "linear-gradient(135deg, #0D2B1A, #2D6A4F)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Finca El Palmar</p>
            <h1 className="text-2xl font-bold">Lote 1</h1>
            <p className="text-white/60 text-sm mt-0.5">42.5 hectáreas · Material Ténera</p>
          </div>
          <span className="bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full tracking-wide">ACTIVO</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: "Palmas", value: "2,840" },
            { label: "Siembra", value: "2009" },
            { label: "Suelo", value: "Franco" },
            { label: "Cosechas/año", value: "24" },
            { label: "Prod. prom.", value: "18.4 T/ha" },
            { label: "NDVI", value: "0.78" },
          ].map(item => (
            <div key={item.label} className="rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.12)" }}>
              <p className="text-white text-sm font-bold font-mono leading-tight">{item.value}</p>
              <p className="text-white/45 text-[10px] font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border-b border-border overflow-x-auto">
        <div className="flex min-w-max px-4">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setLotTab(tab.id)} className={`px-4 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${lotTab === tab.id ? "border-[#2D6A4F] text-[#2D6A4F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-3">
        {lotTab === "labores" && [
          ...laborHistory.map(r => ({ action: r.laborType, worker: r.responsible, date: r.date, status: r.verified ? "Completado" : "Pendiente", isNew: true, key: `lr-${r.id}` })),
          ...LOT_HISTORY.map(h => ({ ...h, isNew: false, key: `${h.date}-${h.action}` })),
        ].map((item) => (
          <div key={item.key} className={`bg-card border rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow ${item.isNew ? "border-[#2D6A4F]/40" : "border-border"}`}>
            <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-[#2D6A4F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground">{item.action}</p>
              <p className="text-xs text-muted-foreground">{item.worker} · {item.date}</p>
            </div>
            <span className={`text-xs rounded-full px-2.5 py-1 font-bold shrink-0 ${typeBadge(item.status)}`}>{item.status}</span>
          </div>
        ))}

        {lotTab === "monitoreo" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Temperatura suelo", value: "26.8°C", status: "Normal", icon: Thermometer },
              { label: "Humedad suelo", value: "52%", status: "Normal", icon: Droplets },
              { label: "pH del suelo", value: "5.9", status: "Óptimo", icon: Activity },
              { label: "Radiación solar", value: "1842 W/m²", status: "Alta", icon: Zap },
              { label: "Índice NDVI", value: "0.78", status: "Saludable", icon: Leaf },
              { label: "Estrés hídrico", value: "Bajo", status: "Bajo", icon: RefreshCw },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-card border border-border rounded-2xl p-4">
                  <Icon className="w-4 h-4 text-[#2D6A4F] mb-2.5" />
                  <p className="text-xl font-bold text-foreground font-mono">{item.value}</p>
                  <p className="text-xs font-bold text-foreground mt-1">{item.label}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${typeBadge(item.status)}`}>{item.status}</span>
                </div>
              );
            })}
          </div>
        )}

        {lotTab === "diagnósticos" && [
          { date: "29 Jun 2026", condition: "Planta Sana", confidence: 94, type: "Hoja" },
          { date: "15 Jun 2026", condition: "Déficit de Boro", confidence: 82, type: "Hoja" },
          { date: "01 Jun 2026", condition: "Planta Sana", confidence: 91, type: "Racimo" },
        ].map((d, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 text-[#2D6A4F]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">{d.condition}</p>
              <p className="text-xs text-muted-foreground">{d.type} · {d.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-[#2D6A4F] font-mono">{d.confidence}%</p>
              <p className="text-[10px] text-muted-foreground">confianza</p>
            </div>
          </div>
        ))}

        {lotTab === "análisis" && (
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { title: "Foliar Q2-2026", date: "15 Jun 2026", type: "Foliar", color: "bg-green-100 text-green-700", elements: [["N", "2.48%"], ["P", "0.14%"], ["K", "1.02%"], ["Mg", "0.28%"]] },
              { title: "Suelo Q1-2026", date: "15 Mar 2026", type: "Suelo", color: "bg-amber-100 text-amber-700", elements: [["pH", "5.9"], ["MO", "3.2%"], ["P disp.", "24 ppm"], ["K", "0.35 me"]] },
              { title: "Clima Jun 2026", date: "Mensual", type: "Clima", color: "bg-blue-100 text-blue-700", elements: [["Precipit.", "182 mm"], ["T máx", "32°C"], ["T mín", "20°C"], ["HR", "78%"]] },
            ].map((a, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.color}`}>{a.type}</span>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </div>
                <p className="font-bold text-sm text-foreground mb-3">{a.title}</p>
                <div className="space-y-1.5">
                  {a.elements.map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-mono font-bold text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {lotTab === "timeline" && (
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border" />
            {[
              { year: "2026", events: [{ month: "Jun", text: "Diagnóstico IA: Planta Sana (94%)", dot: "bg-green-500" }, { month: "Mar", text: "Análisis de suelo Q1 — pH 5.9", dot: "bg-blue-500" }] },
              { year: "2025", events: [{ month: "Dic", text: "Cosecha récord: 52.3 T total", dot: "bg-green-500" }, { month: "Sep", text: "Tratamiento fitosanitario anillo rojo", dot: "bg-amber-500" }, { month: "Jun", text: "Resiembra 45 palmas sector sur", dot: "bg-blue-500" }] },
              { year: "2024", events: [{ month: "Nov", text: "Certificación RSPO renovada", dot: "bg-green-500" }, { month: "May", text: "Mantenimiento sistema de drenaje", dot: "bg-blue-500" }] },
            ].map(group => (
              <div key={group.year} className="mb-5">
                <div className="flex items-center gap-2 mb-2 relative">
                  <div className="absolute -left-4 w-4 h-4 bg-[#2D6A4F] rounded-full border-2 border-white shadow-sm" />
                  <span className="font-black text-sm text-foreground ml-1">{group.year}</span>
                </div>
                <div className="space-y-2">
                  {group.events.map((ev, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground font-mono font-bold w-8 shrink-0">{ev.month}</span>
                      <p className="text-sm text-foreground flex-1">{ev.text}</p>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${ev.dot}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── GPS MAP ───────────────────────────────────────────────────────────────────
function GPSScreen({ activeWorkers, toggleWorker }: { activeWorkers: string[]; toggleWorker: (w: string) => void }) {
  const totalPollinated = GPS_ROUTES.filter(r => activeWorkers.includes(r.worker)).reduce((sum, r) => sum + r.count, 0);
  const palmGrid: { x: number; y: number }[] = [];
  for (let row = 0; row < 9; row++) for (let col = 0; col < 11; col++)
    palmGrid.push({ x: 22 + col * 16, y: 22 + row * 16 });

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Mapa de Recorridos GPS</h1>
          <p className="text-sm text-muted-foreground">Polinización y rutas del personal</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#2D6A4F] font-mono leading-none">{totalPollinated}</p>
          <p className="text-xs text-muted-foreground font-medium">flores registradas</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {GPS_ROUTES.map(route => (
          <button key={route.worker} onClick={() => toggleWorker(route.worker)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${activeWorkers.includes(route.worker) ? "text-white border-transparent shadow-sm" : "bg-card border-border text-muted-foreground"}`} style={{ backgroundColor: activeWorkers.includes(route.worker) ? route.color : undefined }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
            {route.worker}
            <span className="font-mono text-xs opacity-75">({route.count})</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-background px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Finca El Palmar · Lote 1</span>
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              EN VIVO
            </div>
          </div>
          <svg viewBox="0 0 200 170" className="w-full" style={{ background: "#E8EDE6" }}>
            <rect x="14" y="14" width="172" height="142" rx="4" fill="#F0F4EE" stroke="#2D6A4F" strokeWidth="1.5" strokeDasharray="5,3" />
            <text x="100" y="11" textAnchor="middle" fontSize="5" fill="#6B7B6A" fontWeight="700">NORTE ↑</text>
            {palmGrid.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill="#2D6A4F" opacity="0.35" />)}
            {GPS_ROUTES.filter(r => activeWorkers.includes(r.worker)).map(route => (
              <polyline key={route.worker} points={route.points.map(p => p.join(",")).join(" ")} fill="none" stroke={route.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            ))}
            {GPS_ROUTES.filter(r => activeWorkers.includes(r.worker)).map(route => (
              <g key={route.worker + "-m"}>
                <circle cx={route.points[0][0]} cy={route.points[0][1]} r="5" fill={route.color} stroke="white" strokeWidth="2" />
                <text x={route.points[0][0]} y={route.points[0][1] + 1.5} textAnchor="middle" fontSize="4.5" fill="white" fontWeight="bold">{route.worker[0]}</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #1B4332, #2D6A4F)" }}>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Total polinizadas hoy</p>
            <p className="text-4xl font-bold font-mono leading-none">{totalPollinated}</p>
            <p className="text-sm text-white/60 font-medium mt-1">Meta: 520 flores</p>
            <div className="mt-2.5 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#E8A020] rounded-full transition-all duration-500" style={{ width: `${Math.min((totalPollinated / 520) * 100, 100)}%` }} />
            </div>
            <p className="text-[10px] text-white/40 font-bold mt-1">{Math.round((totalPollinated / 520) * 100)}% del objetivo</p>
          </div>

          {GPS_ROUTES.map(route => (
            <div key={route.worker} className={`bg-card border border-border rounded-2xl p-3 transition-all ${!activeWorkers.includes(route.worker) ? "opacity-35" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                  <span className="text-sm font-bold text-foreground">{route.worker}</span>
                </div>
                <span className="font-mono font-bold text-foreground text-sm">{route.count}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ backgroundColor: route.color, width: `${(route.count / 180) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
function ReportsScreen({ reportType, setReportType, reportPeriod, setReportPeriod }: {
  reportType: string; setReportType: (v: string) => void;
  reportPeriod: string; setReportPeriod: (v: string) => void;
}) {
  const REPORT_TYPES = ["Producción", "Labores", "Personal", "Alertas"];
  const PERIODS = ["Junio 2026", "Mayo 2026", "Q2 2026", "H1 2026", "Año 2026"];

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">Genera y exporta reportes del cultivo</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold hover:bg-background transition-colors">
            <FileText className="w-4 h-4 text-muted-foreground" />
            PDF
          </button>
          <button className="flex items-center gap-2 bg-[#2D6A4F] text-white rounded-xl px-3 py-2 text-sm font-bold hover:bg-[#1B4332] transition-colors">
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex bg-card border border-border rounded-xl overflow-hidden">
          {REPORT_TYPES.map(t => (
            <button key={t} onClick={() => setReportType(t)} className={`px-4 py-2.5 text-sm font-bold border-r border-border last:border-0 transition-colors ${reportType === t ? "bg-[#2D6A4F] text-white" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
        <div className="relative">
          <select value={reportPeriod} onChange={e => setReportPeriod(e.target.value)} className="appearance-none bg-card border border-border rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] pr-8">
            {PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {reportType === "Producción" && (
        <>
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-4">Producción vs Meta — Toneladas</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={PRODUCTION_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4EAE2" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12, border: "1px solid #E4EAE2" }} />
                <Area type="monotone" dataKey="meta" stroke="#E8A020" fill="none" strokeDasharray="5 3" name="Meta (T)" dot={false} />
                <Area type="monotone" dataKey="produccion" stroke="#2D6A4F" fill="url(#prodGrad)" name="Producción (T)" strokeWidth={2} dot={{ r: 4, fill: "#2D6A4F", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Tabla Consolidada</h3>
              <span className="text-xs text-muted-foreground font-mono">{reportPeriod}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background">
                  <tr>{["Mes", "Lotes", "Producción", "Meta", "Cumplimiento"].map(h => <th key={h} className="text-left px-4 py-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {PRODUCTION_DATA.map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-background transition-colors">
                      <td className="px-4 py-3 font-bold">{row.mes}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">14</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#2D6A4F]">{row.produccion} T</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{row.meta} T</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${row.produccion >= row.meta ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{Math.round((row.produccion / row.meta) * 100)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {reportType === "Labores" && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-4">Labores por semana · {reportPeriod}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={LABOR_REPORT} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAE2" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12, border: "1px solid #E4EAE2" }} />
              <Bar dataKey="polinizacion" fill="#2D6A4F" name="Polinización" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cosecha" fill="#E8A020" name="Cosecha" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mantenimiento" fill="#94A3B8" name="Mantenimiento" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {reportType === "Personal" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Rendimiento por trabajador · {reportPeriod}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background">
                <tr>{["Trabajador", "Labores", "Polinizadas", "Horas", "Eficiencia"].map(h => <th key={h} className="text-left px-4 py-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{h}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  { name: "Trabajador 1", labores: 18, polinizadas: 142, horas: 44.5, eficiencia: 94 },
                  { name: "Trabajador 2", labores: 16, polinizadas: 118, horas: 40.0, eficiencia: 88 },
                  { name: "Trabajador 3", labores: 14, polinizadas: 97, horas: 36.5, eficiencia: 79 },
                  { name: "Trabajador 4", labores: 15, polinizadas: 89, horas: 38.0, eficiencia: 82 },
                ].map((w, i) => (
                  <tr key={i} className="border-t border-border hover:bg-background transition-colors">
                    <td className="px-4 py-3 font-bold">{w.name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{w.labores}</td>
                    <td className="px-4 py-3 font-mono font-bold">{w.polinizadas}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{w.horas}h</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${w.eficiencia >= 90 ? "bg-green-100 text-green-700" : w.eficiencia >= 80 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{w.eficiencia}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === "Alertas" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[{ label: "Críticas", value: 2, cls: "bg-red-50 border-red-200 text-red-700" }, { label: "Advertencias", value: 2, cls: "bg-amber-50 border-amber-200 text-amber-700" }, { label: "Informativas", value: 1, cls: "bg-blue-50 border-blue-200 text-blue-700" }].map(item => (
              <div key={item.label} className={`border rounded-2xl p-4 ${item.cls}`}>
                <p className="text-3xl font-bold font-mono">{item.value}</p>
                <p className="text-xs font-bold mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Tiempo promedio de atención</p>
            <p className="text-3xl font-bold text-foreground font-mono mt-1">4.2 <span className="text-base font-semibold text-muted-foreground">horas</span></p>
            <p className="text-xs text-muted-foreground mt-1">Alertas resueltas este mes: <strong className="text-foreground">8 de 10</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ALERTS ────────────────────────────────────────────────────────────────────
function AlertsScreen({ alertList, alertFilter, setAlertFilter, selectedAlert, setSelectedAlert, markAlertAttended }: {
  alertList: AlertItem[]; alertFilter: string; setAlertFilter: (v: string) => void;
  selectedAlert: AlertItem | null; setSelectedAlert: (a: AlertItem | null) => void;
  markAlertAttended: (id: number) => void;
}) {
  const filters = ["Todas", "Crítica", "Advertencia", "Info", "Atendida"];
  const filtered = alertFilter === "Todas"
    ? alertList
    : alertFilter === "Atendida"
    ? alertList.filter(a => a.status === "Atendida")
    : alertList.filter(a => a.type === alertFilter);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Alertas Tempranas</h1>
        <p className="text-sm text-muted-foreground">Gestión de alertas del sistema</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setAlertFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 whitespace-nowrap transition-all ${alertFilter === f ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
            {f}
            {f !== "Todas" && f !== "Atendida" && (
              <span className="ml-1 font-mono">({alertList.filter(a => a.type === f).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay alertas en esta categoría</p>
            </div>
          ) : filtered.map(alert => (
            <button key={alert.id} onClick={() => setSelectedAlert(alert)} className={`w-full bg-card border-2 rounded-2xl p-4 text-left transition-all hover:shadow-sm ${selectedAlert?.id === alert.id ? "border-[#2D6A4F]" : "border-border hover:border-[#2D6A4F]/30"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${alert.type === "Crítica" ? "bg-red-500" : alert.type === "Advertencia" ? "bg-amber-500" : "bg-blue-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.lot} · {alert.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-black ${typeBadge(alert.type)}`}>{alert.type}</span>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-black ${typeBadge(alert.status)}`}>{alert.status}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedAlert ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden h-fit">
            <div className={`px-4 py-3 border-b border-border flex items-center justify-between ${selectedAlert.type === "Crítica" ? "bg-red-50" : selectedAlert.type === "Advertencia" ? "bg-amber-50" : "bg-blue-50"}`}>
              <span className={`text-sm font-black ${selectedAlert.type === "Crítica" ? "text-red-700" : selectedAlert.type === "Advertencia" ? "text-amber-700" : "text-blue-700"}`}>
                {selectedAlert.type}
              </span>
              <span className={`text-[10px] font-black rounded-full px-2.5 py-1 ${typeBadge(selectedAlert.status)}`}>{selectedAlert.status}</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-bold text-foreground text-base leading-tight">{selectedAlert.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5">{selectedAlert.lot} · {selectedAlert.date}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Descripción</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedAlert.description}</p>
              </div>
              <div className="bg-[#F0F4EE] border border-[#2D6A4F]/20 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <p className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-widest">Acción Recomendada</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{selectedAlert.action}</p>
              </div>
              {selectedAlert.status !== "Atendida" ? (
                <button onClick={() => markAlertAttended(selectedAlert.id)} className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-2xl py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                  <Check className="w-4 h-4" />
                  Marcar como Atendida
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 justify-center py-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-bold">Alerta atendida correctamente</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden md:flex bg-card border border-border rounded-2xl items-center justify-center min-h-48">
            <div className="text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-25" />
              <p className="text-sm font-semibold">Selecciona una alerta para ver el detalle</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
