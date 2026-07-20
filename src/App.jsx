import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Library, Search, Mic2, Sun, Moon, X, Info, Bookmark, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import SearchPage from './pages/SearchPage';
import AuthPage from './pages/AuthPage';

const RECOMMENDED_DATA = [
  {
    id: "anime-retro",
    title: "Anime Retro",
    subtitle: "Movimento Artístico",
    img: "https://wallpapercave.com/wp/wp11816032.jpg",
    description: "Uma estética que evoca a nostalgia das animações japonesas dos anos 80 e 90. Caracteriza-se por cores vibrantes, granulação de película e riqueza de detalhes que capturam a essência do anime clássico."
  },
  {
    id: "digital-oil",
    title: "Digital Oil",
    subtitle: "Pintura Digital",
    img: "https://wallpapercave.com/wp/wp11094226.jpg",
    description: "A fusão perfeita entre o clássico e o moderno. Esta técnica utiliza ferramentas digitais para replicar as texturas, camadas e a profundidade visual da pintura a óleo tradicional."
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk",
    subtitle: "Futurismo Distópico",
    img: "https://wallpaperaccess.com/full/6994183.jpg",
    description: "Explora visões de um futuro dominado pela tecnologia e contrastes sociais. O estilo é marcado por ambientes noturnos, chuva constante e paletas de azul, magenta e ciano."
  },
  {
    id: "street-art",
    title: "Street Art",
    subtitle: "Expressão Urbana",
    img: "https://wallpapers.com/images/featured/fundo-de-arte-urbana-ntqctxg87c4jp1nv.jpg",
    description: "Arte vibrante e crua que nasceu das ruas. Inclui técnicas de grafite, stencil e murais que transformam o cenário cinza das cidades em galerias de céu aberto."
  }
];

