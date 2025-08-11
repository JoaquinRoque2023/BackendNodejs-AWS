// handlers/historial.js - GET /historial
import { getFusionHistory } from "../lib/dynamo.js";

export const handler = async (event) => {
  console.log("📜 GET /historial - Recuperando historial de fusiones...");
  
  try {
    const qs = event.queryStringParameters || {};
    const limit = Math.min(Math.max(parseInt(qs.limit || "10", 10), 1), 100);
    const lastKey = qs.lastKey ? JSON.parse(Buffer.from(qs.lastKey, "base64").toString("utf8")) : null;

    const { items, lastEvaluatedKey } = await getFusionHistory(limit, lastKey);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        count: items.length,
        items,
        lastKey: lastEvaluatedKey
          ? Buffer.from(JSON.stringify(lastEvaluatedKey)).toString("base64")
          : null
      })
    };

  } catch (error) {
    console.error("💥 Error en GET /historial:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Error interno del servidor",
        timestamp: new Date().toISOString()
      })
    };
  }
};
