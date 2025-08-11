import { generateToken } from "../lib/jwt.js";

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Autenticación de usuario
 *     description: Retorna un token JWT si las credenciales son correctas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 token:
 *                   type: string
 *                   description: JWT token generado
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzU0ODc2MzY5LCJleHAiOjE3NTQ4Nzk5Njl9.JPOWeraiaC4wetQRaLquCoXfQMipx99IyfvDrnNqKDA
 *                 username:
 *                   type: string
 *                   example: admin
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor
 */

export const handler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body);

    if (username !== "admin" || password !== "1234") {
      return { 
        statusCode: 401, 
        body: JSON.stringify({ message: "Credenciales inválidas" }) 
      };
    }

    const token = generateToken({ username });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login exitoso",
        token,
        username
      })
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ message: err.message }) 
    };
  }
};
