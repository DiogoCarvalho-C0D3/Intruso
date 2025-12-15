# Intruso 🕵️‍♂️

**Intruso** é um jogo de dedução social multijogador em tempo real, inspirado em clássicos como *Spyfall* e *Undercover*.
Um jogador é o **Intruso** e não sabe a palavra secreta; os outros (Civis) sabem a palavra. O objetivo é descobrir quem mente!

## ✨ Novidades da Versão 1.4 (Identity & Content Update)

*   **🆔 Identidade Persistente**: Cria o teu Agente único (`Nome` + `PIN`). O jogo "lembra-se" de ti, da tua selfie e das tuas estatísticas.
*   **📚 Conteúdo Expandido**: Centenas de novas palavras adicionadas a todas as categorias.
*   **✏️ Oficina de Baralhos**: Cria os teus próprios packs de palavras e joga com amigos.
*   **💾 Cloud Save**: Histórico e conquistas guardados na nuvem (via MongoDB).
*   **🏆 Sistema de Recompensas**: Completa missões para desbloquear molduras exclusivas.
*   **❄️ Temas Dinâmicos**: Inclui modo de Natal e outros temas visuais.

## 🚀 Tecnologias

*   **Frontend**: React, Tailwind CSS, Framer Motion.
*   **Backend**: Node.js, Socket.io.
*   **Base de Dados**: MongoDB (Atlas) ou JSON Local.
*   **Build**: Vite (PWA Support).

## 📱 Como Jogar

1.  **Entrar**: Define o teu nome. Podes adicionar um código `#0000` para recuperar uma conta antiga.
2.  **Lobby**: Cria uma sala ou junta-te a uma existente.
3.  **O Jogo**:
    *   **Civis**: Recebem uma palavra (ex: "Pizza"). Têm de dar dicas subtis.
    *   **Intruso**: Recebe apenas "INTUSO". Tem de fingir que sabe a palavra.
4.  **Votação**: Descubram o impostor antes que o tempo acabe!

## 🛠️ Instalação Local

1.  **Instalar Dependências**
    ```bash
    npm install
    ```

2.  **Iniciar (Dev Mode)**
    ```bash
    npm run game
    ```
    Isto inicia o Servidor e o Cliente Simultaneamente.
    *   Acede a `http://localhost:5173`.
    *   Por defeito, usa uma base de dados local (`server/db.json`).

3.  **Configurar Base de Dados (Opcional)**
    Cria um ficheiro `.env` na raiz do projeto:
    ```env
    MONGO_URI=mongodb+srv://<user>:<pass>@cluster.../dev?appName=MainCluster
    ```
    Isto ativa a persistência na cloud em vez do ficheiro local.

## ☁️ Deploy (Render.com)

O projeto está configurado para correr no Render.com.

### Persistência de Dados
Para garantir que os dados não são apagados quando o servidor reinicia, tens duas opções:

1.  **MongoDB Atlas (Recomendado/Grátis)**:
    *   Cria um cluster gratuito no MongoDB Atlas.
    *   No painel do Render, adiciona uma Environment Variable:
        *   `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster.../intruso?appName=MainCluster`
    *   O jogo deteta a variável e muda automaticamente para o modo MongoDB.

2.  **JSON Local (Efemeridade)**:
    *   Se não configurares nada, o jogo usa um ficheiro temporário. Os dados perdem-se se o servidor reiniciar.
    *   Para persistir ficheiros no Render (sem Mongo), precisarias de um "Persistent Disk" (Pago).

## 📄 Licença
[MIT](LICENSE)
