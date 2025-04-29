import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()

    // Validar campos obrigatórios
    if (!name || !email || !phone) {
      return NextResponse.json({ message: "Nome, email e telefone são obrigatórios" }, { status: 400 })
    }

    // Configuração alternativa do transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true para 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
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

    // Enviar email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email enviado com sucesso:", info.messageId)

    return NextResponse.json({
      message: "Email enviado com sucesso",
      success: true,
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error("Erro ao enviar email (rota alternativa):", error)

    return NextResponse.json(
      {
        message: "Erro ao processar a solicitação",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
