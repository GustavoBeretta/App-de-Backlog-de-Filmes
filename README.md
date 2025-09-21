# Backlog de Filmes

Este é um aplicativo para gerenciar sua lista de filmes, permitindo que você acompanhe os filmes que já assistiu, os que deseja assistir e suas avaliações.

## Funcionalidades

O aplicativo oferece as seguintes funcionalidades:

- **Busca de Filmes**: Na tela principal, você pode pesquisar por filmes utilizando uma API externa.
- **Detalhes do Filme**: Ao selecionar um filme, você pode ver seus detalhes, como sinopse, data de lançamento e pôster.
- **Listas de Filmes**: Você pode adicionar filmes a três listas diferentes:
  - **Quero Assistir**: Filmes que você planeja ver no futuro.
  - **Já Assisti**: Filmes que você já concluiu.
  - **Avaliações**: Filmes que avaliou.
- **Persistência de Dados**: Suas listas de filmes são salvas localmente no dispositivo.

### Implementação das Funcionalidades

- **Navegação**: A navegação do aplicativo foi construída utilizando o **Expo Router**, com uma estrutura de abas (`(tabs)`) para as diferentes listas de filmes e uma rota dinâmica (`/movie/[id]`) para a tela de detalhes.
- **Busca de Filmes**: A busca é realizada através do arquivo `services/api.ts`, que utiliza o `axios` para fazer requisições a uma API de filmes.
- **Armazenamento Local**: As listas de filmes são gerenciadas pelo `services/storage.ts`, que utiliza o `@react-native-async-storage/async-storage` para salvar e recuperar os dados no dispositivo.

## Como Rodar o Projeto

Siga as instruções abaixo para configurar e executar o aplicativo em seu ambiente de desenvolvimento.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Expo Go](https://expo.dev/go) instalado em seu dispositivo móvel (Android ou iOS) ou um emulador configurado.

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/GustavoBeretta/App-de-Backlog-de-Filmes.git
   ```

2. Navegue até o diretório do projeto:

   ```bash
   cd App-de-Backlog-de-Filmes
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

### Executando o Aplicativo

1. Inicie o servidor de desenvolvimento do Expo:

   ```bash
   npm start
   ```

2. Após iniciar o servidor, um QR code será exibido no terminal. Use o aplicativo Expo Go em seu celular para escanear o QR code e abrir o aplicativo.

   - Para rodar no **Android**, você pode pressionar `a` no terminal.
   - Para rodar no **iOS**, você pode pressionar `i` no terminal.

## Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento de aplicativos móveis.
- **Expo**: Plataforma e conjunto de ferramentas para construir e implantar aplicativos React Native.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Expo Router**: Sistema de roteamento baseado em arquivos para aplicativos React Native.
- **Axios**: Cliente HTTP para fazer requisições à API de filmes.
- **Async Storage**: Sistema de armazenamento de dados local (chave-valor) para React Native.
