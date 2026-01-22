import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendPasswordResetEmail } from '../../../lib/email';

export async function POST(request: Request) {
  console.log('[forgot-password] Iniciando requisição');

  try {
    const body = await request.json();
    const { email } = body;
    console.log('[forgot-password] Email recebido:', email);

    if (!email) {
      console.log('[forgot-password] Email não fornecido');
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo email
    console.log('[forgot-password] Buscando usuário no banco...');
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log('[forgot-password] Usuário encontrado:', user ? 'Sim' : 'Não');

    if (!user) {
      // Por segurança, não informar se o email existe ou não
      console.log('[forgot-password] Usuário não existe, retornando sucesso genérico');
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, um código será enviado'
      });
    }

    // Invalidar códigos anteriores não utilizados
    await prisma.passwordResetCode.updateMany({
      where: {
        userId: user.id,
        used: false
      },
      data: {
        used: true
      }
    });

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Código expira em 15 minutos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Salvar código no banco
    console.log('[forgot-password] Salvando código no banco...');
    await prisma.passwordResetCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt
      }
    });
    console.log('[forgot-password] Código salvo com sucesso');

    // Enviar email com o código
    console.log(`[forgot-password] Enviando email para ${email}...`);
    const emailResult = await sendPasswordResetEmail(email, code);

    if (emailResult.success) {
      console.log(`[forgot-password] Email enviado com sucesso para ${email}`);
    } else {
      console.log(`[forgot-password] Credenciais de email não configuradas. Código: ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Código enviado para o email'
    });

  } catch (error) {
    console.error('[forgot-password] ERRO:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
