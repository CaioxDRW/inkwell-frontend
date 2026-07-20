import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Download, Share2, FolderPlus, MoreVertical, Edit2, Trash2, FolderOpen, Image as ImageIcon, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { folderService, favoriteService } from '../services/api';

const SearchPage = ({ defaultTab = 'search', user, onRequireLogin }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [query, setQuery] = useState('Cosmos');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const [favorites, setFavorites] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [folderForm, setFolderForm] = useState({ name: '', bio: '', coverUrl: '' });
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const PIXABAY_KEY = '55776323-c8cba9183afe7d24e91a23522';
  const UNSPLASH_ACCESS_KEY = 'FhOCls9bwnWqdzFheurysg_PdoTom_YbVTEHPmG6fgA'; 
  const GIPHY_KEY = 'aQc8y7EIRgAeQkYr4N2Mi1dFfbqLPPhf';
  const SHUTTERSTOCK_AUTH = 'U3NxZGN6dkhBWXdqbHphRzhEckhqV1JQdkdKQmI4Zlg6TjcxZ01MbHFjYTZaTWZtTw==';

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
        setIsFolderModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CARREGA OS DADOS DO BACKEND
  useEffect(() => {
    let isMounted = true;
    const loadBackendData = async () => {
      try {
        const [fetchedFolders, fetchedFavorites] = await Promise.all([
          folderService.getFolders(),
          favoriteService.getFavorites()
        ]);
        if (isMounted) {
          setFolders(fetchedFolders || []);
          setFavorites(fetchedFavorites || []);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do banco:", err);
      }
    };
    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  const verifyGuest = () => {
    if (user?.role === 'guest') {
      setShowAuthAlert(true);
      if (onRequireLogin) onRequireLogin();
      return true;
    }
    return false;
  };

  const toggleFavorite = async (item) => {
    if (verifyGuest()) return;
    
    try {
      const isAlreadyFav = favorites.some(fav => fav.uId === item.uId || fav.img === item.img);
      if (isAlreadyFav) {
        setFavorites(prev => prev.filter(fav => fav.uId !== item.uId && fav.img !== item.img));
      } else {
        setFavorites(prev => [...prev, item]);
      }

      const updatedFavorites = await favoriteService.toggleFavorite(item);
      if (updatedFavorites) {
        setFavorites(updatedFavorites);
      }
    } catch (err) {
      console.error("Erro ao alternar favorito:", err);
      const fetchedFavorites = await favoriteService.getFavorites().catch(() => []);
      setFavorites(fetchedFavorites);
    }
  };

  const handleActionCreateFolder = () => {
    if (verifyGuest()) return;
    setEditingFolderId(null); 
    setFolderForm({ name: '', bio: '', coverUrl: '' }); 
    setIsFolderModalOpen(true);
  };

  const handleCreateOrUpdateFolder = async (e) => {
    e.preventDefault();
    if (!folderForm.name.trim()) return;

    try {
      const payload = {
        name: folderForm.name,
        bio: folderForm.bio,
        coverUrl: folderForm.coverUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809'
      };

      const updated = editingFolderId 
        ? await folderService.updateFolder(editingFolderId, payload)
        : await folderService.createFolder(payload);

      setFolders(updated || []);
    } catch (err) {
      console.error("Erro ao salvar/editar pasta:", err);
    }

    setFolderForm({ name: '', bio: '', coverUrl: '' });
    setEditingFolderId(null);
    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    try {
      const updated = await folderService.deleteFolder(id);
      setFolders(updated || []);
      setActiveDropdownId(null);
    } catch (err) {
      console.error("Erro ao deletar pasta:", err);
    }
  };

  const openEditModal = (folder, e) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setFolderForm({ name: folder.name, bio: folder.bio, coverUrl: folder.coverUrl });
    setIsFolderModalOpen(true);
    setActiveDropdownId(null);
  };

  const toggleItemInFolder = async (folderId, item) => {
    if (verifyGuest()) return;
    try {
      const updatedFolders = await folderService.toggleItem(folderId, item);
      setFolders(updatedFolders || []);
      
      if (selectedFolder && selectedFolder.id === folderId) {
        setSelectedFolder(updatedFolders.find(f => f.id === folderId));
      }
    } catch (err) {
      console.error("Erro ao alternar item na pasta:", err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFolderForm(prev => ({ ...prev, coverUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getFilenameFromUrl = (url) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.split('/');
      return path[path.length - 1] || 'image';
    } catch {
      return 'image';
    }
  };

  const handleDownloadImage = async (url) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const fileName = getFilenameFromUrl(url).split('?')[0] || 'image';
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Erro ao baixar imagem:', err);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const setAsFolderCover = async (folderId, imgUrl) => {
    try {
      const folderToUpdate = folders.find(f => f.id === folderId);
      if (folderToUpdate) {
        const updated = await folderService.updateFolder(folderId, {
          ...folderToUpdate,
          coverUrl: imgUrl
        });
        setFolders(updated || []);
      }
    } catch (err) {
      console.error("Erro ao mudar imagem de capa:", err);
    }
  };

  const fetchData = async (searchTerm) => {
    if (!searchTerm) return;
    setLoading(true);

    try {
      const endpoints = [
        `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&limit=12&fields=id,image_id`,
        `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&per_page=12&safesearch=true`,
        `https://api.jikan.moe/v4/anime?q=${searchTerm}&limit=12&sfw=true`,
        `https://images-api.nasa.gov/search?q=${searchTerm}&media_type=image`,
        `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${searchTerm}`,
        `https://openaccess-api.clevelandart.org/api/artworks/?q=${searchTerm}&has_image=1&limit=10`,
        `https://api.europeana.eu/record/v2/search.json?wskey=api2demo&query=${searchTerm}&rows=16&media=true&type=IMAGE`,
        `https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`,
        `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}+incategory:Fine_art&format=json&origin=*&srlimit=8`,
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${searchTerm}&limit=10&rating=g`,
        `https://api.shutterstock.com/v2/images/search?query=${encodeURIComponent(searchTerm)}&per_page=12&view=full&safe_search=true`,
        `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(searchTerm)}&page[limit]=12`,
        `https://ghibliapi.vercel.app/films`,
        `https://graphql.anilist.co`
      ];

      const responses = await Promise.allSettled(
        endpoints.map((url, idx) => {
          if (idx === 10) { 
            return fetch(url, { headers: { 'Authorization': `Basic ${SHUTTERSTOCK_AUTH}` } });
          }
          if (idx === 13) { 
            return fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({
                query: `query ($search: String) { Page(perPage: 12) { media(search: $search, type: ANIME, isAdult: false) { id isAdult coverImage { extraLarge } } } }`,
                variables: { search: searchTerm }
              })
            });
          }
          return fetch(url);
        })
      );

      const data = await Promise.all(
        responses.map(async (res) => (res.status === 'fulfilled' && res.value.ok) ? res.value.json() : null)
      );

      const [
        artic, pixabay, jikan, nasa, met, cleveland, europeana, 
        unsplash, wiki, giphy, shutter, kitsu, ghibli, anilist
      ] = data;

      const normArtic = (artic?.data || []).filter(a => a.image_id).map(a => ({ uId: `artic-${a.id}`, img: `https://www.artic.edu/iiif/2/${a.image_id}/full/843,/0/default.jpg` }));
      const normPixabay = (pixabay?.hits || []).map(img => ({ uId: `pixa-${img.id}`, img: img.largeImageURL }));
      const normJikan = (jikan?.data || []).map(a => ({ uId: `anime-${a.mal_id}`, img: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url }));
      const normNasa = (nasa?.collection?.items || []).slice(0, 10).map(item => ({ uId: `nasa-${item.data[0]?.nasa_id}`, img: item.links?.[0]?.href }));
      
      let normMet = [];
      if (met?.objectIDs) {
        const metObjects = await Promise.all(met.objectIDs.slice(0, 6).map(async (id) => {
          try {
            const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            const obj = res.ok ? await res.json() : null;
            return obj?.primaryImageSmall ? { uId: `met-${id}`, img: obj.primaryImageSmall } : null;
          } catch { return null; }
        }));
        normMet = metObjects.filter(Boolean);
      }

      const normCleveland = (cleveland?.data || []).filter(art => art.images?.web?.url).map(art => ({ uId: `cleveland-${art.id}`, img: art.images.web.url }));
      
      const academicBlacklist = ['universitat', 'universidad', 'trabajo', 'tesis', 'grado', 'pdf', 'text', 'faculty', 'escuela'];
      const normEuropeana = (europeana?.items || [])
        .filter(item => {
          if (!item.edmPreview?.[0]) return false;
          const textStr = `${item.title?.[0]} ${item.dataProvider?.[0]} ${item.edmPreview[0]}`.toLowerCase();
          return !academicBlacklist.some(word => textStr.includes(word));
        })
        .map((item, idx) => ({ uId: `europeana-${idx}-${item.id}`, img: item.edmPreview[0] }));

      const normUnsplash = (unsplash?.results || []).map(img => ({ uId: `unsplash-${img.id}`, img: img.urls?.regular }));
      
      const wikiBlacklist = ['.pdf', 'text', 'book', 'thesis', 'universi', 'document'];
      const normWiki = (wiki?.query?.search || [])
        .filter(item => !wikiBlacklist.some(word => item.title.toLowerCase().includes(word)))
        .map((item, idx) => ({ uId: `wiki-${idx}-${item.pageid}`, img: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(item.title)}?width=1000` }));

      const normGiphy = (giphy?.data || []).map(gif => ({ uId: `giphy-${gif.id}`, img: gif.images?.downsized_large?.url || gif.images?.original?.url }));
      const normShutter = (shutter?.data || []).filter(img => img.assets?.preview?.url).map(img => ({ uId: `shutter-${img.id}`, img: img.assets.preview.url }));
      const normKitsu = (kitsu?.data || []).filter(a => {
        const r = a.attributes?.ageRating?.toUpperCase() || '';
        return a.attributes?.posterImage?.large && r !== 'R18' && r !== 'R';
      }).map(a => ({ uId: `kitsu-${a.id}`, img: a.attributes.posterImage.large }));

      const normGhibli = (ghibli || [])
        .filter(f => f.title.toLowerCase().includes(searchTerm.toLowerCase()) || f.original_title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(f => ({ uId: `ghibli-${f.id}`, img: f.image }));

      const normAnilist = (anilist?.data?.Page?.media || []).filter(item => item.coverImage?.extraLarge && !item.isAdult).map(item => ({ uId: `anilist-${item.id}`, img: item.coverImage.extraLarge }));

      const aestheticFallback = Array.from({ length: 4 }).map((_, idx) => ({
        uId: `loremflickr-${idx}-${searchTerm}`,
        img: `https://loremflickr.com/800/1200/${encodeURIComponent(searchTerm)},art/all?lock=${idx}`
      }));

      const all = [
        ...normArtic, ...normPixabay, ...normJikan, ...normNasa, ...normMet, ...normCleveland, 
        ...normEuropeana, ...normUnsplash, ...normWiki, ...normGiphy, ...normShutter, ...normKitsu, 
        ...normGhibli, ...normAnilist, ...aestheticFallback
      ].filter(item => item?.img && item.img.trim() !== "");

      setResults(all.sort(() => Math.random() - 0.5));
    } catch (err) {
      console.error("Erro no fluxo de busca:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(query); 
  }, []);

  const selectedItem = results.find(i => i.uId === selectedId) || 
                       favorites.find(i => i.uId === selectedId) || 
                       selectedFolder?.items?.find(i => i.uId === selectedId);
  const isSelectedFav = selectedItem && favorites.some(fav => fav.uId === selectedItem.uId || fav.img === selectedItem.img);

  return (
    <div className="max-w-[1800px] mx-auto p-4 space-y-6 text-black dark:text-white">
      {activeTab === 'search' && (
        <>
          <div className="sticky top-0 z-40 py-4 bg-zinc-50/50 dark:bg-black/50 backdrop-blur-md">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                value={query}
                onKeyDown={(e) => e.key === 'Enter' && fetchData(query)} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search all aesthetics (Space, Art, Anime...)" 
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-3 pl-12 pr-4 rounded-xl outline-none text-sm focus:border-zinc-400 dark:focus:border-zinc-600 transition-all" 
              />
              {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-500" size={18} />}
            </div>
          </div>
          {results.length === 0 && !loading ? (
            <p className="text-zinc-400 py-10 text-center">Nenhum resultado de imagem encontrado nas fontes configuradas.</p>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {results.map(item => {
                const isFavoriteItem = favorites.some(fav => fav.uId === item.uId || fav.img === item.img);
                return (
                  <motion.div key={item.uId} layoutId={item.uId} onClick={() => setSelectedId(item.uId)} className="break-inside-avoid relative rounded-xl overflow-hidden cursor-zoom-in group bg-zinc-200 dark:bg-zinc-900">
                    <img 
                      src={item.img} 
                      className="w-full h-auto block group-hover:brightness-75 transition-all duration-300" 
                      loading="lazy"
                      onError={(e) => { const c = e.target.closest('.break-inside-avoid'); if (c) c.style.display = 'none'; }} 
                    />
                    <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                          className={`rounded-full p-2 ${isFavoriteItem ? 'bg-yellow-400 text-black' : 'bg-black/50 text-white hover:bg-black/70'} transition-colors`}
                          aria-label="Favoritar imagem"
                        >
                          <Heart size={18} fill={isFavoriteItem ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDownloadImage(item.img); }}
                          className="rounded-full p-2 bg-black/50 text-white hover:bg-black/70 transition-colors"
                          aria-label="Baixar imagem"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW DE FAVORITOS */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Favoritos Rápidos</h2>
          {favorites.length === 0 ? (
            <p className="text-zinc-400 py-10">Nenhum pin favoritado ainda.</p>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {favorites.map(item => (
                <motion.div key={item.uId} layoutId={item.uId} onClick={() => setSelectedId(item.uId)} className="break-inside-avoid relative rounded-xl overflow-hidden cursor-zoom-in bg-zinc-200">
                  <img src={item.img} className="w-full h-auto block" alt="Favorito" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW DA BIBLIOTECA */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sua Biblioteca</h2>
              <p className="text-sm text-zinc-400">Pastas personalizadas</p>
            </div>
            <button 
              onClick={handleActionCreateFolder}
              className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-500 transition-all"
            >
              <FolderPlus size={16} /> Nova Pasta
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" ref={dropdownRef}>
            {folders.map(folder => (
              <div 
                key={folder.id}
                onClick={() => { setSelectedFolder(folder); setActiveTab('folder-view'); }}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all relative flex flex-col h-[280px]"
              >
                <div className="w-full h-[160px] bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden">
                  <img src={folder.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Capa" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {folder.items?.length || 0} pins
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDropdownId(activeDropdownId === folder.id ? null : folder.id); }}
                    className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-white"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeDropdownId === folder.id && (
                    <div className="absolute right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl w-32 py-1 text-xs overflow-hidden z-20">
                      <button onClick={(e) => openEditModal(folder, e)} className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2 text-zinc-700 dark:text-zinc-200"><Edit2 size={12} /> Editar</button>
                      <button onClick={(e) => handleDeleteFolder(folder.id, e)} className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"><Trash2 size={12} /> Excluir</button>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1">{folder.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{folder.bio || "Sem descrição"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'folder-view' && selectedFolder && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('library')} className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"><FolderOpen size={16} /></button>
            <div>
              <h2 className="text-2xl font-bold">{selectedFolder.name}</h2>
              <p className="text-sm text-zinc-400">{selectedFolder.bio}</p>
            </div>
          </div>

          {!selectedFolder.items || selectedFolder.items.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl text-zinc-400">
              Pasta vazia. Adicione imagens através do preview expandido.
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {selectedFolder.items.map(item => (
                <motion.div key={item.uId} layoutId={item.uId} onClick={() => setSelectedId(item.uId)} className="break-inside-avoid relative rounded-xl overflow-hidden cursor-zoom-in group bg-zinc-200">
                  <img src={item.img} className="w-full h-auto block" alt="Item da pasta" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleItemInFolder(selectedFolder.id, item); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                  >
                    Remover
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL GLOBAL: ADICIONAR / EDITAR PASTA */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[200] p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsFolderModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{editingFolderId ? 'Editar Informações' : 'Criar Nova Pasta'}</h3>
                <button onClick={() => setIsFolderModalOpen(false)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"><X size={18} /></button>
              </div>

              <form onSubmit={handleCreateOrUpdateFolder} className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-400">Nome do Álbum</label>
                  <input type="text" required value={folderForm.name} onChange={(e) => setFolderForm({...folderForm, name: e.target.value})} placeholder="Nome da pasta..." className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-400">Descrição</label>
                  <textarea rows={2} value={folderForm.bio} onChange={(e) => setFolderForm({...folderForm, bio: e.target.value})} placeholder="Descrição..." className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-400">Imagem de Capa</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-xl text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ImageIcon size={14} /> Upload Local
                    </button>
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                    {folderForm.coverUrl && <img src={folderForm.coverUrl} className="w-12 h-12 rounded-lg object-cover border border-zinc-200" alt="Preview" />}
                  </div>
                </div>

                <button type="submit" className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold mt-2 hover:bg-yellow-500 transition-colors">
                  {editingFolderId ? 'Salvar Modificações' : 'Criar Pasta'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedId && selectedItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)} className="fixed inset-0 bg-black/95 z-[100] cursor-zoom-out" />
            <div className="fixed inset-0 flex flex-col items-center justify-center z-[101] p-4 pointer-events-none">
              <motion.div layoutId={selectedId} className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center pointer-events-auto">
                <img src={selectedItem.img} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" alt="View" />

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 flex flex-col items-center gap-3 bg-zinc-900/80 backdrop-blur-lg border border-white/10 p-4 rounded-2xl w-full max-w-xl shadow-2xl text-white">
                  
                  <div className="w-full text-xs border-b border-white/10 pb-3 mb-1 flex flex-col gap-2">
                    <p className="font-semibold text-zinc-400">Adicionar à pasta da biblioteca:</p>
                    <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto">
                      {folders.map(f => {
                        const hasPin = (f.items || []).some(i => i.uId === selectedItem.uId);
                        return (
                          <div key={f.id} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                            <button 
                              onClick={() => toggleItemInFolder(f.id, selectedItem)}
                              className={`px-2 py-1 rounded-lg font-medium transition-colors ${hasPin ? 'bg-yellow-400 text-black' : 'hover:bg-white/10 text-white'}`}
                            >
                              {f.name} {hasPin ? '✓' : ''}
                            </button>
                            <button 
                              onClick={() => setAsFolderCover(f.id, selectedItem.img)}
                              title="Tornar imagem de capa desta pasta"
                              className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            >
                              <ImageIcon size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleFavorite(selectedItem)} className={`p-3 rounded-xl transition-colors ${isSelectedFav ? 'text-yellow-400 bg-yellow-400/10' : 'text-white hover:bg-white/10'}`}>
                        <Heart size={20} fill={isSelectedFav ? "currentColor" : "none"} />
                      </button>
                      <a href={selectedItem.img} download target="_blank" rel="noreferrer" className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors">
                        <Download size={20} />
                      </a>
                      <div className="w-px h-6 bg-white/10 mx-1" />
                      <button 
                        onClick={() => navigator.clipboard.writeText(selectedItem.img)} 
                        className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                        title="Copiar link da imagem"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                    <button onClick={() => setSelectedId(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors">
                      Fechar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;