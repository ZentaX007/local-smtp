import React, { useState, Component } from 'react';
import { 
  Mail, 
  Lock, 
  Send, 
  User, 
  AtSign, 
  MessageSquare, 
  Hash, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  History,
  Key,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = '/api';

// ── Error Boundary (prevents full blank-screen crashes) ──────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="glass-card rounded-2xl p-8 max-w-md text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-white font-bold text-xl">Something went wrong</h2>
            <p className="text-slate-400 text-sm">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary px-6 py-2 rounded-xl text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Reusable Input ────────────────────────────────────────────────────────────
const InputField = ({ icon: Icon, showPassword, setShowPassword, togglePassword, className, ...props }) => (
  <div className="input-container group">
    <Icon className="input-icon group-focus-within:text-primary-400 transition-colors" size={20} />
    <input
      {...props}
      className={`input-glass input-with-icon ${className || ''}`}
    />
    {togglePassword && (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    )}
  </div>
);

// ── Provider Tab ──────────────────────────────────────────────────────────────
const ProviderTab = ({ active, onClick, icon: Icon, label, activeClass }) => (
  <button
    type="button"
    onClick={onClick}
    className={`provider-tab ${active ? `provider-tab-active ${activeClass}` : 'provider-tab-inactive'}`}
  >
    <Icon size={15} />
    <span>{label}</span>
  </button>
);

// ── Main App ──────────────────────────────────────────────────────────────────
function AppInner() {
  const [provider, setProvider] = useState('gmail');

  const [formData, setFormData] = useState({
    gmail_address: localStorage.getItem('smtp_gmail') || '',
    app_password: '',
    brevo_api_key: localStorage.getItem('brevo_api_key') || '',
    from_name: '',
    from_address: '',
    reply_to: '',
    recipient: '',
    subject: '',
    message: '',
  });

  const [showPassword, setShowPassword]     = useState(false);
  const [showBrevoKey, setShowBrevoKey]     = useState(false);
  const [rememberGmail, setRememberGmail]   = useState(!!localStorage.getItem('smtp_gmail'));
  const [rememberBrevo, setRememberBrevo]   = useState(!!localStorage.getItem('brevo_api_key'));
  const [loading, setLoading]               = useState(false);
  const [status, setStatus]                 = useState(null); // { type: 'success'|'error', message: string }

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const switchProvider = (p) => {
    setProvider(p);
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Persist preferences
    rememberGmail
      ? localStorage.setItem('smtp_gmail', formData.gmail_address)
      : localStorage.removeItem('smtp_gmail');
    rememberBrevo
      ? localStorage.setItem('brevo_api_key', formData.brevo_api_key)
      : localStorage.removeItem('brevo_api_key');

    const payload = {
      provider,
      from_name:    formData.from_name,
      from_address: formData.from_address,
      reply_to:     formData.reply_to,
      recipient:    formData.recipient,
      subject:      formData.subject,
      message:      formData.message,
      ...(provider === 'gmail'
        ? { gmail_address: formData.gmail_address, app_password: formData.app_password }
        : { brevo_api_key: formData.brevo_api_key }),
    };

    try {
      const res = await axios.post(`${API_URL}/send-email`, payload);
      setStatus({ type: 'success', message: res.data.message });
    } catch (err) {
      const raw = err.response?.data?.detail;
      let detail;
      if (Array.isArray(raw)) {
        // Pydantic v2 returns an array of {type, loc, msg, input} objects
        detail = raw.map((e) => e.msg || JSON.stringify(e)).join(' | ');
      } else if (typeof raw === 'string') {
        detail = raw;
      } else {
        detail = 'Failed to send email. Ensure the backend is running.';
      }
      setStatus({ type: 'error', message: detail });
    } finally {
      setLoading(false);
    }
  };

  const isBrevo = provider === 'brevo';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative">
      <div className="mesh-gradient" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl z-10"
      >
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="inline-flex items-center justify-center p-4 bg-primary-600/20 rounded-3xl mb-4 border border-primary-500/20 shadow-xl"
          >
            <Send className="w-10 h-10 text-primary-400" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight font-outfit">
            Local SMTP <span className="text-primary-400">Hub</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Securely test your transactional emails with a professional interface.
          </p>
        </div>

        {/* ── Main Card ── */}
        <div className="glass-card rounded-[2rem] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">

            {/* Provider Selector */}
            <div className="mb-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Email Provider
              </p>
              <div className="provider-toggle-group">
                <ProviderTab
                  active={!isBrevo}
                  onClick={() => switchProvider('gmail')}
                  icon={Mail}
                  label="Gmail SMTP"
                  activeClass="provider-tab-gmail"
                />
                <ProviderTab
                  active={isBrevo}
                  onClick={() => switchProvider('brevo')}
                  icon={Key}
                  label="Brevo API"
                  activeClass="provider-tab-brevo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* ── Left Column ── */}
              <div className="space-y-8">

                {/* Gmail Auth — shown via CSS, not AnimatePresence */}
                <section style={{ display: isBrevo ? 'none' : 'block' }}>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Gmail Authentication
                  </h3>
                  <div className="space-y-4">
                    <InputField
                      icon={Mail}
                      type="email"
                      name="gmail_address"
                      placeholder="Gmail Address"
                      value={formData.gmail_address}
                      onChange={handleChange}
                      required={!isBrevo}
                    />
                    <InputField
                      icon={Lock}
                      type={showPassword ? 'text' : 'password'}
                      name="app_password"
                      placeholder="App Password"
                      togglePassword
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      value={formData.app_password}
                      onChange={handleChange}
                      required={!isBrevo}
                    />
                    <div className="flex items-center gap-2 pt-1 px-1">
                      <input
                        type="checkbox"
                        id="remember-gmail"
                        checked={rememberGmail}
                        onChange={(e) => setRememberGmail(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-500 cursor-pointer"
                      />
                      <label htmlFor="remember-gmail" className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                        Remember Gmail address
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-300/70 leading-relaxed">
                    Generate an <span className="font-semibold text-blue-300">App Password</span> at{' '}
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-blue-200">
                      myaccount.google.com/apppasswords
                    </a>
                  </div>
                </section>

                {/* Brevo Auth — shown via CSS, not AnimatePresence */}
                <section style={{ display: isBrevo ? 'block' : 'none' }}>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Key className="w-4 h-4" /> Brevo API Key
                  </h3>
                  <div className="space-y-4">
                    <div className="input-container group">
                      <Key className="input-icon group-focus-within:text-indigo-400 transition-colors" size={20} />
                      <input
                        type={showBrevoKey ? 'text' : 'password'}
                        name="brevo_api_key"
                        placeholder="xkeysib-..."
                        value={formData.brevo_api_key}
                        onChange={handleChange}
                        required={isBrevo}
                        className="input-glass input-with-icon font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBrevoKey((v) => !v)}
                        className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showBrevoKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 pt-1 px-1">
                      <input
                        type="checkbox"
                        id="remember-brevo"
                        checked={rememberBrevo}
                        onChange={(e) => setRememberBrevo(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="remember-brevo" className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                        Remember API key
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-xs text-indigo-300/70 leading-relaxed">
                    Get your API key at{' '}
                    <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-indigo-200">
                      app.brevo.com → SMTP & API
                    </a>
                    . Make sure your sender email is verified in Brevo.
                  </div>
                </section>

                {/* Identity & Routing — always visible */}
                <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <User className="w-4 h-4" /> Identity & Routing
                  </h3>
                  <div className="space-y-4">
                    <InputField
                      icon={User}
                      type="text"
                      name="from_name"
                      placeholder="Display Name"
                      value={formData.from_name}
                      onChange={handleChange}
                      required
                    />
                    <InputField
                      icon={AtSign}
                      type="email"
                      name="from_address"
                      placeholder="From Address"
                      value={formData.from_address}
                      onChange={handleChange}
                      required
                    />
                    <InputField
                      icon={History}
                      type="email"
                      name="reply_to"
                      placeholder="Reply-To Address"
                      value={formData.reply_to}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </section>
              </div>

              {/* ── Right Column: Message ── */}
              <div className="space-y-8">
                <section className="h-full flex flex-col">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Message Composition
                  </h3>
                  <div className="space-y-4 flex-grow flex flex-col">
                    <InputField
                      icon={AtSign}
                      type="email"
                      name="recipient"
                      placeholder="Recipient Email"
                      className="font-semibold text-primary-300"
                      value={formData.recipient}
                      onChange={handleChange}
                      required
                    />
                    <InputField
                      icon={Hash}
                      type="text"
                      name="subject"
                      placeholder="Email Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                    <div className="relative flex-grow">
                      <textarea
                        name="message"
                        placeholder="Type your message content here..."
                        className="input-glass px-5 py-4 min-h-[160px] h-full resize-none leading-relaxed"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Status Message */}
            <AnimatePresence>
              {status && (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`mt-10 p-5 rounded-2xl flex items-center gap-4 ${
                    status.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  <div className="p-2 rounded-full bg-white/5">
                    {status.type === 'success'
                      ? <CheckCircle2 className="w-6 h-6" />
                      : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-wide">
                      {status.type === 'success' ? 'SUCCESS' : 'ERROR'}
                    </p>
                    <p className="text-sm opacity-80">{status.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Bar */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-start gap-3 max-w-sm">
                <ShieldCheck className="w-5 h-5 text-slate-500 mt-1 flex-shrink-0" />
                <p className="text-slate-500 text-xs leading-relaxed">
                  {isBrevo
                    ? 'Your API key is sent only to your local backend, which calls Brevo on your behalf.'
                    : 'Your credentials are sent directly to your local FastAPI backend and never leave your machine.'}
                  {' It will be converted to a colorful HTML email automatically.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full md:w-auto h-14 min-w-[240px] text-lg rounded-2xl group shadow-2xl flex items-center justify-center gap-2 font-semibold transition-all active:scale-95 text-white ${
                  isBrevo
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    : 'bg-primary-600 hover:bg-primary-500 shadow-primary-600/30'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Send via {isBrevo ? 'Brevo' : 'Gmail'}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center flex items-center justify-center gap-6 text-slate-600 text-xs font-semibold uppercase tracking-widest">
          <span>FastAPI</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>{isBrevo ? 'Brevo API' : 'Gmail SMTP'}</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>Vite React</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
