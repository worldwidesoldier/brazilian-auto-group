const https = require('https');

const URL = 'https://brazilian-auto-group.onrender.com/api/cars'; // endpoint público do seu backend

function ping() {
  https.get(URL, (res) => {
    console.log(`[${new Date().toISOString()}] Pinged backend: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`[${new Date().toISOString()}] Error pinging backend:`, e.message);
  });
}

// Ping a cada 14 minutos (menos que 15 para garantir)
setInterval(ping, 14 * 60 * 1000);
ping(); // ping imediatamente ao iniciar 