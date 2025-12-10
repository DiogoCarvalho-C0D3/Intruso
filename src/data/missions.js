export const MISSIONS = [
    {
        id: 'novice',
        title: 'Novato',
        description: 'Joga o teu primeiro jogo',
        target: 1,
        statKey: 'totalGames',
        reward: { id: 'frame_novice', name: 'Iniciado', frameClass: 'ring-2 ring-slate-500 ring-offset-2 ring-offset-slate-900', type: 'frame' }
    },
    {
        id: 'veteran',
        title: 'Veterano',
        description: 'Joga 10 jogos',
        target: 10,
        statKey: 'totalGames',
        reward: { id: 'frame_veteran', name: 'Prata de Lei', frameClass: 'border-4 border-double border-slate-300 shadow-[0_0_10px_rgba(203,213,225,0.4)]', type: 'frame' }
    },
    {
        id: 'winner',
        title: 'Vencedor',
        description: 'Ganha 5 jogos',
        target: 5,
        statKey: 'totalWins',
        reward: { id: 'frame_winner', name: 'Glória Dourada', frameClass: 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-yellow-900/50 shadow-[0_0_20px_rgba(250,204,21,0.6)]', type: 'frame' }
    },
    {
        id: 'detective',
        title: 'Detetive',
        description: 'Ganha como Civil 3 vezes',
        target: 3,
        statKey: 'wins.citizen',
        reward: { id: 'frame_detective', name: 'Radar High-Tech', frameClass: 'border-2 border-dashed border-blue-400 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.5)]', type: 'frame' }
    },
    {
        id: 'master_deceiver',
        title: 'Mestre do Engano',
        description: 'Ganha como Intruso 3 vezes',
        target: 3,
        statKey: 'wins.impostor',
        reward: { id: 'frame_impostor', name: 'Ameaça Vermelha', frameClass: 'ring-4 ring-red-600 border-2 border-black border-dotted shadow-[0_0_20px_rgba(220,38,38,0.7)]', type: 'frame' }
    },
    {
        id: 'christmas_spirit',
        title: 'Espírito Natalício',
        description: 'Joga um jogo com o tema de Natal',
        target: 1,
        statKey: 'categories.Natal',
        reward: { id: 'frame_xmas', name: 'Festivo', frameClass: 'ring-4 ring-green-600 border-4 border-red-500 border-dashed shadow-lg', type: 'frame' }
    },
    {
        id: 'bunny',
        title: 'Saltitão',
        description: 'Ganha no mapa Animais',
        target: 1,
        statKey: 'categories.Animais',
        reward: { id: 'frame_nature', name: 'Selvagem', frameClass: 'border-4 border-emerald-400 border-dotted ring-2 ring-emerald-600 ring-offset-2 ring-offset-emerald-900/20', type: 'frame' }
    }
];

export const REWARDS_MAP = MISSIONS.reduce((acc, m) => {
    acc[m.reward.id] = m.reward;
    return acc;
}, {});
