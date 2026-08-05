/* ============================================================
   WeAreG — templates de e-mail transacional
   Paleta e tipografia conforme o manual da marca:
   ênfase é carregada por COR (lime), nunca por peso ou itálico.

   HTML de e-mail tem regras próprias: tabelas em vez de flex/grid,
   CSS inline (clientes descartam <style>), largura fixa de 600px e
   nada de webfont. Por isso o markup aqui não se parece com o do site.
   ============================================================ */

const INK = '#1a2123';
const INK_DEEP = '#141a1b';
const LIME = '#a2dd00';
const CREAM = '#f3f0ed';
const PETROL = '#1e494b';
const LINE = '#2b3335';
const MUTED = '#9aa5a6';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif";

const SITE = process.env.SITE_URL || 'https://www.weareg.com.br';
const LOGO = `${SITE}/assets/brand/weareg-lockup-dark.png`;

export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Rótulos pequenos em caixa alta — o "rule-label" do site. */
function eyebrow(text, color = MUTED) {
  return `<p style="margin:0 0 10px;font:400 11px/1.4 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${color}">${esc(text)}</p>`;
}

/* Linhas rótulo/valor. `link` transforma o valor em âncora lime. */
function dataRows(rows) {
  return rows.filter(r => r && r.value).map(({ label, value, href }) => `
    <tr>
      <td style="padding:11px 16px 11px 0;font:400 13px/1.5 ${FONT};color:${MUTED};white-space:nowrap;vertical-align:top;border-bottom:1px solid ${LINE}">${esc(label)}</td>
      <td style="padding:11px 0;font:400 14px/1.5 ${FONT};color:${CREAM};vertical-align:top;border-bottom:1px solid ${LINE}">${
        href
          ? `<a href="${esc(href)}" style="color:${LIME};text-decoration:none">${esc(value)}</a>`
          : esc(value)
      }</td>
    </tr>`).join('');
}

