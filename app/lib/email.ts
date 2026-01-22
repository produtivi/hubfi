import nodemailer from 'nodemailer';

// Configuração do transporter
// Para produção, configure as variáveis de ambiente:
// EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[email] Credenciais de email não configuradas. Email não enviado.');
    console.log('[email] Para:', to);
    console.log('[email] Assunto:', subject);
    console.log('[email] Conteúdo:', text);
    return { success: false, reason: 'credentials_not_configured' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });

    console.log('[email] Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] Erro ao enviar email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const subject = 'Código de recuperação de senha - Hubfi';

  const text = `
Olá,

Você solicitou a recuperação de senha da sua conta Hubfi.

Seu código de verificação é: ${code}

Este código expira em 15 minutos.

Se você não solicitou esta recuperação, ignore este email.

Atenciosamente,
Equipe Hubfi
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #181818; margin-bottom: 10px;">Hubfi</h1>
  </div>

  <div style="background-color: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #181818; margin-top: 0;">Recuperação de Senha</h2>
    <p>Olá,</p>
    <p>Você solicitou a recuperação de senha da sua conta Hubfi.</p>
    <p>Seu código de verificação é:</p>

    <div style="background-color: #181818; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
      ${code}
    </div>

    <p style="color: #666; font-size: 14px;">Este código expira em <strong>15 minutos</strong>.</p>
    <p style="color: #666; font-size: 14px;">Se você não solicitou esta recuperação, ignore este email.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Atenciosamente,<br>Equipe Hubfi</p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to, subject, text, html });
}
