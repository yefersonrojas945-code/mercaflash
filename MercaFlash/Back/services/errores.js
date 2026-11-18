// Error "esperado" (datos inválidos, sin stock, estado que no permite la acción...).
// Las rutas lo lanzan y responden con su `status` y un mensaje claro para el usuario.
class ErrorNegocio extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

module.exports = { ErrorNegocio };
