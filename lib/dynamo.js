// lib/dynamo.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

// CONFIGURACIÓN CLAVE: Configura el DocumentClient para remover valores undefined
const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // ✅ Esto resuelve el error principal
    convertEmptyValues: true,
    convertClassInstanceToMap: true
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Función utilitaria para limpiar objetos recursivamente
const cleanObject = (obj) => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj
      .map(item => cleanObject(item))
      .filter(item => item !== null && item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanObject(value);
      if (cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }
  
  return obj;
};

// ============ FUNCIONES PARA CACHÉ ============
export const getCache = async (cacheKey) => {
  try {
    const command = new GetCommand({
      TableName: process.env.CACHE_TABLE,
      Key: { cacheKey }
    });
    
    const result = await dynamoDb.send(command);
    
    // Verificar si el item existe y no ha expirado
    if (result.Item && result.Item.expiresAt > Math.floor(Date.now() / 1000)) {
      return result.Item.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error obteniendo caché:", error);
    return null;
  }
};

export const putCache = async (cacheKey, data, ttlSeconds = 1800) => {
  try {
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    
    // Limpiar datos antes de guardar
    const cleanedData = cleanObject(data);
    
    const command = new PutCommand({
      TableName: process.env.CACHE_TABLE,
      Item: {
        cacheKey,
        data: cleanedData,
        expiresAt,
        createdAt: new Date().toISOString()
      }
    });
    
    await dynamoDb.send(command);
  } catch (error) {
    console.error("Error guardando en caché:", error);
    throw error;
  }
};

// ============ FUNCIONES PARA DATOS FUSIONADOS (HISTORIAL) ============
export const putFusion = async (fusionData) => {
  try {
    // Limpiar completamente el objeto de datos undefined/null
    const cleanData = cleanObject(fusionData);
    
    if (!cleanData || !cleanData.id) {
      throw new Error("Los datos de fusión deben tener un ID válido");
    }

    const itemToStore = {
      pk: `FUSION#${cleanData.id}`,
      sk: `ITEM#${cleanData.created_at || new Date().toISOString()}`,
      id: cleanData.id,
      ...cleanData,
      type: "FUSION_DATA"
    };

    const command = new PutCommand({
      TableName: process.env.FUSION_TABLE,
      Item: itemToStore
    });

    await dynamoDb.send(command);
    console.log("✅ Datos fusionados guardados exitosamente");
  } catch (error) {
    console.error("Error guardando datos fusionados:", error);
    throw error;
  }
};

export const getFusionHistory = async (limit = 10, lastEvaluatedKey = null) => {
  try {
    const params = {
      TableName: process.env.FUSION_TABLE,
      FilterExpression: "#type = :type",
      ExpressionAttributeNames: {
        "#type": "type"
      },
      ExpressionAttributeValues: {
        ":type": "FUSION_DATA"
      },
      Limit: limit,
      ScanIndexForward: false // Ordenar por fecha descendente (más reciente primero)
    };
    
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
    
    const command = new ScanCommand(params);
    const result = await dynamoDb.send(command);
    
    // Ordenar por created_at descendente
    const sortedItems = (result.Items || []).sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    return {
      items: sortedItems,
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    throw error;
  }
};

export const getFusionById = async (id) => {
  try {
    const command = new GetCommand({
      TableName: process.env.FUSION_TABLE,
      Key: { 
        pk: `FUSION#${id}`,
        sk: `ITEM#${id}` // Asumiendo que usas el mismo ID
      }
    });
    
    const result = await dynamoDb.send(command);
    return result.Item || null;
  } catch (error) {
    console.error("Error obteniendo fusión por ID:", error);
    return null;
  }
};

// ============ FUNCIONES PARA DATOS PERSONALIZADOS ============
export const putCustom = async (customData) => {
  try {
    // Limpiar datos personalizados
    const cleanedData = cleanObject(customData);
    
    if (!cleanedData || !cleanedData.id) {
      throw new Error("Los datos personalizados deben tener un ID válido");
    }

    const command = new PutCommand({
      TableName: process.env.CUSTOM_TABLE,
      Item: {
        pk: `CUSTOM#${cleanedData.id}`,
        sk: `ITEM#${cleanedData.createdAt || new Date().toISOString()}`,
        ...cleanedData,
        type: "CUSTOM_DATA"
      }
    });
    
    await dynamoDb.send(command);
  } catch (error) {
    console.error("Error guardando datos personalizados:", error);
    throw error;
  }
};

export const getCustomById = async (id) => {
  try {
    const command = new GetCommand({
      TableName: process.env.CUSTOM_TABLE,
      Key: { id }
    });
    
    const result = await dynamoDb.send(command);
    return result.Item || null;
  } catch (error) {
    console.error("Error obteniendo datos personalizados:", error);
    return null;
  }
};

// ============ FUNCIONES LEGACY (mantener compatibilidad) ============
export const putHistory = putFusion; // Alias para compatibilidad
export const getHistoryById = getFusionById; // Alias para compatibilidad