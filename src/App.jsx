import React, { useState, useEffect } from 'react';
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
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// RELATIVE URL for Vercel & Proxy support
const API_URL = '/api';

const InputField = ({ icon: Icon, label, showPassword, setShowPassword, ...props }) => (
  <div className="space-y-1">
    <div className="input-container group">
      <Icon className="input-icon group-focus-within:text-primary-400 transition-colors" size={20} />
      <input
        {...props}
        className={`input-glass input-with-icon ${props.className || ''}`}
      />
      {props.togglePassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  </div>
);

function App() {
  const [formData, setFormData] = useState({
    gmail_address: localStorage.getItem('smtp_gmail') || '',
    app_password: '',
    from_name: 'Local Hustler',
    from_address: 'info@localhuslter.com',
    reply_to: 'info@localhuslter.com',
    recipient: 'samitaj8970@gmail.com',
    subject: 'Hello from Local SMTP Hub',
    message: 'This is a test email sent via your new Local SMTP Hub interface.'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberGmail, setRememberGmail] = useState(!!localStorage.getItem('smtp_gmail'));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    if (rememberGmail) {
      localStorage.setItem('smtp_gmail', formData.gmail_address);
    } else {
      localStorage.removeItem('smtp_gmail');
    }

    try {
      // Endpoint is now just '/send-email' under the '/api' prefix
      const response = await axios.post(`${API_URL}/send-email`, formData);
      setStatus({ type: 'success', message: response.data.message });
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to send email. Ensure the backend server is running.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative">
      <div className="mesh-gradient" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl z-10"
      >
        {/* Header */}
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

        {/* Main Form Card */}
        <div className="glass-card rounded-[2rem] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left Column: Configuration */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> SMTP Authentication
                  </h3>
                  <div className="space-y-4">
                    <InputField
                      icon={Mail}
                      type="email"
                      name="gmail_address"
                      placeholder="Gmail Address"
                      value={formData.gmail_address}
                      onChange={handleChange}
                      required
                    />
                    <InputField
                      icon={Lock}
                      type={showPassword ? 'text' : 'password'}
                      name="app_password"
                      placeholder="App Password"
                      togglePassword={true}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      value={formData.app_password}
                      onChange={handleChange}
                      required
                    />
                    <div className="flex items-center gap-2 pt-2 px-1">
                      <input 
                        type="checkbox" 
                        id="remember"
                        checked={rememberGmail}
                        onChange={(e) => setRememberGmail(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500/30 cursor-pointer"
                      />
                      <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                        Remember Gmail address
                      </label>
                    </div>
                  </div>
                </section>

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

              {/* Right Column: Message */}
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

            {/* Status Display */}
            <AnimatePresence>
              {status && (
                <motion.div
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
                    {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
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
                  Encryption is active. Your credentials are sent directly to your local FastAPI backend and never leave your machine.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full md:w-auto h-14 min-w-[240px] text-lg rounded-2xl group shadow-2xl shadow-primary-600/30"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Send Secure Email
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
          <span className="w-1 h-1 rounded-full bg-slate-800"></span>
          <span>SMTP Gateway</span>
          <span className="w-1 h-1 rounded-full bg-slate-800"></span>
          <span>Vite React</span>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
