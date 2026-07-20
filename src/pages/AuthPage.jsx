import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';

const column1Images = [
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
];

const column2Images = [
  "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=600",
  "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600",
  "https://images.unsplash.com/photo-1515462277126-270d878326e5?q=80&w=600",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600",
];

const column3Images = [
  "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=600",
  "https://images.unsplash.com/photo-1501472312651-726afd116ff1?q=80&w=600",
  "https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=600",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600",
];

const AuthPage = ({ onLoginSuccess, onGuestClick }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authService.login(form.email, form.password);
        if (data.user) {
          onLoginSuccess(data.user);
        }
      } else {
        const data = await authService.register(form.name, form.email, form.password);
        if (data.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      setError(err.message || 'Erro ao conectar-se com o servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 flex items-center justify-center font-sans">
      
      {/* ================= BACKGROUND CAROUSEL ================= */}
      <div className="absolute inset-0 opacity-40 flex gap-4 p-4 pointer-events-none select-none h-[200vh] -top-1/2">
        
        {/* Coluna 1: Subindo (Upwards) */}
        <motion.div 
          className="flex-1 flex flex-col gap-4"
          animate={{ y: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
        >
          {[...column1Images, ...column1Images].map((src, i) => (
            <img key={i} src={src} className="w-full h-[350px] object-cover rounded-2xl shadow-md" alt="" />
          ))}
        </motion.div>

        {/* Coluna 2: Descendo (Downwards) */}
        <motion.div 
          className="flex-1 flex flex-col gap-4 hidden sm:flex"
          animate={{ y: [-1000, 0] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {[...column2Images, ...column2Images].map((src, i) => (
            <img key={i} src={src} className="w-full h-[350px] object-cover rounded-2xl shadow-md" alt="" />
          ))}
        </motion.div>

        {/* Coluna 3: Subindo (Upwards Fast) */}
        <motion.div 
          className="flex-1 flex flex-col gap-4 hidden md:flex"
          animate={{ y: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          {[...column3Images, ...column3Images].map((src, i) => (
            <img key={i} src={src} className="w-full h-[350px] object-cover rounded-2xl shadow-md" alt="" />
          ))}
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-950/85 to-transparent backdrop-blur-[6px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px] mx-4 bg-zinc-900/60 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] text-white"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center p-4 shadow-lg mb-4">
            <img src="/inkwell-logo.svg" alt="Inkwell" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            INKWELL
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isLogin ? 'Faça login para acessar seus salvos e favoritos' : 'Cadastre-se para sincronizar pastas e favoritos na nuvem'}
          </p>
        </div>

        {/* Notificação de Erro */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl font-medium mb-5 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="text" 
                    required 
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})} 
                    placeholder="Seu nome artístico ou apelido" 
                    className="w-full bg-black/40 border border-white/5 focus:border-yellow-400/50 p-3 pl-11 rounded-xl outline-none text-sm transition-all text-white placeholder-zinc-600" 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">E-mail Corporativo / Pessoal</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="email" 
                required 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})} 
                placeholder="exemplo@inkwell.com" 
                className="w-full bg-black/40 border border-white/5 focus:border-yellow-400/50 p-3 pl-11 rounded-xl outline-none text-sm transition-all text-white placeholder-zinc-600" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Senha de Acesso</label>
              {isLogin && <a href="#" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">Esqueceu?</a>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="password" 
                required 
                value={form.password} 
                onChange={(e) => setForm({...form, password: e.target.value})} 
                placeholder="••••••••••••" 
                className="w-full bg-black/40 border border-white/5 focus:border-yellow-400/50 p-3 pl-11 rounded-xl outline-none text-sm transition-all text-white placeholder-zinc-600" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6 shadow-[0_4px_20px_rgba(250,204,21,0.25)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {isLogin ? 'Entrar na Plataforma' : 'Finalizar Registro'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Ou</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <button 
          type="button"
          onClick={onGuestClick}
          className="w-full bg-transparent hover:bg-white/5 text-zinc-300 border border-white/10 py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Continuar sem conta
        </button>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-zinc-400">
            {isLogin ? 'Ainda não faz parte do coletivo?' : 'Já possui credenciais registradas?'}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="text-yellow-400 font-bold ml-1.5 hover:underline focus:outline-none"
            >
              {isLogin ? 'Cadastre-se agora' : 'Acesse sua conta'}
            </button>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default AuthPage;