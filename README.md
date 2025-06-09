# Projeto Artesani Site com Next.js e Supabase

Este é um projeto Next.js para o site Artesani, utilizando Supabase como backend para autenticação e banco de dados.

## Visão Geral

O projeto visa fornecer uma plataforma online para [Descreva brevemente o objetivo do site Artesani, ex: venda de artesanato, portfólio de produtos, etc.].

## Tecnologias Utilizadas

*   **Frontend:** [Next.js](https://nextjs.org/) (React Framework)
*   **Backend (BaaS):** [Supabase](https://supabase.io/) - Autenticação e Banco de Dados PostgreSQL
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (ou outra que estiver usando)
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) (ou outra que estiver usando)
*   **Linguagem:** TypeScript

## Configuração do Ambiente de Desenvolvimento

1.  **Clonar o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd nome-do-diretorio
    ```

2.  **Instalar dependências:**
    ```bash
    npm install
    # ou
    # yarn install
    # ou
    # pnpm install
    ```

3.  **Configurar Variáveis de Ambiente:**
    *   Crie um arquivo `.env.local` na raiz do projeto.
    *   Adicione as seguintes variáveis com suas respectivas chaves do Supabase:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=SUA_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
        ```
    *   Você pode encontrar essas chaves no painel do seu projeto Supabase em Project Settings > API.

4.  **Rodar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou
    # yarn dev
    # ou
    # pnpm dev
    ```
    Abra [http://localhost:9002](http://localhost:9002) (ou a porta que estiver configurada no seu `package.json`) no seu navegador para ver o resultado.

## Scripts Disponíveis

No diretório do projeto, você pode rodar:

*   `npm run dev`: Inicia a aplicação em modo de desenvolvimento.
*   `npm run build`: Compila a aplicação para produção.
*   `npm run start`: Inicia um servidor de produção (após o build).
*   `npm run lint`: Executa o linter (ESLint).
*   `npm run typecheck`: Verifica os tipos com TypeScript.

## Estrutura do Projeto (Principais Pastas)
