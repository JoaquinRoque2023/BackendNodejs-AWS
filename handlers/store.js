import { putCustom } from "../lib/dynamo.js";
import { v4 as uuidv4 } from "uuid";

export const handler = async (event) => {
  try {
    if (!event.body) {
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
    
    await putCustom(item);
    return { statusCode: 201, body: JSON.stringify({ message: "stored", item }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};