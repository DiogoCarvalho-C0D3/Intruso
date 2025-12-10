export const MISSIONS = [
    {
        id: 'novice',
        title: 'Novato',
        description: 'Joga o teu primeiro jogo',
        target: 1,
        statKey: 'totalGames',
        reward: { id: 'cap', emoji: '🧢', name: 'Boné' }
    },
    {
        id: 'veteran',
        title: 'Veterano',
        description: 'Joga 10 jogos',
        target: 10,
        statKey: 'totalGames',
        reward: { id: 'tophat', emoji: '🎩', name: 'Cartola' }
    },
    {
        id: 'winner',
        title: 'Vencedor',
        description: 'Ganha 5 jogos',
        target: 5,
        statKey: 'totalWins', // We'll need to compute this derived stat
        reward: { id: 'crown', emoji: '👑', name: 'Coroa' }
    },
    {
        id: 'detective',
        title: 'Detetive',
        description: 'Ganha como Civil 3 vezes',
        target: 3,
        statKey: 'wins.citizen',
        reward: { id: 'spy', emoji: '🕵️‍♂️', name: 'Detetive' }
    },
    {
        id: 'master_deceiver',
        title: 'Mestre do Engano',
        description: 'Ganha como Intruso 3 vezes',
        target: 3,
        statKey: 'wins.impostor',
        reward: { id: 'mask', emoji: '🎭', name: 'Máscara' }
    },
    {
        id: 'christmas_spirit',
        title: 'Espírito Natalício',
        description: 'Joga um jogo com o tema de Natal (Dezembro)',
        target: 1,
        statKey: 'categories.Natal', // Assuming 'Natal' might be a category or special condition
        reward: { id: 'santa', emoji: '🎅', name: 'Pai Natal' }
    },
    {
        id: 'bunny',
        title: 'Saltitão',
        description: 'Ganha no mapa Animais',
        target: 1,
        statKey: 'categories.Animais',
        reward: { id: 'ears', emoji: '🐰', name: 'Coelho' }
    }
];

export const REWARDS_MAP = MISSIONS.reduce((acc, m) => {
    acc[m.reward.id] = m.reward;
    return acc;
}, {});
