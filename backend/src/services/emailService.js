const nodemailer = require('nodemailer');

// Configure email transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  if (!config.auth.user || !config.auth.pass) {
    console.warn('⚠️  Email credentials not configured. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.warn('⚠️  Email not sent: transporter not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Control Disciplina'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log('✅ Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send MFA code via email
 * @param {string} email - User email
 * @param {string} code - OTP code
 * @param {string} userName - User name
 */
const sendMFACode = async (email, code, userName) => {
  const subject = 'Código de Verificación - Control Disciplina';
  
  const text = `
Hola ${userName},

Tu código de verificación es: ${code}

Este código expirará en 5 minutos.

Si no solicitaste este código, ignora este correo.

Saludos,
Sistema de Control Disciplina
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Código de Verificación</h2>
      <p>Hola <strong>${userName}</strong>,</p>
      <p>Tu código de verificación es:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #4CAF50; margin: 0; font-size: 36px; letter-spacing: 5px;">${code}</h1>
      </div>
      <p>Este código expirará en <strong>5 minutos</strong>.</p>
      <p style="color: #666; font-size: 14px;">Si no solicitaste este código, puedes ignorar este correo.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Sistema de Control Disciplina</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send password expiration warning
 * @param {string} email - User email
 * @param {string} userName - User name
 * @param {number} daysRemaining - Days until password expires
 */
const sendPasswordExpirationWarning = async (email, userName, daysRemaining) => {
  const subject = 'Advertencia: Tu contraseña está por expirar';
  
  const text = `
Hola ${userName},

Tu contraseña expirará en ${daysRemaining} días.

Por seguridad, debes cambiar tu contraseña antes de que expire.

Para cambiar tu contraseña:
1. Inicia sesión en el sistema
2. Ve a tu perfil
3. Selecciona "Cambiar contraseña"

Saludos,
Sistema de Control Disciplina
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff9800;">⚠️ Tu contraseña está por expirar</h2>
      <p>Hola <strong>${userName}</strong>,</p>
      <p>Tu contraseña expirará en <strong>${daysRemaining} días</strong>.</p>
      <p>Por seguridad, debes cambiar tu contraseña antes de que expire.</p>
      <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Para cambiar tu contraseña:</h3>
        <ol>
          <li>Inicia sesión en el sistema</li>
          <li>Ve a tu perfil</li>
          <li>Selecciona "Cambiar contraseña"</li>
        </ol>
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Sistema de Control Disciplina</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send password expired notification
 * @param {string} email - User email
 * @param {string} userName - User name
 */
const sendPasswordExpiredNotification = async (email, userName) => {
  const subject = 'Tu contraseña ha expirado';
  
  const text = `
Hola ${userName},

Tu contraseña ha expirado por seguridad.

Debes cambiar tu contraseña la próxima vez que inicies sesión.

El sistema te solicitará que establezcas una nueva contraseña.

Saludos,
Sistema de Control Disciplina
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">🔒 Tu contraseña ha expirado</h2>
      <p>Hola <strong>${userName}</strong>,</p>
      <p>Tu contraseña ha expirado por seguridad.</p>
      <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;">Debes cambiar tu contraseña la próxima vez que inicies sesión.</p>
        <p style="margin: 10px 0 0 0;">El sistema te solicitará que establezcas una nueva contraseña.</p>
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Sistema de Control Disciplina</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendMFACode,
  sendPasswordExpirationWarning,
  sendPasswordExpiredNotification
};
