
// Helper to create words with difficulty
const w = (word, difficulty = 'medium') => ({ word, difficulty });

export const CATEGORIES = {
    'Geral': [
        w('Cadeira', 'easy'), w('Telemóvel', 'easy'), w('Piano', 'medium'), w('Elefante', 'easy'),
        w('Pizza', 'easy'), w('Praia', 'easy'), w('Futebol', 'easy'), w('Lisboa', 'medium'),
        w('Microondas', 'medium'), w('Abajur', 'hard'), w('Desenho', 'medium'), w('Espelho', 'medium'),
        w('Carro', 'easy'), w('Árvore', 'easy'), w('Livro', 'easy'), w('Computador', 'easy'),
        w('Mesa', 'easy'), w('Caneta', 'easy'), w('Relógio', 'easy'), w('Sapato', 'easy'),
        w('Guitarra', 'medium'), w('Violino', 'medium'), w('Bicicleta', 'easy'), w('Avião', 'easy'),
        w('Camião', 'medium'), w('Autocarro', 'medium'), w('Janela', 'easy'), w('Porta', 'easy'),
        w('Chave', 'easy'), w('Mochila', 'easy'), w('Caderno', 'easy'), w('Lápis', 'easy'),
        w('Borracha', 'easy'), w('Tesoura', 'easy'), w('Cola', 'easy'), w('Papel', 'easy'),
        w('Estojo', 'easy'), w('Régua', 'medium'), w('Garrafa', 'easy'), w('Copo', 'easy'),
        w('Prato', 'easy'), w('Garfo', 'easy'), w('Faca', 'easy'), w('Colher', 'easy'),
        w('Guardanapo', 'medium'), w('Toalha', 'easy'), w('Lençol', 'medium'), w('Travesseiro', 'medium'),
        w('Colchão', 'hard'), w('Cobertor', 'medium'), w('Tapete', 'medium'), w('Cortina', 'medium'),
        w('Sofá', 'easy'), w('Poltrona', 'medium'), w('Estante', 'medium'), w('Armário', 'medium'),
        w('Gaveta', 'medium'), w('Lâmpada', 'medium'), w('Tomada', 'hard'), w('Interruptor', 'hard'),
        w('Ventoinha', 'medium'), w('Aquecedor', 'medium'), w('Ar Condicionado', 'hard'), w('Frigorífico', 'medium'),
        w('Congelador', 'medium'), w('Fogão', 'easy'), w('Forno', 'easy'), w('Torradeira', 'medium'),
        w('Batedeira', 'medium'), w('Liquidificador', 'hard'), w('Máquina de Café', 'medium'), w('Ferro de Engomar', 'hard')
    ],
    'Animais': [
        w('Cão', 'easy'), w('Gato', 'easy'), w('Papagaio', 'medium'), w('Tigre', 'medium'),
        w('Tubarão', 'medium'), w('Águia', 'medium'), w('Formiga', 'hard'), w('Elefante', 'easy'),
        w('Girafa', 'medium'), w('Leão', 'medium'), w('Ornitorrinco', 'hard'), w('Camaleão', 'hard'),
        w('Pinguim', 'medium'), w('Coelho', 'easy'), w('Cavalo', 'easy'), w('Vaca', 'easy'),
        w('Porco', 'easy'), w('Ovelha', 'easy'), w('Cabra', 'easy'), w('Galinha', 'easy'),
        w('Pato', 'easy'), w('Ganso', 'medium'), w('Peru', 'medium'), w('Coelho', 'easy'),
        w('Hamster', 'medium'), w('Porquinho da Índia', 'hard'), w('Rato', 'easy'), w('Esquilo', 'medium'),
        w('Raposa', 'medium'), w('Lobo', 'medium'), w('Urso', 'easy'), w('Panda', 'easy'),
        w('Canguru', 'medium'), w('Coala', 'medium'), w('Macaco', 'easy'), w('Gorila', 'medium'),
        w('Chimpanzé', 'hard'), w('Zebra', 'medium'), w('Rinoceronte', 'medium'), w('Hipopótamo', 'medium'),
        w('Crocodilo', 'medium'), w('Jacaré', 'medium'), w('Cobra', 'easy'), w('Lagarto', 'medium'),
        w('Tartaruga', 'medium'), w('Sapo', 'easy'), w('Rã', 'medium'), w('Peixe', 'easy'),
        w('Baleia', 'medium'), w('Golfinho', 'medium'), w('Foca', 'medium'), w('Morsa', 'hard'),
        w('Polvo', 'medium'), w('Lula', 'medium'), w('Caranguejo', 'medium'), w('Lagosta', 'hard'),
        w('Camarão', 'medium'), w('Estrela do Mar', 'hard'), w('Abelha', 'easy'), w('Borboleta', 'easy'),
        w('Mosca', 'easy'), w('Mosquito', 'easy'), w('Aranha', 'easy'), w('Escorpião', 'hard'),
        w('Barata', 'medium'), w('Grilo', 'medium'), w('Gafanhoto', 'hard'), w('Joaninha', 'medium')
    ],
    'Comida': [
        w('Francesinha', 'medium'), w('Bacalhau', 'medium'), w('Pastel de Nata', 'medium'),
        w('Hambúrguer', 'easy'), w('Sushi', 'medium'), w('Gelado', 'easy'), w('Arroz de Pato', 'hard'),
        w('Sopa', 'easy'), w('Esparguete', 'medium'), w('Ovo', 'easy'), w('Croissant', 'medium'),
        w('Lasanha', 'medium'), w('Pão', 'easy'), w('Queijo', 'easy'), w('Fiambre', 'easy'),
        w('Manteiga', 'easy'), w('Doce', 'medium'), w('Mel', 'easy'), w('Iogurte', 'medium'),
        w('Leite', 'easy'), w('Café', 'easy'), w('Chá', 'easy'), w('Sumo', 'easy'),
        w('Água', 'easy'), w('Vinho', 'medium'), w('Cerveja', 'medium'), w('Refrigerante', 'medium'),
        w('Bolo', 'easy'), w('Bolacha', 'easy'), w('Chocolate', 'easy'), w('Bombom', 'medium'),
        w('Pudim', 'medium'), w('Mousse', 'medium'), w('Gelatina', 'easy'), w('Fruta', 'easy'),
        w('Maçã', 'easy'), w('Banana', 'easy'), w('Laranja', 'easy'), w('Pera', 'easy'),
        w('Uva', 'easy'), w('Morangos', 'easy'), w('Ananás', 'medium'), w('Melancia', 'medium'),
        w('Melão', 'medium'), w('Kiwi', 'medium'), w('Manga', 'medium'), w('Limão', 'easy'),
        w('Alface', 'easy'), w('Tomate', 'easy'), w('Pepino', 'easy'), w('Cenoura', 'easy'),
        w('Batata', 'easy'), w('Cebola', 'medium'), w('Alho', 'medium'), w('Pimento', 'medium'),
        w('Brócolos', 'medium'), w('Couve', 'medium'), w('Ervilhas', 'medium'), w('Milho', 'easy'),
        w('Feijão', 'medium'), w('Grão', 'medium'), w('Lentilhas', 'hard'), w('Arroz', 'easy'),
        w('Massa', 'easy'), w('Carne', 'easy'), w('Peixe', 'easy'), w('Frango', 'easy')
    ],
    'Lugares': [
        w('Escola', 'easy'), w('Hospital', 'easy'), w('Aeroporto', 'medium'), w('Cinema', 'easy'),
        w('Praia', 'easy'), w('Montanha', 'medium'), w('Supermercado', 'easy'), w('Biblioteca', 'medium'),
        w('Ginásio', 'medium'), w('Museu', 'medium'), w('Farmácia', 'medium'), w('Zoo', 'easy'),
        w('Parque', 'easy'), w('Jardim', 'easy'), w('Floresta', 'medium'), w('Deserto', 'medium'),
        w('Rio', 'easy'), w('Lago', 'easy'), w('Mar', 'easy'), w('Oceano', 'medium'),
        w('Ilha', 'easy'), w('Vulcão', 'hard'), w('Caverna', 'medium'), w('Cidade', 'easy'),
        w('Aldeia', 'easy'), w('Campo', 'easy'), w('Quinta', 'medium'), w('Castelo', 'medium'),
        w('Palácio', 'medium'), w('Torre', 'medium'), w('Ponte', 'easy'), w('Túnel', 'medium'),
        w('Estrada', 'easy'), w('Autoestrada', 'medium'), w('Rua', 'easy'), w('Avenida', 'medium'),
        w('Praça', 'medium'), w('Estádio', 'medium'), w('Pavilhão', 'medium'), w('Piscina', 'easy'),
        w('Restaurante', 'medium'), w('Café', 'medium'), w('Bar', 'easy'), w('Discoteca', 'medium'),
        w('Hotel', 'medium'), w('Banco', 'medium'), w('Correios', 'medium'), w('Esquadra', 'hard'),
        w('Bombeiros', 'medium'), w('Igreja', 'medium'), w('Catedral', 'hard'), w('Cemitério', 'hard'),
        w('Laboratório', 'hard'), w('Fábrica', 'medium'), w('Escritório', 'medium'), w('Loja', 'easy')
    ],
    'Objetos': [
        w('Garfo', 'easy'), w('Relógio', 'medium'), w('Almofada', 'medium'), w('Chaves', 'easy'),
        w('Óculos', 'medium'), w('Caneta', 'easy'), w('Copo', 'easy'), w('Sapato', 'easy'),
        w('Comando', 'medium'), w('Carregador', 'medium'), w('Guardanapo', 'hard'), w('Tesoura', 'medium'),
        w('Martelo', 'medium'), w('Chave de Fendas', 'hard'), w('Serrote', 'medium'), w('Alicate', 'hard'),
        w('Prego', 'medium'), w('Parafuso', 'medium'), w('Porca', 'hard'), w('Anilha', 'hard'),
        w('Fita Métrica', 'hard'), w('Nível', 'hard'), w('Berbequim', 'hard'), w('Lixa', 'hard'),
        w('Pincel', 'medium'), w('Rolo', 'medium'), w('Balde', 'easy'), w('Esfregona', 'medium'),
        w('Vassoura', 'easy'), w('Pá', 'easy'), w('Aspirador', 'medium'), w('Ferro', 'medium'),
        w('Tábua', 'medium'), w('Estendal', 'medium'), w('Mola', 'medium'), w('Cesto', 'medium'),
        w('Caixa', 'easy'), w('Saco', 'easy'), w('Mala', 'easy'), w('Carteira', 'medium'),
        w('Moeda', 'easy'), w('Nota', 'easy'), w('Cartão', 'easy'), w('Bilhete', 'medium'),
        w('Passaporte', 'medium'), w('Revista', 'medium'), w('Jornal', 'medium'), w('Carta', 'easy'),
        w('Envelope', 'medium'), w('Selo', 'hard'), w('Postal', 'medium'), w('Pacote', 'medium'),
        w('Presente', 'easy'), w('Laço', 'medium'), w('Fita', 'medium'), w('Agulha', 'hard'),
        w('Linha', 'medium'), w('Botão', 'medium'), w('Fecho', 'hard'), w('Alfinete', 'hard')
    ],
    'Desporto': [
        w('Futebol', 'easy'), w('Basquetebol', 'medium'), w('Ténis', 'medium'), w('Natação', 'easy'),
        w('Ciclismo', 'medium'), w('Voleibol', 'medium'), w('Surf', 'medium'), w('Golfe', 'hard'),
        w('Boxe', 'medium'), w('Rugby', 'hard'), w('Atletismo', 'medium'), w('Judo', 'hard'),
        w('Andebol', 'medium'), w('Hóquei', 'medium'), w('Badminton', 'hard'), w('Ténis de Mesa', 'medium'),
        w('Ginástica', 'medium'), w('Esgrima', 'hard'), w('Karaté', 'medium'), w('Taekwondo', 'hard'),
        w('Luta Livre', 'hard'), w('Halterofilismo', 'hard'), w('Remo', 'hard'), w('Canoagem', 'hard'),
        w('Vela', 'hard'), w('Mergulho', 'medium'), w('Polo Aquático', 'hard'), w('Triatlo', 'hard'),
        w('Maratona', 'medium'), w('Escalada', 'medium'), w('Skate', 'medium'), w('Patins', 'medium'),
        w('Fórmula 1', 'medium'), w('MotoGP', 'medium'), w('Rali', 'medium'), w('Karting', 'medium'),
        w('Basebol', 'hard'), w('Futebol Americano', 'hard'), w('Críquete', 'hard'), w('Snooker', 'medium'),
        w('Dardos', 'medium'), w('Bowling', 'medium'), w('Xadrez', 'medium'), w('Pesca', 'medium'),
        w('Caça', 'hard'), w('Equitação', 'medium'), w('Tiro com Arco', 'hard'), w('Tiro', 'hard')
    ],
    'Profissões': [
        w('Médico', 'easy'), w('Professor', 'easy'), w('Bombeiro', 'easy'), w('Polícia', 'easy'),
        w('Cozinheiro', 'medium'), w('Carpinteiro', 'hard'), w('Astronauta', 'medium'), w('Pintor', 'easy'),
        w('Juiz', 'hard'), w('Pescador', 'medium'), w('Enfermeiro', 'medium'), w('Advogado', 'hard'),
        w('Dentista', 'medium'), w('Veterinário', 'medium'), w('Farmacêutico', 'hard'), w('Psicólogo', 'hard'),
        w('Arquiteto', 'medium'), w('Engenheiro', 'medium'), w('Eletricista', 'medium'), w('Canalizador', 'medium'),
        w('Mecânico', 'medium'), w('Motorista', 'medium'), w('Piloto', 'medium'), w('Carteiro', 'medium'),
        w('Jardineiro', 'medium'), w('Agricultor', 'medium'), w('Padeiro', 'medium'), w('Talhante', 'hard'),
        w('Empregado de Mesa', 'medium'), w('Rececionista', 'hard'), w('Secretária', 'medium'), w('Contabilista', 'hard'),
        w('Jornalista', 'medium'), w('Fotógrafo', 'medium'), w('Músico', 'easy'), w('Ator', 'easy'),
        w('Cantor', 'easy'), w('Dançarino', 'easy'), w('Escritor', 'medium'), w('Pintor', 'easy'),
        w('Escultor', 'hard'), w('Designer', 'medium'), w('Programador', 'medium'), w('Cientista', 'medium'),
        w('Político', 'medium'), w('Soldado', 'medium'), w('Padre', 'medium'), w('Freira', 'hard')
    ],
    'Cinema': [
        w('Titanic', 'easy'), w('Star Wars', 'easy'), w('Harry Potter', 'easy'), w('Matrix', 'medium'),
        w('Rei Leão', 'easy'), w('Joker', 'medium'), w('Avatar', 'medium'), w('Avengers', 'medium'),
        w('Shrek', 'easy'), w('Toy Story', 'easy'), w('Batman', 'medium'), w('Inception', 'hard'),
        w('O Padrinho', 'hard'), w('Pulp Fiction', 'hard'), w('Forrest Gump', 'medium'), w('Gladiador', 'medium'),
        w('O Senhor dos Anéis', 'medium'), w('Piratas das Caraíbas', 'medium'), w('Jurassic Park', 'medium'), w('Indiana Jones', 'medium'),
        w('007', 'medium'), w('Missão Impossível', 'medium'), w('Velocidade Furiosa', 'medium'), w('Transformers', 'medium'),
        w('Homem-Aranha', 'easy'), w('Super-Homem', 'easy'), w('Wonder Woman', 'medium'), w('Black Panther', 'medium'),
        w('Frozen', 'easy'), w('Vaiana', 'medium'), w('Coco', 'medium'), w('Divertida-mente', 'medium'),
        w('Up', 'medium'), w('Wall-E', 'medium'), w('Nemo', 'easy'), w('Dory', 'easy'),
        w('Mulan', 'medium'), w('Aladdin', 'medium'), w('A Pequena Sereia', 'medium'), w('A Bela e o Monstro', 'medium'),
        w('Cinderela', 'easy'), w('Branca de Neve', 'easy'), w('Bambi', 'easy'), w('Dumbo', 'easy'),
        w('Pinóquio', 'easy'), w('Peter Pan', 'easy'), w('Alice no País das Maravilhas', 'hard'), w('Mágico de Oz', 'hard')
    ],
    'Tecnologia': [
        w('iPhone', 'easy'), w('Computador', 'easy'), w('Internet', 'easy'), w('Robot', 'medium'),
        w('Drone', 'medium'), w('Bluetooth', 'hard'), w('Wi-Fi', 'medium'), w('Tablet', 'easy'),
        w('Teclado', 'medium'), w('Rato', 'easy'), w('Ecran', 'medium'), w('Bateria', 'medium'),
        w('Câmara', 'easy'), w('Impressora', 'medium'), w('Scanner', 'hard'), w('Projetor', 'medium'),
        w('Microfone', 'medium'), w('Colunas', 'medium'), w('Auscultadores', 'medium'), w('Auriculares', 'medium'),
        w('Smartwatch', 'medium'), w('GPS', 'medium'), w('USB', 'hard'), w('HDMI', 'hard'),
        w('Cabo', 'easy'), w('Ficha', 'medium'), w('Router', 'hard'), w('Servidor', 'hard'),
        w('Disco Rígido', 'hard'), w('Placa Gráfica', 'hard'), w('Processador', 'hard'), w('Memória RAM', 'hard'),
        w('Software', 'medium'), w('Hardware', 'medium'), w('App', 'easy'), w('Site', 'easy'),
        w('Email', 'easy'), w('Chat', 'easy'), w('Vídeo Chamada', 'medium'), w('Rede Social', 'medium'),
        w('Facebook', 'easy'), w('Instagram', 'easy'), w('Twitter', 'easy'), w('TikTok', 'easy'),
        w('YouTube', 'easy'), w('Google', 'easy'), w('Amazon', 'medium'), w('Spotify', 'medium')
    ],
    'Países': [
        w('Portugal', 'easy'), w('Brasil', 'easy'), w('Espanha', 'easy'), w('França', 'easy'),
        w('Itália', 'medium'), w('Japão', 'medium'), w('China', 'medium'), w('Estados Unidos', 'easy'),
        w('Alemanha', 'medium'), w('Rússia', 'medium'), w('Austrália', 'medium'), w('Egito', 'hard'),
        w('Índia', 'medium'), w('México', 'medium'), w('Canadá', 'medium'), w('Reino Unido', 'medium'),
        w('Irlanda', 'medium'), w('Suíça', 'medium'), w('Grécia', 'medium'), w('Turquia', 'medium'),
        w('Holanda', 'medium'), w('Bélgica', 'medium'), w('Suécia', 'medium'), w('Noruega', 'medium'),
        w('Dinamarca', 'medium'), w('Finlândia', 'medium'), w('Polónia', 'medium'), w('Ucrânia', 'medium'),
        w('Roménia', 'hard'), w('Bulgária', 'hard'), w('Hungria', 'hard'), w('Áustria', 'medium'),
        w('República Checa', 'hard'), w('Croácia', 'medium'), w('Sérvia', 'hard'), w('Marrocos', 'medium'),
        w('África do Sul', 'medium'), w('Angola', 'medium'), w('Moçambique', 'medium'), w('Cabo Verde', 'medium'),
        w('Guiné-Bissau', 'hard'), w('São Tomé e Príncipe', 'hard'), w('Timor-Leste', 'hard'), w('Argentina', 'medium'),
        w('Chile', 'medium'), w('Peru', 'medium'), w('Colômbia', 'medium'), w('Venezuela', 'medium')
    ],
    'Marcas': [
        w('Coca-Cola', 'easy'), w('Nike', 'easy'), w('Apple', 'easy'), w('McDonalds', 'easy'),
        w('IKEA', 'medium'), w('Mercedes', 'medium'), w('Adidas', 'medium'), w('Zara', 'medium'),
        w('Netflix', 'easy'), w('Google', 'medium'), w('Disney', 'easy'), w('Samsung', 'medium'),
        w('Toyota', 'medium'), w('BMW', 'medium'), w('Audi', 'medium'), w('Volkswagen', 'medium'),
        w('Ford', 'medium'), w('Honda', 'medium'), w('Tesla', 'medium'), w('Ferrari', 'hard'),
        w('Lamborghini', 'hard'), w('Porsche', 'hard'), w('Sony', 'medium'), w('Nintendo', 'medium'),
        w('PlayStation', 'medium'), w('Xbox', 'medium'), w('Microsoft', 'medium'), w('HP', 'medium'),
        w('Dell', 'medium'), w('Canon', 'medium'), w('Nikon', 'medium'), w('GoPro', 'hard'),
        w('Rolex', 'hard'), w('Gucci', 'hard'), w('Prada', 'hard'), w('Louis Vuitton', 'hard'),
        w('Chanel', 'hard'), w('H&M', 'medium'), w('Primark', 'medium'), w('Pull&Bear', 'medium'),
        w('Bershka', 'medium'), w('Stradivarius', 'medium'), w('Massimo Dutti', 'hard'), w('Fnac', 'medium'),
        w('Worten', 'medium'), w('Continente', 'medium'), w('Pingo Doce', 'medium'), w('Lidl', 'medium')
    ]
};

// Map difficulty levels to numeric values for "minimum difficulty" comparison
const DIFF_LEVELS = { 'easy': 1, 'medium': 2, 'hard': 3 };

export const getRandomWord = (categoryNames, minDifficulty = 'easy', customDecks = []) => {
    // If string, convert to array for backward compatibility
    const categories = Array.isArray(categoryNames) ? categoryNames : [categoryNames];

    // Requested difficulty level value
    const reqLevel = DIFF_LEVELS[minDifficulty] || 1;

    // Aggregate all words from selected categories matching criteria
    let pool = [];
    // Requests from Custom Decks
    // customDecks is array of { name, words: [] }
    categories.forEach(cat => {
        // 1. Check Standard Categories
        if (CATEGORIES[cat]) {
            CATEGORIES[cat].forEach(item => {
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
        // 2. Check Custom Decks
        else if (customDecks && customDecks.length > 0) {
            const deck = customDecks.find(d => d.name === cat); // Match by name (unique enough for UI)
            if (deck) {
                deck.words.forEach(word => {
                    pool.push({ word, category: cat }); // Custom words don't have difficulty, always include
                });
            }
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
