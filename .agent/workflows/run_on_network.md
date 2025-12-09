---
description: Como executar o jogo na rede local para acesso via smartphones
---
Para permitir que outros dispositivos (smartphones, tablets) na mesma rede Wi-Fi acedam ao jogo, deve iniciar o servidor com a opção `--host`.

1. Execute o seguinte comando no terminal:
```bash
npm run dev -- --host
```

2. O terminal irá mostrar endereços de rede, por exemplo:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.105:5173/
```

3. Nos smartphones, abra o browser e digite o endereço **Network** (ex: `http://192.168.1.105:5173`).

> [!WARNING]
> **Nota Importante sobre Multijogador**:
> Como este jogo foi configurado para guardar dados **localmente** (no navegador), dispositivos diferentes **não partilharão o mesmo estado do jogo**.
> 
> Isto significa que:
> - Se abrir em 2 abas no **mesmo** computador, funciona (partilham o LocalStorage).
> - Se abrir em 2 telemóveis diferentes, eles **não se conseguirão ver** um ao outro.
> 
> Para jogar em telemóveis diferentes, seria necessário um servidor real (backend) ou uma implementação P2P mais complexa, o que sairia do âmbito de "dados guardados localmente". 
> 
> **Para jogar agora**: A melhor forma é usar o modo "Passar o dispositivo" ou usar apenas um tablet/PC central onde todos vêm as suas rondas (abrindo várias abas/janelas anónimas).
