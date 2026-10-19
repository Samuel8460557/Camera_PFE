# Camera_PFE

Aplicação web de captura e processamento de fotografias usando os recursos nativos do navegador.

## Integrantes

- Nome do integrante 1: **[preencha aqui]**
- Nome do integrante 2: **[preencha aqui]**

> Substitua os campos acima pelos nomes dos integrantes da dupla antes de entregar o trabalho.

## Descrição da aplicação

O Camera_PFE permite ligar a câmera do dispositivo, visualizar o vídeo em tempo real e capturar uma fotografia. O usuário informa o nome do aluno e escolhe um filtro visual. A imagem final é processada no navegador e recebe, sobre a própria foto, o nome do aluno e a data e hora da captura. Depois, é possível trocar o filtro da foto capturada e baixar o resultado em formato PNG.

## Recursos utilizados

- **HTML5:** estrutura da página e elementos de interface.
- **CSS3:** estilos, layout responsivo e apresentação visual.
- **JavaScript:** eventos, validações, manipulação do DOM e controle da aplicação.
- **MediaDevices API (`getUserMedia`):** solicita permissão e acessa a câmera do dispositivo.
- **Canvas API (`drawImage`, `filter`, `fillText`):** desenha a fotografia, aplica filtros e grava a identificação na imagem.
- **MediaStream Tracks (`getTracks`, `stop`):** encerra corretamente as faixas do stream quando a câmera é desligada.
- **Blob e `URL.createObjectURL`:** gera e disponibiliza a imagem PNG para visualização e download.

## Filtros disponíveis

- Âmbar (sépia)
- Preto e branco
- Cores invertidas
- Vintage
- Original (sem filtro)

O filtro pode ser escolhido antes da captura. Depois da captura, também é possível selecionar outro efeito para atualizar a foto sem precisar tirar uma nova.

## Como executar

1. Baixe ou clone este repositório.
2. Abra a pasta `Camera_PFE` no Visual Studio Code.
3. Execute o arquivo `index.html` com uma extensão de servidor local, como **Live Server**.
4. Clique em **Ligar câmera** e permita o acesso quando o navegador solicitar.
5. Digite o nome do aluno e selecione o filtro desejado.
6. Clique em **Capturar foto**.
7. Se desejar, escolha outro filtro para atualizar a foto.
8. Clique em **Baixar PNG** para salvar a imagem processada.

> **Importante:** por segurança, o navegador normalmente exige um contexto seguro para acessar a câmera, como `localhost` ou uma página publicada por HTTPS. Abrir o HTML diretamente pelo sistema de arquivos pode não funcionar.

## Requisitos atendidos

- [x] Solicitar permissão e apresentar o vídeo da câmera em tempo real.
- [x] Capturar uma fotografia da câmera real.
- [x] Aplicar efeito visual usando `context.filter`.
- [x] Gravar o nome do aluno e a data/hora na própria fotografia usando `context.fillText()`.
- [x] Exibir a imagem processada na interface.
- [x] Permitir ligar e desligar a câmera.
- [x] Encerrar todas as faixas do stream com `track.stop()`.
- [x] Tratar situações de permissão negada, câmera ausente e captura indisponível.
- [x] Manter HTML, CSS e JavaScript em arquivos separados.

## Publicar no GitHub

1. Crie um repositório público chamado `Camera_PFE`.
2. Envie `index.html`, `style.css`, `script.js` e `README.md` para a raiz do repositório.
3. Para publicar a aplicação, acesse **Settings → Pages**, escolha a branch principal (normalmente `main`) e a pasta raiz (`/`) como origem, e salve.
4. Após a publicação, abra o endereço fornecido pelo GitHub Pages e teste o acesso à câmera.

## Privacidade

A fotografia é processada localmente no navegador. Este projeto não envia as imagens para um servidor nem mantém um banco de dados com as capturas.
