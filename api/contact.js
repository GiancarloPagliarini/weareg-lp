import { Resend } from 'resend';
import { notification, confirmation } from '../lib/emails.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO = process.env.CONTACT_TO || 'comercial@weareg.com.br';
const FROM = process.env.CONTACT_FROM || 'WeAreG <contato@weareg.com.br>';

const LIMITS = { nome: 120, empresa: 160, email: 200, telefone: 40, interesse: 120, mensagem: 5000 };

function clean(value, max) {
  if (typeof value !== 'string') return '';
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

  const lead = {
    nome: clean(body.nome, LIMITS.nome),
    // \r\n em header (reply_to) permitiria injeção de cabeçalho
    email: clean(body.email, LIMITS.email).replace(/[\r\n]/g, ''),
    empresa: clean(body.empresa, LIMITS.empresa),
    telefone: clean(body.telefone, LIMITS.telefone),
    interesse: clean(body.interesse, LIMITS.interesse),
    mensagem: clean(body.mensagem, LIMITS.mensagem)
  };

  if (!lead.nome) return res.status(400).json({ error: 'Informe seu nome.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  // A notificação é o que não pode falhar: se ela não sair, o lead se perde.
  try {
    const aviso = notification(lead);
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: lead.email,
      subject: aviso.subject,
      html: aviso.html,
      text: aviso.text
    });

    if (error) {
      console.error('Resend recusou a notificação:', error);
      return res.status(502).json({ error: 'Não foi possível enviar agora. Tente novamente em instantes.' });
    }

    // A confirmação é cortesia: se falhar, o lead já está com o comercial,
    // então não faz sentido devolver erro para quem preencheu o formulário.
    try {
      const recibo = confirmation(lead);
      const { error: erroRecibo } = await resend.emails.send({
        from: FROM,
        to: [lead.email],
        replyTo: TO,
        subject: recibo.subject,
        html: recibo.html,
        text: recibo.text
      });
      if (erroRecibo) console.error('Falha na confirmação para o lead:', erroRecibo);
    } catch (err) {
      console.error('Falha na confirmação para o lead:', err);
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
