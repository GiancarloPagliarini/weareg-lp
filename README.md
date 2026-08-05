# weareg-lp

Landing page da WeAreG (`weareg.com.br`). HTML estático servido pela Vercel, com uma
função serverless em `api/contact.js` que envia o formulário de contato via [Resend](https://resend.com).

## Estrutura

```
index.html            página principal (formulário na seção #contact)
api/contact.js        função serverless: valida o POST e dispara os e-mails
lib/emails.js         templates HTML dos e-mails, na identidade da marca
clinicas/             landing WeClinic
playbook.html         páginas de apoio / previews
```

Cada envio do formulário dispara **dois** e-mails:

1. **Notificação** para `CONTACT_TO`, com `replyTo` no e-mail do lead — responder no
   cliente de e-mail já endereça direto para quem preencheu.
2. **Confirmação** para o lead, com `replyTo` em `CONTACT_TO`.

A notificação é crítica: se falhar, a API responde erro e o formulário avisa o usuário.
A confirmação é best-effort — se a Resend recusar, o erro vai para o log mas a requisição
segue como sucesso, porque o lead já chegou ao comercial.

## Variáveis de ambiente

Configurar em **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `RESEND_API_KEY` | sim | — | API key da Resend (`re_...`). Nunca comitar. |
| `CONTACT_TO` | não | `comercial@weareg.com.br` | Destinatário das mensagens. |
| `CONTACT_FROM` | não | `WeAreG <contato@weareg.com.br>` | Remetente. O domínio precisa estar verificado na Resend. |
| `SITE_URL` | não | `https://www.weareg.com.br` | Base das imagens e links dos e-mails. Precisa ser URL absoluta e pública — é de onde os clientes de e-mail baixam o logo. |

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
