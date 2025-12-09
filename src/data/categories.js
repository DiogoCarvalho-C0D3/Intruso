
// Helper to create words with difficulty
const w = (word, difficulty = 'medium') => ({ word, difficulty });

export const CATEGORIES = {
    'Geral': [
        w('Cadeira', 'easy'), w('Telemóvel', 'easy'), w('Piano', 'medium'), w('Elefante', 'easy'),
        w('Pizza', 'easy'), w('Praia', 'easy'), w('Futebol', 'easy'), w('Lisboa', 'medium'),
        w('Microondas', 'medium'), w('Abajur', 'hard'), w('Desenho', 'medium'), w('Espelho', 'medium')
    ],
    'Animais': [
        w('Cão', 'easy'), w('Gato', 'easy'), w('Papagaio', 'medium'), w('Tigre', 'medium'),
        w('Tubarão', 'medium'), w('Águia', 'medium'), w('Formiga', 'hard'), w('Elefante', 'easy'),
        w('Girafa', 'medium'), w('Leão', 'medium'), w('Ornitorrinco', 'hard'), w('Camaleão', 'hard'),
        w('Pinguim', 'medium'), w('Coelho', 'easy')
    ],
    'Comida': [
        w('Francesinha', 'medium'), w('Bacalhau', 'medium'), w('Pastel de Nata', 'medium'),
        w('Hambúrguer', 'easy'), w('Sushi', 'medium'), w('Gelado', 'easy'), w('Arroz de Pato', 'hard'),
        w('Sopa', 'easy'), w('Esparguete', 'medium'), w('Ovo', 'easy'), w('Croissant', 'medium'),
        w('Lasanha', 'medium')
    ],
    'Lugares': [
        w('Escola', 'easy'), w('Hospital', 'easy'), w('Aeroporto', 'medium'), w('Cinema', 'easy'),
        w('Praia', 'easy'), w('Montanha', 'medium'), w('Supermercado', 'easy'), w('Biblioteca', 'medium'),
        w('Ginásio', 'medium'), w('Museu', 'medium'), w('Farmácia', 'medium'), w('Zoo', 'easy')
    ],
    'Objetos': [
        w('Garfo', 'easy'), w('Relógio', 'medium'), w('Almofada', 'medium'), w('Chaves', 'easy'),
        w('Óculos', 'medium'), w('Caneta', 'easy'), w('Copo', 'easy'), w('Sapato', 'easy'),
        w('Comando', 'medium'), w('Carregador', 'medium'), w('Guardanapo', 'hard'), w('Tesoura', 'medium')
    ],
    'Desporto': [
        w('Futebol', 'easy'), w('Basquetebol', 'medium'), w('Ténis', 'medium'), w('Natação', 'easy'),
        w('Ciclismo', 'medium'), w('Voleibol', 'medium'), w('Surf', 'medium'), w('Golfe', 'hard'),
        w('Boxe', 'medium'), w('Rugby', 'hard'), w('Atletismo', 'medium'), w('Judo', 'hard')
    ],
    'Profissões': [
        w('Médico', 'easy'), w('Professor', 'easy'), w('Bombeiro', 'easy'), w('Polícia', 'easy'),
        w('Cozinheiro', 'medium'), w('Carpinteiro', 'hard'), w('Astronauta', 'medium'), w('Pintor', 'easy'),
        w('Juiz', 'hard'), w('Pescador', 'medium'), w('Enfermeiro', 'medium'), w('Advogado', 'hard')
    ],
    'Cinema': [
        w('Titanic', 'easy'), w('Star Wars', 'easy'), w('Harry Potter', 'easy'), w('Matrix', 'medium'),
        w('Rei Leão', 'easy'), w('Joker', 'medium'), w('Avatar', 'medium'), w('Avengers', 'medium'),
        w('Shrek', 'easy'), w('Toy Story', 'easy'), w('Batman', 'medium'), w('Inception', 'hard')
    ],
    'Tecnologia': [
        w('iPhone', 'easy'), w('Computador', 'easy'), w('Internet', 'easy'), w('Robot', 'medium'),
        w('Drone', 'medium'), w('Bluetooth', 'hard'), w('Wi-Fi', 'medium'), w('Tablet', 'easy'),
        w('Teclado', 'medium'), w('Rato', 'easy'), w('Ecran', 'medium'), w('Bateria', 'medium')
    ],
    'Países': [
        w('Portugal', 'easy'), w('Brasil', 'easy'), w('Espanha', 'easy'), w('França', 'easy'),
        w('Itália', 'medium'), w('Japão', 'medium'), w('China', 'medium'), w('Estados Unidos', 'easy'),
        w('Alemanha', 'medium'), w('Rússia', 'medium'), w('Austrália', 'medium'), w('Egito', 'hard'),
        w('Índia', 'medium'), w('México', 'medium')
    ],
    'Marcas': [
        w('Coca-Cola', 'easy'), w('Nike', 'easy'), w('Apple', 'easy'), w('McDonalds', 'easy'),
        w('IKEA', 'medium'), w('Mercedes', 'medium'), w('Adidas', 'medium'), w('Zara', 'medium'),
        w('Netflix', 'easy'), w('Google', 'medium'), w('Disney', 'easy'), w('Samsung', 'medium')
    ]
};

// Map difficulty levels to numeric values for "minimum difficulty" comparison
const DIFF_LEVELS = { 'easy': 1, 'medium': 2, 'hard': 3 };

export const getRandomWord = (categoryNames, minDifficulty = 'easy') => {
    // If string, convert to array for backward compatibility
    const categories = Array.isArray(categoryNames) ? categoryNames : [categoryNames];

    // Requested difficulty level value
    const reqLevel = DIFF_LEVELS[minDifficulty] || 1;

    // Aggregate all words from selected categories matching criteria
    let pool = [];
    categories.forEach(cat => {
        if (CATEGORIES[cat]) {
            CATEGORIES[cat].forEach(item => {
                // To allow flexible difficulty, we can include filtering here
                // Logic: "Medium" allows Easy + Medium words? Or exactly Medium?
                // User asked for "Grau de dificuldade". Usually implies "At least easy" or "Around this level".
                // Let's implement EXACT match or Lower? 
                // "Hard" mode should probably exclude "Easy" words?
                // Or maybe "Hard" allows ANY word, but prefers hard ones?
                // Let's implement strict filtering: 
                // Easy = Only Easy.
                // Medium = Easy + Medium.
                // Hard = Medium + Hard.

                const itemLevel = DIFF_LEVELS[item.difficulty];

                let include = false;
                if (minDifficulty === 'easy') include = itemLevel === 1;
                else if (minDifficulty === 'medium') include = itemLevel >= 1 && itemLevel <= 2;
                else if (minDifficulty === 'hard') include = itemLevel >= 2;

                if (include) {
                    pool.push({ word: item.word, category: cat });
                }
            });
        }
    });

    // Fallback if empty (e.g. no hard words in category), allow ALL words from category
    if (pool.length === 0) {
        categories.forEach(cat => {
            if (CATEGORIES[cat]) {
                CATEGORIES[cat].forEach(item => pool.push({ word: item.word, category: cat }));
            }
        });
    }

    // Final Fallback
    if (pool.length === 0) {
        pool = CATEGORIES['Geral'].map(w => ({ word: w.word, category: 'Geral' }));
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
};
