import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key"; // Cambiar en producción a un valor seguro
const JWT_EXPIRES_IN = "1h";

/**
 * Genera un token JWT con el payload dado.
 * @param {Object} payload - Información a codificar en el token.
 * @returns {string} Token JWT firmado.
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token - Token JWT a verificar.
 * @throws {Error} Si el token es inválido o ha expirado.
 * @returns {Object} Payload decodificado del token.
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Puedes también registrar el error si quieres mayor detalle
    throw new Error("Token inválido o expirado");
  }
};