/* Botão à prova de Outlook: cor no <td>, padding no <td>, nunca no <a>. */
function button(href, label) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 8px">
      <tr>
        <td bgcolor="${LIME}" style="border-radius:6px">
          <a href="${esc(href)}" style="display:inline-block;padding:14px 26px;font:400 14px/1 ${FONT};letter-spacing:.01em;color:${INK};text-decoration:none">${esc(label)}</a>
        </td>
      </tr>
    </table>`;
}

/* Casca comum: fundo ink, faixa petrol com o lockup, rodapé com hairline. */
function shell({ preheader, eyebrowText, body, footer }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>WeAreG</title>
</head>
<body style="margin:0;padding:0;background:${INK_DEEP};-webkit-font-smoothing:antialiased">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${INK_DEEP}" style="background:${INK_DEEP}">
    <tr>
      <td align="center" style="padding:32px 16px">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;border-radius:12px;overflow:hidden;border:1px solid ${LINE}">

          <tr>
            <td bgcolor="${PETROL}" style="background:${PETROL};padding:28px 32px">
              <img src="${LOGO}" width="148" height="41" alt="WeAreG"
                style="display:block;border:0;width:148px;height:41px;color:${CREAM};font:400 18px/41px ${FONT}">
              ${eyebrowText ? `<p style="margin:18px 0 0;font:400 11px/1.4 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${LIME}">${esc(eyebrowText)}</p>` : ''}
            </td>
          </tr>

          <tr>
            <td bgcolor="${INK}" style="background:${INK};padding:36px 32px">
${body}
            </td>
          </tr>

          <tr>
            <td bgcolor="${INK}" style="background:${INK};padding:0 32px 30px">
              <div style="border-top:1px solid ${LINE};padding-top:22px">
                <p style="margin:0;font:400 12px/1.7 ${FONT};color:${MUTED}">${footer}</p>
              </div>
            </td>
          </tr>

        </table>

        <p style="margin:22px 0 0;font:400 11px/1.5 ${FONT};color:#5d6668">
          WeAreG &middot; <a href="${SITE}" style="color:#5d6668;text-decoration:none">weareg.com.br</a>
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ---------- 1. Notificação para o comercial ---------- */
export function notification(lead) {
  const { nome, email, empresa, telefone, interesse, mensagem } = lead;

  const recebido = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo'
  }).format(new Date());

  const rows = dataRows([
    { label: 'E-mail', value: email, href: `mailto:${email}` },
    { label: 'Telefone', value: telefone, href: telefone ? `tel:${telefone.replace(/[^\d+]/g, '')}` : null },
    { label: 'Empresa', value: empresa },
    { label: 'Interesse', value: interesse }
  ]);

  const body = `
              <h1 style="margin:0;font:400 26px/1.2 ${FONT};letter-spacing:-.02em;color:${CREAM}">${esc(nome)}</h1>
              ${empresa ? `<p style="margin:8px 0 0;font:400 15px/1.5 ${FONT};color:${LIME}">${esc(empresa)}</p>` : ''}

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px">
                ${rows}
              </table>

              ${mensagem ? `
              <div style="margin-top:32px">
                ${eyebrow('Mensagem')}
                <div style="border-left:2px solid ${LIME};padding:2px 0 2px 18px">
                  <p style="margin:0;font:400 15px/1.7 ${FONT};color:${CREAM};white-space:pre-wrap">${esc(mensagem)}</p>
                </div>
              </div>` : ''}

              ${button(`mailto:${email}`, `Responder para ${nome.split(/\s+/)[0]}`)}`;

  const text = [
    `NOVO CONTATO — weareg.com.br`,
    ``,
    `Nome: ${nome}`,
    empresa ? `Empresa: ${empresa}` : null,
    `E-mail: ${email}`,
    telefone ? `Telefone: ${telefone}` : null,
    interesse ? `Interesse: ${interesse}` : null,
    mensagem ? `\nMensagem:\n${mensagem}` : null,
    ``,
    `Recebido em ${recebido}. Responda este e-mail para falar direto com ${nome.split(/\s+/)[0]}.`
  ].filter(v => v !== null).join('\n');

  return {
    subject: `Novo contato — ${nome}${empresa ? ` · ${empresa}` : ''}`,
    html: shell({
      preheader: `${nome}${empresa ? ` (${empresa})` : ''}${interesse ? ` — ${interesse}` : ''}`,
      eyebrowText: 'Novo contato pelo site',
      body,
      footer: `Recebido em ${recebido} pelo formulário de <a href="${SITE}/#contact" style="color:${MUTED}">weareg.com.br</a>. Responda este e-mail para falar direto com ${esc(nome.split(/\s+/)[0])}.`
    }),
    text
  };
}

/* ---------- 2. Confirmação para quem preencheu ---------- */
export function confirmation(lead) {
  const { nome, interesse, mensagem } = lead;
  const primeiro = nome.split(/\s+/)[0];

  const body = `
              <h1 style="margin:0;font:400 26px/1.25 ${FONT};letter-spacing:-.02em;color:${CREAM}">
                Recebemos sua mensagem, <span style="color:${LIME}">${esc(primeiro)}</span>.
              </h1>

              <p style="margin:20px 0 0;font:400 15px/1.7 ${FONT};color:#cfd6d6">
                Obrigado pelo contato. Nosso time já foi notificado e vai retornar em
                <span style="color:${LIME}">até 24 horas úteis</span> com uma leitura inicial do
                seu cenário &mdash; sem compromisso e sem custo.
              </p>

              <p style="margin:16px 0 0;font:400 15px/1.7 ${FONT};color:#cfd6d6">
                Atendemos de segunda a sexta, das 9h às 18h. Se sua mensagem chegou fora
                desse horário, ela entra na fila do próximo dia útil.
              </p>

              ${(interesse || mensagem) ? `
              <div style="margin-top:34px;border:1px solid ${LINE};border-radius:10px;padding:22px 24px">
                ${eyebrow('O que você enviou')}
                ${interesse ? `<p style="margin:0;font:400 14px/1.6 ${FONT};color:${CREAM}">${esc(interesse)}</p>` : ''}
                ${mensagem ? `<p style="margin:${interesse ? '12px' : '0'} 0 0;font:400 14px/1.7 ${FONT};color:${MUTED};white-space:pre-wrap">${esc(mensagem)}</p>` : ''}
              </div>` : ''}

              ${button(SITE, 'Conhecer o que fazemos')}

              <p style="margin:30px 0 0;font:400 15px/1.7 ${FONT};color:#cfd6d6">
                Até breve,<br><span style="color:${CREAM}">Equipe WeAreG</span>
              </p>`;

  const text = [
    `Recebemos sua mensagem, ${primeiro}.`,
    ``,
    `Obrigado pelo contato. Nosso time já foi notificado e vai retornar em até 24 horas`,
    `úteis com uma leitura inicial do seu cenário — sem compromisso e sem custo.`,
    ``,
    `Atendemos de segunda a sexta, das 9h às 18h. Se sua mensagem chegou fora desse`,
    `horário, ela entra na fila do próximo dia útil.`,
    ``,
    interesse ? `O que você enviou — ${interesse}` : null,
    mensagem ? `${mensagem}` : null,
    ``,
    `Até breve,`,
    `Equipe WeAreG`,
    `${SITE}`,
    ``,
    `Você recebeu este e-mail porque preencheu o formulário em weareg.com.br.`,
    `Pode responder aqui mesmo — vai direto para o nosso time.`
  ].filter(v => v !== null).join('\n');

  return {
    subject: 'Recebemos sua mensagem — WeAreG',
    html: shell({
      preheader: 'Nosso time retorna em até 24 horas úteis.',
      eyebrowText: null,
      body,
      footer: `Você recebeu este e-mail porque preencheu o formulário em <a href="${SITE}" style="color:${MUTED}">weareg.com.br</a>. Pode responder aqui mesmo &mdash; a resposta vai direto para o nosso time.`
    }),
    text
  };
}
