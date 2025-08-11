
import logger from '../lib/logger.js';
import { putCustom } from '../lib/dynamo.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @openapi
 * /almacenar:
 *   post:
 *     summary: Almacenar datos personalizados
 *     description: Guarda datos personalizados del usuario en la base de datos DynamoDB.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Datos personalizados del personaje a almacenar
 *             required:
 *               - id
 *               - nombre
 *               - planeta
 *               - clima
 *               - temperatura
 *             properties:
 *               id:
 *                 type: string
 *                 description: Identificador único del personaje
 *                 example: "personaje-4"
 *               nombre:
 *                 type: string
 *                 description: Nombre del personaje
 *                 example: "Darth Vader"
 *               planeta:
 *                 type: string
 *                 description: Planeta de origen del personaje
 *                 example: "Mustafar"
 *               clima:
 *                 type: string
 *                 description: Tipo de clima del planeta
 *                 example: "volcánico"
 *               temperatura:
 *                 type: integer
 *                 description: Temperatura del planeta en grados (unidades arbitrarias)
 *                 example: 800
 *     responses:
 *       201:
 *         description: Datos almacenados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "stored"
 *                 item:
 *                   type: object
 *                   description: Item almacenado en la base de datos con claves generadas
 *                   properties:
 *                     pk:
 *                       type: string
 *                       example: "CUSTOM#personaje-4"
 *                     sk:
 *                       type: string
 *                       format: date-time
 *                       example: "ITEM#2025-08-10T22:30:00.000Z"
 *                     id:
 *                       type: string
 *                       example: "personaje-4"
 *                     nombre:
 *                       type: string
 *                       example: "Darth Vader"
 *                     planeta:
 *                       type: string
 *                       example: "Mustafar"
 *                     clima:
 *                       type: string
 *                       example: "volcánico"
 *                     temperatura:
 *                       type: integer
 *                       example: 800
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-10T22:30:00.000Z"
 *       400:
 *         description: Body requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "body required"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error message"
 */


export const handler = async (event) => {
  try {
    logger.info('Invocación del handler /almacenar', { event });

    if (!event.body) {
      logger.warn('Falta body en la petición');
      return { statusCode: 400, body: JSON.stringify({ message: "body required" }) };
    }
    
    const body = JSON.parse(event.body);
    const id = uuidv4();

    const item = {
      pk: `CUSTOM#${id}`, // Clave primaria
      sk: `ITEM#${new Date().toISOString()}`, // Clave de ordenamiento
      id: id,
      createdAt: new Date().toISOString(),
      ...body
    };

    logger.info('Guardando item en la base de datos', { item });

    await putCustom(item);

    logger.info('Item almacenado correctamente', { id });

    return { statusCode: 201, body: JSON.stringify({ message: "stored", item }) };
  } catch (err) {
    logger.error('Error en handler /almacenar', { errorMessage: err.message, stack: err.stack });
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
