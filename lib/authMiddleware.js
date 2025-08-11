import { verifyToken } from "../lib/jwt.js";

export const requireAuth = (handler) => {
  return async (event) => {
    try {
      const authHeader = event.headers?.Authorization || event.headers?.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { statusCode: 401, body: JSON.stringify({ message: "Token requerido" }) };
      }

      const token = authHeader.split(" ")[1];
      const user = verifyToken(token);
      event.user = user; // importante para que `storeHandler` pueda acceder

      return await handler(event);
    } catch (error) {
      return { statusCode: 401, body: JSON.stringify({ message: error.message }) };
    }
  };
};

