# Intruso 🕵️‍♂️

**Intruso** é um jogo de dedução social multijogador local, inspirado em clássicos como *Spyfall* e *Undercover*. Um jogador é o **Intruso** e não sabe a palavra secreta; os outros sabem a palavra e devem descrevê-la sem revelar demasiado. O objetivo do Intruso é passar despercebido, enquanto os outros tentam descobri-lo.

## 🚀 Tecnologias

Este projeto foi desenvolvido com tecnologias web modernas para garantir uma experiência rápida, reativa e visualmente apelativa (PWA).

- **Frontend**: React, Tailwind CSS, Framer Motion (animações), Lucide React (ícones).
- **Backend (Servidor)**: Node.js, Socket.io (comunicação em tempo real).
- **Ferramentas**: Vite, PostCSS.

## ✨ Funcionalidades

- **Multiplayer em Tempo Real**: Joga instantaneamente com amigos na mesma rede Wi-Fi.
- **Temas Imersivos**: Escolhe entre vários temas visuais, incluindo o novo modo **Natal** com neve a cair! 🎄❄️
- **PWA Instalável**: Instala o jogo como uma APP nativa no teu telemóvel (Android/iOS) para uma experiência de ecrã inteiro.
- **Votação Inteligente**: Sistema de votação com rondas de desempate (Runoff).
- **Sem Anúncios**: 100% gratuito e focado na diversão.

## 📱 Como Jogar

1. **Criar Sala**: Um jogador ("Anfitrião") cria uma sala e escolhe as definições (Tema, Rondas, Dificuldade).
2. **Entrar na Sala**: Os outros jogadores entram na sala usando o código de 6 dígitos gerado.
3. **Descobrir a Função**: No início, cada jogador recebe a sua função:
    - **Civis**: Vêem a palavra secreta (ex: "Pizza").
    - **Intruso**: Vê apenas "TU ÉS O INTRUSO".
4. **Descrever**: À vez, cada jogador dá uma dica de uma só palavra relacionada com a palavra secreta.
5. **Votação**: Após as rondas, todos votam em quem acham que é o Intruso.
    - Se o Intruso for o mais votado, os Civis ganham!
    - Se o Intruso não for descoberto, ele ganha!

## 🛠️ Instalação Local

Para correr o jogo no teu computador:

1. **Clonar o repositórios**
   ```bash
   git clone https://github.com/teu-utilizador/intruso.git
   cd intruso
   ```

2. **Instalar Dependências**
   ```bash
   npm install
   ```

3. **Iniciar Servidor e Cliente**
   ```bash
   npm run game
   ```
   Isto irá iniciar o servidor na porta `3001` e o cliente Vite na `5173`.

4. **Jogar na Rede Local**
   O comando acima expõe o jogo na tua rede Wi-Fi local. Procura no terminal pelo endereço "Network" (ex: `http://192.168.1.5:5173`) e abre esse link nos smartphones dos teus amigos!

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença [MIT](LICENSE).
