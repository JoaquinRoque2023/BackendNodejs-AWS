// handlers/historial.js - GET /historial
import { getFusionHistory } from "../lib/dynamo.js";
/**
 * @swagger
 * /historial:
 *   get:
 *     summary: Recupera el historial de fusiones realizadas
 *     description: Retorna una lista paginada con los registros de datos fusionados previamente consultados.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad máxima de elementos a retornar (default 10)
 *         required: false
 *         example: 10
 *       - in: query
 *         name: lastKey
 *         schema:
 *           type: string
 *         description: Token codificado en base64 para paginación (última llave recibida)
 *         required: false
 *     responses:
 *       200:
 *         description: Historial de fusiones recuperado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       consultado_en:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-11T00:33:36.702Z"
 *                       personaje:
 *                         type: object
 *                         properties:
 *                           color_cabello:
 *                             type: string
 *                             example: blond
 *                           peso_kg:
 *                             type: integer
 *                             example: 77
 *                           color_piel:
 *                             type: string
 *                             example: fair
 *                           altura_cm:
 *                             type: integer
 *                             example: 172
 *                           genero:
 *                             type: string
 *                             example: male
 *                           año_nacimiento:
 *                             type: string
 *                             example: 19BBY
 *                           color_ojos:
 *                             type: string
 *                             example: blue
 *                           nombre:
 *                             type: string
 *                             example: Luke Skywalker
 *                       metadatos_fusion:
 *                         type: object
 *                         properties:
 *                           tiempo_cache_minutos:
 *                             type: integer
 *                             example: 30
 *                           termino_busqueda:
 *                             type: string
 *                             example: luke skywalker
 *                           apis_consultadas:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example:
 *                               - SWAPI (Star Wars API)
 *                               - API Meteorológica
 *                           estrategia_fusion:
 *                             type: string
 *                             example: Mapeo de planetas ficticios a coordenadas terrestres para obtener clima real
 *                           calidad_datos:
 *                             type: object
 *                             properties:
 *                               personaje_completo:
 *                                 type: boolean
 *                                 example: true
 *                               porcentaje_completitud:
 *                                 type: integer
 *                                 example: 100
 *                               planeta_disponible:
 *                                 type: boolean
 *                                 example: true
 *                               clima_disponible:
 *                                 type: boolean
 *                                 example: true
 *                       sk:
 *                         type: string
 *                         example: ITEM#2025-08-11T00:33:36.702Z
 *                       version_api:
 *                         type: string
 *                         example: "1.0"
 *                       pk:
 *                         type: string
 *                         example: FUSION#8d4c86d2-664a-4a35-bfa5-c8fe8edc8c40
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 8d4c86d2-664a-4a35-bfa5-c8fe8edc8c40
 *                       expira_en:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-08-11T01:03:36.702Z
 *                       planeta_origen:
 *                         type: object
 *                         properties:
 *                           clima:
 *                             type: string
 *                             example: arid
 *                           diametro_km:
 *                             type: integer
 *                             example: 10465
 *                           gravedad:
 *                             type: string
 *                             example: 1 standard
 *                           poblacion:
 *                             type: integer
 *                             example: 200000
 *                           periodo_rotacion_horas:
 *                             type: integer
 *                             example: 23
 *                           periodo_orbital_dias:
 *                             type: integer
 *                             example: 304
 *                           nombre:
 *                             type: string
 *                             example: Tatooine
 *                           terreno:
 *                             type: string
 *                             example: desert
 *                       clima_actual:
 *                         type: object
 *                         properties:
 *                           consultado_en:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-08-11T00:33:36.702Z
 *                           ubicacion:
 *                             type: object
 *                             properties:
 *                               mapeo_justificacion:
 *                                 type: string
 *                                 example: Coordenadas terrestres aproximadas para el planeta Tatooine
 *                               coordenadas_terrestres:
 *                                 type: object
 *                                 properties:
 *                                   expected_climate:
 *                                     type: string
 *                                     example: desert
 *                                   lon:
 *                                     type: number
 *                                     example: 35
 *                                   terrestrial_equivalent:
 *                                     type: string
 *                                     example: Desierto de Arabia
 *                                   lat:
 *                                     type: number
 *                                     example: 25
 *                               planeta_origen:
 *                                 type: string
 *                                 example: Tatooine
 *                           disponible:
 *                             type: boolean
 *                             example: true
 *                       type:
 *                         type: string
 *                         example: FUSION_DATA
 *                 lastKey:
 *                   type: string
 *                   nullable: true
 *                   description: Token codificado en base64 para paginación
 *                   example: null
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: INTERNAL_SERVER_ERROR
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-11T00:00:00.000Z"
 */

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
