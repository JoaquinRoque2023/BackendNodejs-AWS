// lib/swapi.js - CORREGIDO
import https from 'https';

// Lista de APIs alternativas ordenadas por prioridad
const SWAPI_ENDPOINTS = [
  'https://swapi.tech/api',            // Más moderna y confiable
  'https://swapi.py4e.com/api',        // Alternativa académica
  'https://swapi-node.vercel.app/api', // Alternativa en Node.js
  'https://swapi.dev/api'              // Original
];

const isDevelopment = process.env.NODE_ENV !== 'production';
const httpsAgent = isDevelopment ? new https.Agent({ rejectUnauthorized: false }) : undefined;

console.log(`🔧 SWAPI configurado con ${SWAPI_ENDPOINTS.length} endpoints de respaldo`);
console.log(`   Modo: ${process.env.NODE_ENV || 'development'}`);
console.log(`   SSL verificación: ${!isDevelopment ? 'HABILITADA' : 'DESHABILITADA'}`);

/**
 * Buscar personaje con múltiples endpoints y fallback si no hay resultados
 */
export const searchPerson = async (search, retryCount = 0) => {
  const maxEndpoints = SWAPI_ENDPOINTS.length;
  if (retryCount >= maxEndpoints) {
    throw new Error('Todos los endpoints de SWAPI están fallando o sin resultados.');
  }

  const currentEndpoint = SWAPI_ENDPOINTS[retryCount];
  console.log(`🌐 Intentando endpoint ${retryCount + 1}/${maxEndpoints}: ${currentEndpoint}`);

  try {
    const fetchOptions = { timeout: 10000 };
    if (httpsAgent) fetchOptions.agent = httpsAgent;

    let searchUrl;
    if (currentEndpoint.includes('swapi.tech')) {
      searchUrl = `${currentEndpoint}/people/?name=${encodeURIComponent(search)}`;
    } else {
      searchUrl = `${currentEndpoint}/people/?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(searchUrl, fetchOptions);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();

    // Normalizar respuesta de swapi.tech
    if (currentEndpoint.includes('swapi.tech')) {
      const normalizedResults = data.result
        ? data.result.map(item => ({
            name: item.properties?.name || item.name,
            height: item.properties?.height,
            mass: item.properties?.mass,
            gender: item.properties?.gender,
            birth_year: item.properties?.birth_year,
            hair_color: item.properties?.hair_color,
            skin_color: item.properties?.skin_color,
            eye_color: item.properties?.eye_color,
            homeworld: item.properties?.homeworld
          }))
        : [];
      const count = data.total_records || normalizedResults.length || 0;

      if (count === 0) {
        console.log(`⚠️ Sin resultados en ${currentEndpoint}, probando siguiente...`);
        return await searchPerson(search, retryCount + 1);
      }
      console.log(`✅ Personaje encontrado en ${currentEndpoint}`);
      return { count, results: normalizedResults };
    }

    // Para otros endpoints (formato clásico)
    if (data.count === 0 && retryCount < maxEndpoints - 1) {
      console.log(`⚠️ Sin resultados en ${currentEndpoint}, probando siguiente...`);
      return await searchPerson(search, retryCount + 1);
    }

    console.log(`✅ Personaje encontrado en ${currentEndpoint}`);
    return data;

  } catch (error) {
    console.warn(`❌ Endpoint ${currentEndpoint} falló: ${error.message}`);
    console.log(`🔄 Probando siguiente endpoint...`);
    return await searchPerson(search, retryCount + 1);
  }
};

/**
 * Obtener planeta por URL con múltiples endpoints
 */
export const getPlanetByUrl = async (planetUrl, retryCount = 0) => {
  const maxEndpoints = SWAPI_ENDPOINTS.length;
  if (retryCount >= maxEndpoints) {
    throw new Error('Todos los endpoints de SWAPI están fallando para obtener planeta.');
  }

  try {
    const fetchOptions = { timeout: 10000 };
    if (httpsAgent) fetchOptions.agent = httpsAgent;

    let adjustedUrl = planetUrl;
    if (retryCount > 0) {
      const currentEndpoint = SWAPI_ENDPOINTS[retryCount];
      const baseUrl = currentEndpoint.replace('/api', '');
      adjustedUrl = planetUrl.replace(/https:\/\/[^\/]+/, baseUrl);
      console.log(`🔄 Ajustando URL del planeta a: ${adjustedUrl}`);
    }

    const response = await fetch(adjustedUrl, fetchOptions);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const planetData = await response.json();

    // Normalizar swapi.tech
    if (planetData.result && planetData.result.properties) {
      return planetData.result.properties;
    }
    return planetData;

  } catch (error) {
    console.warn(`❌ Error obteniendo planeta: ${error.message}`);
    return await getPlanetByUrl(planetUrl, retryCount + 1);
  }
};

/**
 * Verificar salud de los endpoints SWAPI
 */
export const checkSwapiHealth = async () => {
  console.log('⚕️ Verificando salud de endpoints SWAPI...');
  const healthResults = [];

  for (const endpoint of SWAPI_ENDPOINTS) {
    try {
      const fetchOptions = { timeout: 5000 };
      if (httpsAgent) fetchOptions.agent = httpsAgent;

      const startTime = Date.now();
      const response = await fetch(`${endpoint}/people/1/`, fetchOptions);
      const responseTime = Date.now() - startTime;

      healthResults.push({
        endpoint,
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        httpStatus: response.status
      });

      console.log(`✅ ${endpoint}: ${response.ok ? 'OK' : 'FAIL'} (${responseTime}ms)`);

    } catch (error) {
      healthResults.push({
        endpoint,
        status: 'error',
        error: error.message,
        sslError: error.message.includes('certificate') || error.code === 'CERT_HAS_EXPIRED'
      });
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
    }
  }
  return healthResults;
};
