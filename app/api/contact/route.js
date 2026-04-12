import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: 'Charmed & Dark <noreply@charmedanddark.com>',
      to: 'hello@charmedanddark.com',
      replyTo: email,
      subject: `[Contact] ${subject || 'General'} — ${name || 'Anonymous'}`,
      text: `Name: ${name || 'Not provided'}\nEmail: ${email}\nSubject: ${subject || 'General'}\n\n${message}`,
      html: `
        <div style="font-family: Georgia, serif; color: #333; max-width: 600px;">
          <h2 style="color: #1a1a1a;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name || 'Not provided'}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject || 'General'}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
