import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { db } from './lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { AddNotebookForm } from './components/AddNotebookForm';
import { NotebookCard } from './components/NotebookCard';
import { SharedView } from './components/SharedView';
import { PublicGallery } from './components/PublicGallery';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function Dashboard() {
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archivingMessage, setArchivingMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'notebooks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setNotebooks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAddSuccess = () => {
    setIsArchiving(true);
    setArchivingMessage('📦 Arquivando novo notebook...');
    setTimeout(() => {
      setIsArchiving(false);
      setIsAdding(false);
    }, 1500);
  };

  const filteredNotebooks = notebooks.filter(nb => {
    const matchesSearch = searchTerm === '' || 
      nb.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nb.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || nb.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(notebooks.map(n => n.category))).filter(Boolean);

  if (loading) {
    return <div className="h-screen bg-[#F5F5F0] flex items-center justify-center">Carregando Gaveta...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <AnimatePresence>
        {isArchiving && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a]/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{archivingMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 w-full bg-[#F5F5F0]/80 backdrop-blur-md border-b z-50 px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a1a1a] rounded-sm flex items-center justify-center text-white italic text-xl">G</div>
            <h1 className="text-xl font-light">Gaveta <span className="italic">Digital</span></h1>
          </div>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-[#5A5A40] text-white p-3 rounded-full">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-8 pb-20">
        {isAdding && (
          <div className="mb-8 max-w-2xl mx-auto">
            <AddNotebookForm onSuccess={handleAddSuccess} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-16">
          <aside>
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  🔍
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar notebooks..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white"
                />
              </div>
            </div>
            <div>
              <button onClick={() => setSelectedCategory(null)} className="w-full text-left px-3 py-2">
                Todas ({notebooks.length})
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className="w-full text-left px-3 py-2">
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {filteredNotebooks.length === 0 && searchTerm ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full text-center py-20"
              >
                <div className="text-6xl mb-4">🔮</div>
                <p className="text-xl italic opacity-50">Nenhum notebook encontrado...</p>
                <p className="text-sm opacity-30 mt-2">Tente outra busca ou arquive novos códigos</p>
              </motion.div>
            ) : (
              filteredNotebooks.map(nb => <NotebookCard key={nb.id} notebook={nb} />)
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/share/:shareId" element={<SharedView />} />
        <Route path="/gallery/:userId" element={<PublicGallery />} />
      </Routes>
    </BrowserRouter>
  );
}