# weareg-lp

Landing page da WeAreG (`weareg.com.br`). HTML estático servido pela Vercel, com uma
função serverless em `api/contact.js` que envia o formulário de contato via [Resend](https://resend.com).

## Estrutura

```
index.html            página principal (formulário na seção #contact)
api/contact.js        função serverless: valida o POST e dispara o e-mail
clinicas/             landing WeClinic
playbook.html         páginas de apoio / previews
```

## Variáveis de ambiente

Configurar em **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `RESEND_API_KEY` | sim | — | API key da Resend (`re_...`). Nunca comitar. |
| `CONTACT_TO` | não | `comercial@weareg.com.br` | Destinatário das mensagens. |
| `CONTACT_FROM` | não | `Site WeAreG <contato@weareg.com.br>` | Remetente. O domínio precisa estar verificado na Resend. |

## Checklist de migração para a Vercel

1. **Resend** — verificar o domínio `weareg.com.br` (Domains → Add Domain) e publicar os
   registros SPF/DKIM no DNS. Sem isso o envio falha ou cai em spam.
2. **Vercel** — importar o repositório do GitHub. Framework: *Other*, sem build command,
   output no diretório raiz. As funções em `api/` são detectadas automaticamente.
3. Adicionar as variáveis de ambiente acima e fazer um redeploy.
4. **DNS** — apontar `weareg.com.br` para a Vercel e desativar o GitHub Pages do repositório
   (Settings → Pages → None). O arquivo `CNAME` só é usado pelo GitHub Pages e pode ser
   removido depois que a migração estiver estável.

## Rodando local

```sh
npm install
npx vercel dev      # serve o site estático + /api/contact na porta 3000
```

`vercel dev` lê as variáveis de um `.env.local` (não versionado) ou de `npx vercel env pull`.
