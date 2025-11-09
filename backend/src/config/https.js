/**
 * Configuración de HTTPS/TLS para producción
 * Implementación de seguridad OWASP A02: Fallas criptográficas
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Configurar servidor HTTPS
 * @param {Express} app - Aplicación Express
 * @returns {Server} Servidor HTTPS o HTTP
 */
const configureServer = (app) => {
  const PORT = process.env.PORT || 5000;
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // En producción, usar HTTPS
  if (NODE_ENV === 'production') {
    try {
      // Verificar que existan los certificados SSL
      const sslKeyPath = process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key';
      const sslCertPath = process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt';
      const sslCaPath = process.env.SSL_CA_PATH; // Opcional: Certificate Authority

      if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
        console.warn('⚠️  ADVERTENCIA: Certificados SSL no encontrados');
        console.warn('   Iniciando servidor HTTP en modo producción (NO RECOMENDADO)');
        console.warn('   Configure SSL_KEY_PATH y SSL_CERT_PATH en variables de entorno');
        
        const server = http.createServer(app);
        server.listen(PORT, () => {
          console.log(`⚠️  Servidor HTTP ejecutándose en puerto ${PORT} (modo producción sin SSL)`);
        });
        return server;
      }

      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
        // Si tienes un certificado de CA, descomenta la siguiente línea:
        // ca: sslCaPath ? fs.readFileSync(sslCaPath) : undefined,
        
        // Configuraciones de seguridad TLS
        secureOptions: require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
        ciphers: [
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-ECDSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-ECDSA-AES256-GCM-SHA384',
          'DHE-RSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES128-SHA256',
          'DHE-RSA-AES128-SHA256',
          'ECDHE-RSA-AES256-SHA384',
          'DHE-RSA-AES256-SHA384',
          'ECDHE-RSA-AES256-SHA256',
          'DHE-RSA-AES256-SHA256',
          'HIGH',
          '!aNULL',
          '!eNULL',
          '!EXPORT',
          '!DES',
          '!RC4',
          '!MD5',
          '!PSK',
          '!SRP',
          '!CAMELLIA'
        ].join(':'),
        honorCipherOrder: true
      };

      const httpsServer = https.createServer(httpsOptions, app);
      
      httpsServer.listen(PORT, () => {
        console.log(`✅ Servidor HTTPS seguro ejecutándose en puerto ${PORT}`);
        console.log(`🔒 TLS habilitado con ciphers fuertes`);
      });

      // También crear servidor HTTP que redirija a HTTPS
      const httpPort = process.env.HTTP_PORT || 80;
      const httpRedirectApp = require('express')();
      
      httpRedirectApp.use('*', (req, res) => {
        const httpsUrl = `https://${req.hostname}${PORT !== 443 ? ':' + PORT : ''}${req.url}`;
        res.redirect(301, httpsUrl);
      });

      http.createServer(httpRedirectApp).listen(httpPort, () => {
        console.log(`↪️  Servidor HTTP en puerto ${httpPort} redirigiendo a HTTPS`);
      });

      return httpsServer;

    } catch (error) {
      console.error('❌ Error al configurar HTTPS:', error.message);
      console.error('   Iniciando servidor HTTP como fallback');
      
      const server = http.createServer(app);
      server.listen(PORT, () => {
        console.log(`⚠️  Servidor HTTP ejecutándose en puerto ${PORT}`);
      });
      return server;
    }
  }

  // En desarrollo, usar HTTP simple
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`🔧 Servidor HTTP en desarrollo ejecutándose en puerto ${PORT}`);
    console.log(`   Modo: ${NODE_ENV}`);
  });
  return server;
};

module.exports = { configureServer };