const SearchSection = () => {
  return (
    <div className="space-y-6 mb-10">
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-zinc-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
        </div>
        <input
          type="text"
          placeholder="O que você quer desenhar ou explorar hoje?"
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-4 pl-12 pr-4 rounded-2xl outline-none 
                     focus:border-yellow-500/50 transition-all text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
};

const Layout = ({ children, toggleTheme, isDarkMode, onLogout, user }) => (
  <div className="flex flex-col md:flex-row h-screen bg-zinc-50 dark:bg-black text-black dark:text-white font-sans transition-colors duration-300">
    <header className="md:hidden w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
            <img src="/inkwell-logo.svg" alt="Inkwell" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-black uppercase tracking-tighter text-sm">INKWELL</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={onLogout} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
            <LogOut size={18} />
          </button>
        </div>
      </div>
      <nav className="mt-3 grid grid-cols-4 gap-2 text-zinc-500 dark:text-zinc-400">
        <Link to="/" className="flex flex-col items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-3 hover:bg-yellow-400/10 transition-colors">
          <Home size={18} />
          <span className="text-[10px] mt-1">Início</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-3 hover:bg-yellow-400/10 transition-colors">
          <Search size={18} />
          <span className="text-[10px] mt-1">Buscar</span>
        </Link>
        <Link to="/library" className="flex flex-col items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-3 hover:bg-yellow-400/10 transition-colors">
          <Library size={18} />
          <span className="text-[10px] mt-1">Biblioteca</span>
        </Link>
        <Link to="/favorites" className="flex flex-col items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-3 hover:bg-yellow-400/10 transition-colors">
          <Bookmark size={18} />
          <span className="text-[10px] mt-1">Favoritos</span>
        </Link>
      </nav>
    </header>

    <aside className="hidden md:flex md:w-64 bg-white dark:bg-zinc-950 p-6 flex-col gap-8 border-r border-zinc-200 dark:border-zinc-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center p-4 shadow-lg">
          <img src="/inkwell-logo.svg" alt="Inkwell" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">INKWELL</h1>
      </div>
      <nav className="space-y-6 flex-grow">
        <Link to="/" className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition group">
          <Home size={22} className="group-hover:text-yellow-500" /> <span className="font-semibold">Início</span>
        </Link>
        <Link to="/search" className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition group">
          <Search size={22} className="group-hover:text-yellow-500" /> <span className="font-semibold">Buscar</span>
        </Link>
        <Link to="/library" className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition group">
          <Library size={22} className="group-hover:text-yellow-500" /> <span className="font-semibold">Sua Biblioteca</span>
        </Link>
        <Link to="/favorites" className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition group">
          <Bookmark size={22} className="group-hover:text-yellow-500" /> <span className="font-semibold">Favoritos</span>
        </Link>
      </nav>

      <div className="flex flex-col gap-2">
        <button onClick={toggleTheme} className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all w-full">
          <span className="text-xs font-bold uppercase">{isDarkMode ? 'Escuro' : 'Claro'}</span>
          {isDarkMode ? <Moon size={18} className="text-yellow-400" /> : <Sun size={18} className="text-orange-500" />}
        </button>
        
        <button onClick={onLogout} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-all w-full text-left">
          <span className="text-xs font-bold uppercase">{(!user || user?.role === 'guest') ? 'Fazer Login' : 'Sair da Conta'}</span>
          <LogOut size={16} />
        </button>
      </div>
    </aside>

    <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-white dark:bg-gradient-to-b dark:from-zinc-900 dark:to-black">
      {children}
    </main>
  </div>
);

const HomePage = ({ user, onRequireLogin }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const selectedItem = RECOMMENDED_DATA.find(item => item.id === selectedId);

  const handleActionClick = (e) => {
    e.stopPropagation(); // Evita disparar cliques indesejados em elementos pais
    if (!user || user?.role === 'guest') {
      setShowAuthAlert(true);
    } else {
      alert('Explorando o estilo com a sua conta ativa!');
    }
  };

  const slides = [
    { title: "Inkwell", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=2000" },
    { title: "Dark Manga", img: "https://images8.alphacoders.com/129/1294983.png" },
    { title: "Cyber art", img: "https://wallpapercave.com/wp/wp9644567.jpg" }
  ];

  return (
    <div className="space-y-12">
      <header className="relative h-96 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-white/5">
        <Swiper modules={[Autoplay, EffectFade, Pagination]} effect="fade" autoplay={{ delay: 5000 }} pagination={{ clickable: true }} loop={true} className="h-full w-full">
          {slides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.img})` }} />
              <div className="absolute inset-0 bg-black/40 z-10" />
              <div className="relative z-20 p-12 h-full flex items-end">
                <div className="backdrop-blur-md bg-white/10 p-8 rounded-3xl max-w-xl">
                  <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white">{slide.title}</h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </header>

      <SearchSection />

      <section className="relative">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold">Recomendados para você</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECOMMENDED_DATA.map((art) => (
            <motion.div
              key={art.id}
              layoutId={art.id}
              onClick={() => setSelectedId(art.id)}
              className="bg-white dark:bg-zinc-900/40 p-4 rounded-[2rem] border border-zinc-200 dark:border-white/5 cursor-pointer group shadow-sm hover:shadow-xl transition-all"
            >
              <motion.div className="aspect-[3/4] rounded-2xl mb-4 overflow-hidden relative shadow-md">
                <motion.img src={art.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                   <Info size={18} />
                </div>
              </motion.div>
              <h4 className="font-bold text-lg">{art.title}</h4>
              <p className="text-sm text-zinc-500">{art.subtitle}</p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedId && selectedItem && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
              />
              <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
                <motion.div 
                  layoutId={selectedId}
                  className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-[3rem] overflow-hidden pointer-events-auto shadow-2xl border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2 h-80 md:h-[500px]">
                      <img src={selectedItem.img} className="w-full h-full object-cover" alt={selectedItem.title} />
                    </div>
                    <div className="md:w-1/2 p-10 flex flex-col justify-center relative">
                      <button onClick={() => setSelectedId(null)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        <X size={28} />
                      </button>
                      <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-2">{selectedItem.subtitle}</span>
                      <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{selectedItem.title}</h2>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">{selectedItem.description}</p>
                      
                      <button 
                        onClick={handleActionClick} 
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                      >
                        <Mic2 size={20} fill="currentColor" /> Explorar estilo
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* ================= MODAL INTERCEPTADOR DE GUEST ================= */}
      <AnimatePresence>
        {showAuthAlert && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthAlert(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 font-sans">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 border border-white/5 w-full max-w-sm rounded-[2rem] p-6 text-center text-white shadow-2xl"
              >
                <div className="w-16 h-16 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-400/20">
                  <Bookmark size={28} />
                </div>
                <h4 className="text-xl font-bold tracking-tight mb-2">Ação Restrita</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Você precisa criar ou acessar uma conta para salvar estilos, sincronizar favoritos e criar seus painéis.
                </p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={onRequireLogin}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3.5 rounded-xl font-bold text-sm transition-all"
                  >
                    Fazer Login / Cadastrar
                  </button>
                  <button 
                    onClick={() => setShowAuthAlert(false)}
                    className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 py-3.5 rounded-xl font-medium text-sm transition-all"
                  >
                    Continuar sem conta
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const savedUser = localStorage.getItem('inkwell_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const isGuest = sessionStorage.getItem('inkwell_guest');
      if (isGuest) setUser({ role: 'guest', name: 'Convidado' });
    }
    setCheckingSession(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.removeItem('inkwell_guest');
    sessionStorage.removeItem('inkwell_guest');
    localStorage.setItem('inkwell_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleContinueAsGuest = () => {
    sessionStorage.setItem('inkwell_guest', 'true');
    setUser({ role: 'guest', name: 'Convidado' });
  };

  const handleLogout = () => {
    localStorage.removeItem('inkwell_user');
    sessionStorage.removeItem('inkwell_guest');
    setUser(null);
  };

  const handleRequireLogin = () => {
    handleLogout();
  };

  if (checkingSession) {
    return (
      <div className="w-full h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onGuestClick={handleContinueAsGuest} />;
  }

  return (
    <BrowserRouter>
      <Layout 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        isDarkMode={isDarkMode}
        onLogout={handleLogout}
        user={user}
      >
        <Routes>
          <Route path="/" element={<HomePage user={user} onRequireLogin={handleRequireLogin} />} />
          <Route path="/search" element={<SearchPage defaultTab="search" user={user} onRequireLogin={handleRequireLogin} />} />
          <Route path="/library" element={<SearchPage defaultTab="library" user={user} onRequireLogin={handleRequireLogin} />} />
          <Route path="/favorites" element={<SearchPage defaultTab="favorites" user={user} onRequireLogin={handleRequireLogin} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;