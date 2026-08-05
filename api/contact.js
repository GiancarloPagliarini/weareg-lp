import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO = process.env.CONTACT_TO || 'comercial@weareg.com.br';
const FROM = process.env.CONTACT_FROM || 'Site WeAreG <contato@weareg.com.br>';

const LIMITS = { nome: 120, empresa: 160, email: 200, telefone: 40, interesse: 120, mensagem: 5000 };

/* Campos entram no corpo HTML do e-mail, então precisam ser escapados. */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  // remove quebras de linha de campos simples evita header injection no reply-to
  return value.trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body) return res.status(400).json({ error: 'Corpo da requisição inválido.' });

  // Honeypot: bots preenchem, humanos não veem o campo.
  if (clean(body._honey, 50)) return res.status(200).json({ ok: true });

  const nome = clean(body.nome, LIMITS.nome);
  const email = clean(body.email, LIMITS.email).replace(/[\r\n]/g, '');
  const empresa = clean(body.empresa, LIMITS.empresa);
  const telefone = clean(body.telefone, LIMITS.telefone);
  const interesse = clean(body.interesse, LIMITS.interesse);
  const mensagem = clean(body.mensagem, LIMITS.mensagem);

  if (!nome) return res.status(400).json({ error: 'Informe seu nome.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  const rows = [
    ['Nome', nome],
    ['Empresa', empresa],
    ['E-mail', email],
    ['Telefone', telefone],
    ['Interesse', interesse]
  ].filter(([, v]) => v);

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;color:#1a1a1a">
      <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b6b6b;margin:0 0 4px">
        Novo contato &middot; weareg.com.br
      </p>
      <h2 style="margin:0 0 20px;font-size:20px">${esc(nome)}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows.map(([k, v]) => `
          <tr>
            <td style="padding:8px 12px 8px 0;color:#6b6b6b;white-space:nowrap;vertical-align:top">${k}</td>
            <td style="padding:8px 0;border-bottom:1px solid #ececec">${esc(v)}</td>
          </tr>`).join('')}
      </table>
      ${mensagem ? `
        <p style="margin:24px 0 6px;color:#6b6b6b;font-size:14px">Mensagem</p>
        <div style="white-space:pre-wrap;font-size:15px;line-height:1.6;padding:16px;background:#f7f7f5;border-radius:8px">${esc(mensagem)}</div>
      ` : ''}
      <p style="margin-top:28px;font-size:13px;color:#6b6b6b">
        Responda este e-mail para falar direto com ${esc(nome)}.
      </p>
    </div>`;

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    mensagem ? `\nMensagem:\n${mensagem}` : ''
  ].join('\n').trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject: `Novo contato pelo site — ${nome}${empresa ? ` (${empresa})` : ''}`,
      html,
      text
    });

    if (error) {
      console.error('Resend recusou o envio:', error);
      return res.status(502).json({ error: 'Não foi possível enviar agora. Tente novamente em instantes.' });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('Falha ao chamar a Resend:', err);
    return res.status(500).json({ error: 'Erro inesperado. Tente novamente ou escreva para comercial@weareg.com.br.' });
  }
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
