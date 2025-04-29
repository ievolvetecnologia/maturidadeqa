import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()

    // Validar campos obrigatórios
    if (!name || !email || !phone) {
      return NextResponse.json({ message: "Nome, email e telefone são obrigatórios" }, { status: 400 })
    }

    // Configuração do transporter com mais detalhes para debug
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true para 465, false para outras portas
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true, // Mostrar logs de debug
    })

    // Email content
    const mailOptions = {
      from: `"SQM Assessment" <${process.env.EMAIL_USER}>`,
      to: "ievolve.tecnologia@gmail.com",
      subject: "Nova solicitação de demonstração - SQM Assessment",
      html: `
        <h1>Nova solicitação de demonstração</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p>Este contato foi enviado através do formulário de demonstração do SQM Assessment.</p>
      `,
    }

    // Log para debug
    console.log("Tentando enviar email com as seguintes configurações:", {
      user: process.env.EMAIL_USER ? "Configurado" : "Não configurado",
      pass: process.env.EMAIL_PASS ? "Configurado" : "Não configurado",
      to: mailOptions.to,
      subject: mailOptions.subject,
    })

    // Enviar email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email enviado com sucesso:", info.messageId)

    return NextResponse.json({
      message: "Email enviado com sucesso",
      success: true,
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error("Erro ao enviar email:", error)

    // Retornar detalhes do erro para facilitar o debug
    return NextResponse.json(
      {
        message: "Erro ao processar a solicitação",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
