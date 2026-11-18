// Rutas del personal de la tienda (protegidas con PIN).
//   POST  /api/personal/login                      -> { pin } devuelve un token
//   GET   /api/personal/pedidos                    -> todos los pedidos (requiere token)
//   PATCH /api/personal/pedidos/MF-5/listo         -> marca el pedido como listo (requiere token)
const express = require("express");
const pool = require("../config/db");
const { listarPedidos, idDeCodigo } = require("../services/pedidos");
const { crearSesion, requierePersonal, bloqueado, registrarFallo } = require("../middleware/auth");
const router = express.Router();

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

router.get("/pedidos", requierePersonal, async (req, res, next) => {
  try {
    res.json(await listarPedidos());
  } catch (err) { next(err); }
});

router.patch("/pedidos/:codigo/listo", requierePersonal, async (req, res, next) => {
  try {
    const id = idDeCodigo(req.params.codigo);
    if (id === null) return res.status(400).json({ error: "Código de pedido inválido." });
    const [r] = await pool.query("UPDATE pedido SET estado = 'Listo' WHERE id_pedido = ?", [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: "Pedido no encontrado." });
    const [pedido] = await listarPedidos("WHERE p.id_pedido = ?", [id], 1);
    res.json(pedido);
  } catch (err) { next(err); }
});

module.exports = router;
