import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

export default function CustomDecksView() {
    const navigate = useNavigate();
    const { currentUser, updateProfile } = useGame();
    const [editingDeck, setEditingDeck] = useState(null); // null = list, object = editing

    // Redirect if not logged in
    if (!currentUser) {
        navigate('/');
        return null;
    }

    const decks = currentUser.customDecks || [];

    const handleSaveDeck = (deck) => {
        let newDecks;
        if (decks.find(d => d.id === deck.id)) {
            newDecks = decks.map(d => d.id === deck.id ? deck : d);
        } else {
            newDecks = [...decks, deck];
        }
        updateProfile({ customDecks: newDecks });
        setEditingDeck(null);
    };

    const handleDeleteDeck = (deckId) => {
        if (confirm('Tens a certeza que queres apagar este baralho?')) {
            const newDecks = decks.filter(d => d.id !== deckId);
            updateProfile({ customDecks: newDecks });
        }
    };

    const header = (
        <div className="flex items-center gap-4 w-full h-full">
            <button
                onClick={() => editingDeck ? setEditingDeck(null) : navigate('/lobby')}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <ArrowLeft size={24} className="text-skin-text" />
            </button>
            <div className="flex-1">
                <h1 className="text-xl font-black text-skin-text uppercase tracking-widest flex items-center gap-2">
                    <Book size={20} className="text-cyan-400" />
                    {editingDeck ? 'Editar Baralho' : 'Oficina'}
                </h1>
            </div>
        </div>
    );

    return (
        <Layout header={header} className="bg-skin-base flex flex-col h-full">
            <div className="flex-1 p-4">
                <AnimatePresence mode="wait">
                    {editingDeck ? (
                        <DeckEditor
                            key="editor"
                            initialDeck={editingDeck}
                            onSave={handleSaveDeck}
                            onCancel={() => setEditingDeck(null)}
                        />
                    ) : (
                        <DeckList
                            key="list"
                            decks={decks}
                            onEdit={setEditingDeck}
                            onDelete={handleDeleteDeck}
                            onCreate={() => setEditingDeck({ id: uuidv4(), name: '', words: [] })}
                        />
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}

function DeckList({ decks, onEdit, onDelete, onCreate }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
        >
            <div className="bg-skin-card/50 p-4 rounded-xl border border-skin-border text-sm text-skin-muted">
                Cria os teus próprios baralhos de palavras para jogar com amigos!
            </div>

            <div className="grid gap-3">
                {decks.map(deck => (
                    <div key={deck.id} className="bg-skin-card p-4 rounded-xl border border-skin-border flex items-center justify-between group">
                        <div>
                            <div className="font-bold text-skin-text text-lg">{deck.name}</div>
                            <div className="text-xs text-skin-muted">{deck.words.length} palavras</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onEdit(deck)} className="p-2 bg-skin-base rounded-lg text-skin-text hover:text-cyan-400 transition-colors">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => onDelete(deck.id)} className="p-2 bg-skin-base rounded-lg text-skin-text hover:text-red-400 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {decks.length === 0 && (
                <div className="text-center py-10 opacity-50">
                    <p className="text-skin-muted italic">Ainda não tens baralhos.</p>
                </div>
            )}

            <Button onClick={onCreate} className="w-full mt-4 flex items-center justify-center gap-2">
                <Plus size={20} /> Novo Baralho
            </Button>
        </motion.div>
    );
}

function DeckEditor({ initialDeck, onSave, onCancel }) {
    const [name, setName] = useState(initialDeck.name);
    const [words, setWords] = useState(initialDeck.words); // Array of strings
    const [newWord, setNewWord] = useState('');

    const handleAddWord = (e) => {
        e.preventDefault();
        const w = newWord.trim();
        if (w && !words.includes(w)) {
            setWords([...words, w]);
            setNewWord('');
        }
    };

    const removeWord = (w) => {
        setWords(words.filter(word => word !== w));
    };

    const handleSave = () => {
        if (!name.trim()) return alert('Dá um nome ao baralho!');
        if (words.length < 4) return alert('Adiciona pelo menos 4 palavras!');
        onSave({ ...initialDeck, name, words });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 h-full flex flex-col"
        >
            <div className="space-y-2">
                <label className="text-xs font-bold text-skin-muted uppercase tracking-wider">Nome</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-skin-card border border-skin-border p-3 rounded-xl text-skin-text outline-none focus:border-cyan-400 transition-colors font-bold"
                    placeholder="Ex: Filmes da Disney..."
                />
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <label className="text-xs font-bold text-skin-muted uppercase tracking-wider flex justify-between">
                    <span>Palavras ({words.length})</span>
                    <span className="text-[10px] opacity-70">Mínimo 4</span>
                </label>

                <form onSubmit={handleAddWord} className="flex gap-2 mb-2">
                    <input
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        className="flex-1 bg-skin-card border border-skin-border p-2 rounded-xl text-skin-text outline-none focus:border-cyan-400 transition-colors"
                        placeholder="Nova palavra..."
                    />
                    <button type="submit" disabled={!newWord.trim()} className="bg-cyan-500/20 text-cyan-400 p-2 rounded-xl disabled:opacity-50">
                        <Plus size={24} />
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto bg-skin-card/30 rounded-xl border border-skin-border p-2 content-start flex flex-wrap gap-2">
                    {words.map((w, i) => (
                        <div key={i} className="bg-skin-base px-3 py-1.5 rounded-lg border border-skin-border flex items-center gap-2 text-sm animate-in fade-in zoom-in duration-200">
                            <span>{w}</span>
                            <button onClick={() => removeWord(w)} className="text-skin-muted hover:text-red-400"><X size={14} /></button>
                        </div>
                    ))}
                    {words.length === 0 && (
                        <div className="w-full text-center py-10 opacity-30 text-xs italic">
                            Adiciona palavras aqui...
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
                <Button onClick={handleSave} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border-none">
                    <Save size={18} className="mr-2" /> Guardar
                </Button>
            </div>
        </motion.div>
    );
}
