// Autenticación del personal: el PIN se valida en el servidor y devuelve un token.
// El token se envía después en la cabecera  Authorization: Bearer <token>
const express = require("express");
const { crearSesion, bloqueado, registrarFallo } = require("../middleware/auth");
const router = express.Router();

/**
 * @swagger
 * /api/personal/login:
 *   post:
 *     summary: Iniciar sesión como personal con el PIN
 *     description: Devuelve un token. En Swagger, pulsa "Authorize" y pégalo para probar las rutas protegidas.
 *     tags: [Personal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pin]
 *             properties:
 *               pin: { type: string, example: "1234" }
 *     responses:
 *       200:
 *         description: Token de sesión (dura 8 horas)
 *       401:
 *         description: PIN incorrecto
 *       429:
 *         description: Demasiados intentos fallidos
 */
router.post("/login", (req, res) => {
  const ip = req.ip;
  if (bloqueado(ip)) {
    return res.status(429).json({ error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." });
  }
  const pin = String((req.body && req.body.pin) || "");
  const pinCorrecto = String(process.env.STAFF_PIN || "");
  if (!pinCorrecto || pin !== pinCorrecto) {
    registrarFallo(ip);
    return res.status(401).json({ error: "PIN incorrecto." });
  }
  res.json({ token: crearSesion() });
});

module.exports = router;
