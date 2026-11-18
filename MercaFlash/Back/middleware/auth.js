// Autenticación simple para el personal.
// 1) El personal envía el PIN a /api/personal/login
// 2) Si es correcto, el servidor crea un "token" (una cadena aleatoria) y lo guarda en memoria
// 3) En cada petición siguiente, el navegador manda ese token en la cabecera Authorization
//
// Nota: los tokens viven en la memoria del servidor, así que se pierden si reinicias el servidor.
// Para un proyecto real se usarían usuarios en la base de datos + JWT o sesiones.
const crypto = require("crypto");

const DURACION_MS = 8 * 60 * 60 * 1000; // 8 horas
const sesiones = new Map(); // token -> momento en que expira

// Protección básica contra adivinar el PIN: máx. 5 intentos fallidos cada 5 minutos por IP
const intentos = new Map(); // ip -> { cuenta, desde }
const MAX_INTENTOS = 5;
const VENTANA_MS = 5 * 60 * 1000;

function bloqueado(ip) {
  const r = intentos.get(ip);
  if (!r) return false;
  if (Date.now() - r.desde > VENTANA_MS) { intentos.delete(ip); return false; }
  return r.cuenta >= MAX_INTENTOS;
}
function registrarFallo(ip) {
  const r = intentos.get(ip);
  if (!r || Date.now() - r.desde > VENTANA_MS) intentos.set(ip, { cuenta: 1, desde: Date.now() });
  else r.cuenta++;
}

function crearSesion() {
  const token = crypto.randomBytes(24).toString("hex");
  sesiones.set(token, Date.now() + DURACION_MS);
  return token;
}

// Middleware: se pone antes de una ruta para exigir que sea personal autenticado
function requierePersonal(req, res, next) {
  const cabecera = req.headers.authorization || "";
  const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;
  const expira = token && sesiones.get(token);
  if (!expira || expira < Date.now()) {
    if (token) sesiones.delete(token);
    return res.status(401).json({ error: "No autorizado. Ingresa el PIN del personal." });
  }
  next();
}

module.exports = { crearSesion, requierePersonal, bloqueado, registrarFallo };
