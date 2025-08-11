// handlers/fusionados.js - GET /fusionados
import { searchPerson, getPlanetByUrl, checkSwapiHealth } from "../lib/swapi.js";
import { getCurrentWeather } from "../lib/weather.js";
import { mapPlanetToCoords } from "../lib/util.js";
import { getCache, putCache, putFusion } from "../lib/dynamo.js";
import { v4 as uuidv4 } from "uuid";
/**
 * @openapi
 * /fusionados:
 *   get:
 *     summary: Obtiene datos fusionados de Star Wars y clima actual
 *     description: Recupera información combinada de un personaje de Star Wars, su planeta de origen y el clima actual basado en un mapeo a coordenadas terrestres.
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre o término de búsqueda para el personaje
 *         example: luke
 *     responses:
 *       200:
 *         description: Datos fusionados exitosamente desde APIs externas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 source:
 *                   type: string
 *                   example: apis_externas
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 4f85a1a6-4e51-4c9f-9f2a-5d8a2427003b
 *                     personaje:
 *                       type: object
 *                       properties:
 *                         nombre:
 *                           type: string
 *                           example: Luke Skywalker
 *                         altura_cm:
 *                           type: integer
 *                           example: 172
 *                         peso_kg:
 *                           type: integer
 *                           example: 77
 *                         genero:
 *                           type: string
 *                           example: male
 *                         año_nacimiento:
 *                           type: string
 *                           example: 19BBY
 *                         color_cabello:
 *                           type: string
 *                           example: blond
 *                         color_ojos:
 *                           type: string
 *                           example: blue
 *                         color_piel:
 *                           type: string
 *                           example: fair
 *                     planeta_origen:
 *                       type: object
 *                       properties:
 *                         nombre:
 *                           type: string
 *                           example: Tatooine
 *                         clima:
 *                           type: string
 *                           example: arid
 *                         terreno:
 *                           type: string
 *                           example: desert
 *                         poblacion:
 *                           type: integer
 *                           example: 200000
 *                         diametro_km:
 *                           type: integer
 *                           example: 10465
 *                         periodo_rotacion_horas:
 *                           type: integer
 *                           example: 23
 *                         periodo_orbital_dias:
 *                           type: integer
 *                           example: 304
 *                         gravedad:
 *                           type: string
 *                           example: 1 standard
 *                     clima_actual:
 *                       type: object
 *                       properties:
 *                         disponible:
 *                           type: boolean
 *                           example: true
 *                         ubicacion:
 *                           type: object
 *                           properties:
 *                             coordenadas_terrestres:
 *                               type: object
 *                               properties:
 *                                 lat:
 *                                   type: number
 *                                   example: 25
 *                                 lon:
 *                                   type: number
 *                                   example: 35
 *                                 terrestrial_equivalent:
 *                                   type: string
 *                                   example: Desierto de Arabia
 *                                 expected_climate:
 *                                   type: string
 *                                   example: desert
 *                             planeta_origen:
 *                               type: string
 *                               example: Tatooine
 *                             mapeo_justificacion:
 *                               type: string
 *                               example: Coordenadas terrestres aproximadas para el planeta Tatooine
 *                         condiciones:
 *                           type: object
 *                         consultado_en:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-08-11T00:54:28.394Z
 *                     metadatos_fusion:
 *                       type: object
 *                       properties:
 *                         termino_busqueda:
 *                           type: string
 *                           example: luke
 *                         apis_consultadas:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example:
 *                             - SWAPI (Star Wars API)
 *                             - API Meteorológica
 *                         estrategia_fusion:
 *                           type: string
 *                           example: Mapeo de planetas ficticios a coordenadas terrestres para obtener clima real
 *                         calidad_datos:
 *                           type: object
 *                           properties:
 *                             personaje_completo:
 *                               type: boolean
 *                               example: true
 *                             planeta_disponible:
 *                               type: boolean
 *                               example: true
 *                             clima_disponible:
 *                               type: boolean
 *                               example: true
 *                             porcentaje_completitud:
 *                               type: integer
 *                               example: 100
 *                         tiempo_cache_minutos:
 *                           type: integer
 *                           example: 30
 *                     consultado_en:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-08-11T00:54:28.394Z
 *                     expira_en:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-08-11T01:24:28.394Z
 *                     version_api:
 *                       type: string
 *                       example: "1.0"
 *                 message:
 *                   type: string
 *                   example: Datos fusionados exitosamente desde APIs externas
 *                 cached_for_minutes:
 *                   type: integer
 *                   example: 30
 *       400:
 *         description: Parámetro nombre requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parámetro nombre requerido
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

// Configuración de caché (30 minutos como especifica la prueba)
const CACHE_TTL_SECONDS = 30 * 60;

export const handler = async (event) => {
  console.log('🚀 GET /fusionados - Iniciando consulta de datos fusionados...');
  
  try {
    const qs = event.queryStringParameters || {};
    const search = qs.search || qs.character || qs.personaje;

    // Healthcheck endpoint (opcional para debugging)
    if (qs.healthcheck === 'true') {
      console.log('⚕️ Ejecutando healthcheck...');
      const health = await checkSwapiHealth();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: "Estado de salud de endpoints",
          endpoints: health,
          timestamp: new Date().toISOString()
        })
      };
    }

    // Validar parámetro requerido
    if (!search) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: "Parámetro requerido",
          message: "Se requiere el parámetro 'search', 'character' o 'personaje' para buscar un personaje de Star Wars",
          examples: [
            "GET /fusionados?search=luke",
            "GET /fusionados?character=han solo", 
            "GET /fusionados?personaje=darth vader"
          ]
        })
      };
    }

    console.log(`🔍 Buscando personaje: "${search}"`);

    // 1. VERIFICAR CACHÉ PRIMERO (30 minutos como especifica)
    const cacheKey = `fusionados:${search.toLowerCase().trim()}`;
    try {
      const cached = await getCache(cacheKey);
      if (cached) {
        console.log('📦 Datos encontrados en caché - devolviendo desde caché');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
            'X-Data-Source': 'cache'
          },
          body: JSON.stringify({
            success: true,
            source: "cache",
            cached_at: cached.created_at,
            data: cached,
            message: "Datos fusionados obtenidos desde caché"
          })
        };
      }
      console.log('⏰ No hay datos en caché - consultando APIs externas');
    } catch (cacheError) {
      console.warn('⚠️ Error accediendo al caché:', cacheError.message);
      // Continuar sin caché
    }

    // 2. CONSULTAR API DE STAR WARS (SWAPI)
    let swapiResponse;
    let apiErrors = [];
    
    try {
      console.log('🌌 Consultando SWAPI...');
      swapiResponse = await searchPerson(search);
    } catch (error) {
      console.error("💥 Error crítico con todas las APIs de SWAPI:", error);
      
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false,
          error: "API_EXTERNAL_FAILURE",
          message: "Todos los servicios de Star Wars API están temporalmente no disponibles",
          suggestion: "Intenta nuevamente en unos minutos",
          retry_after: "5 minutes"
        })
      };
    }

    if (swapiResponse.count === 0) {
      console.log(`❌ Personaje "${search}" no encontrado en SWAPI`);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false,
          error: "CHARACTER_NOT_FOUND",
          message: `No se encontró el personaje '${search}' en Star Wars`,
          suggestions: [
            "luke skywalker", "han solo", "darth vader", 
            "princess leia", "obi-wan kenobi", "yoda"
          ]
        })
      };
    }

    const person = swapiResponse.results[0];
    console.log(`✨ Personaje SWAPI encontrado: ${person.name}`);

    // 3. OBTENER INFORMACIÓN DEL PLANETA
    let planet = null;
    try {
      if (person.homeworld) {
        console.log('🪐 Obteniendo información del planeta...');
        planet = await getPlanetByUrl(person.homeworld);
        console.log(`🌍 Planeta obtenido: ${planet.name}`);
      }
    } catch (error) {
      console.error("⚠️ Error obteniendo planeta:", error);
      apiErrors.push({
        service: "SWAPI_PLANET",
        error: error.message,
        impact: "No se pudo obtener información del planeta de origen"
      });
    }

    // 4. MAPEAR PLANETA A COORDENADAS TERRESTRES
    const coords = planet ? mapPlanetToCoords(planet.name) : null;
    console.log(coords ? 
      `🗺️ Coordenadas mapeadas para ${planet.name}: (${coords.lat}, ${coords.lon})` :
      '🗺️ No se pudieron mapear coordenadas'
    );

    // 5. CONSULTAR API METEOROLÓGICA
    let weather = { 
      available: false, 
      message: "No se pudo obtener información meteorológica",
      reason: "No hay coordenadas disponibles"
    };
    
    if (coords) {
      try {
        console.log(`🌤️ Consultando API meteorológica para ${planet.name}...`);
        weather = await getCurrentWeather(coords.lat, coords.lon);
        if (weather.available) {
          console.log(`🌡️ Clima obtenido: ${weather.current?.temperature || 'N/A'}°C, ${weather.current?.description || 'N/A'}`);
        }
      } catch (error) {
        console.error("⚠️ Error obteniendo clima:", error);
        weather = { 
          available: false, 
          error: error.message,
          message: "Error al consultar API meteorológica",
          reason: "Fallo en la consulta externa"
        };
        apiErrors.push({
          service: "WEATHER_API",
          error: error.message,
          impact: "No se pudo obtener información meteorológica"
        });
      }
    } else if (planet) {
      weather.message = `El planeta ${planet.name} no tiene coordenadas terrestres equivalentes`;
      weather.reason = "Planeta ficticio sin mapeo terrestre";
    }

    // 6. FUSIONAR Y NORMALIZAR DATOS
    const fusionedData = {
      id: uuidv4(),
      
      // Información del personaje (normalizada)
      personaje: {
        nombre: person.name,
        altura_cm: person.height === "unknown" ? null : parseInt(person.height),
        peso_kg: (() => {
          if (!person.mass || person.mass === "unknown") return null;
          const mass = person.mass.replace(/,/g, "");
          const numericMass = parseFloat(mass);
          return isNaN(numericMass) ? null : numericMass;
        })(),
        genero: person.gender,
        año_nacimiento: person.birth_year,
        color_cabello: person.hair_color,
        color_ojos: person.eye_color,
        color_piel: person.skin_color
      },
      
      // Información del planeta de origen (normalizada)
      planeta_origen: planet ? {
        nombre: planet.name,
        clima: planet.climate,
        terreno: planet.terrain,
        poblacion: planet.population === "unknown" ? null : parseInt(planet.population),
        diametro_km: planet.diameter === "unknown" ? null : parseInt(planet.diameter),
        periodo_rotacion_horas: planet.rotation_period === "unknown" ? null : parseInt(planet.rotation_period),
        periodo_orbital_dias: planet.orbital_period === "unknown" ? null : parseInt(planet.orbital_period),
        gravedad: planet.gravity
      } : null,
      
      // Información meteorológica (fusionada con planeta)
      clima_actual: weather.available ? {
        disponible: true,
        ubicacion: {
          coordenadas_terrestres: coords,
          planeta_origen: planet?.name,
          mapeo_justificacion: `Coordenadas terrestres aproximadas para el planeta ${planet?.name}`
        },
        condiciones: {
          temperatura_celsius: weather.current?.temperature,
          descripcion: weather.current?.description,
          humedad_porcentaje: weather.current?.humidity,
          viento_kmh: weather.current?.wind_speed,
          presion_hpa: weather.current?.pressure,
          visibilidad_km: weather.current?.visibility
        },
        consultado_en: new Date().toISOString()
      } : {
        disponible: false,
        razon: weather.reason,
        mensaje: weather.message,
        planeta_origen: planet?.name || "Desconocido"
      },
      
      // Metadatos de la fusión
      metadatos_fusion: {
        termino_busqueda: search,
        apis_consultadas: [
          "SWAPI (Star Wars API)",
          ...(weather.available ? ["API Meteorológica"] : [])
        ],
        estrategia_fusion: "Mapeo de planetas ficticios a coordenadas terrestres para obtener clima real",
        calidad_datos: {
          personaje_completo: !!(person.name && person.height !== "unknown" && person.mass !== "unknown"),
          planeta_disponible: !!planet,
          clima_disponible: weather.available === true,
          porcentaje_completitud: (() => {
            let total = 0;
            let disponible = 0;
            
            // Verificar personaje
            total += 3;
            if (person.name) disponible++;
            if (person.height !== "unknown") disponible++;
            if (person.mass !== "unknown") disponible++;
            
            // Verificar planeta
            total += 1;
            if (planet) disponible++;
            
            // Verificar clima
            total += 1;
            if (weather.available) disponible++;
            
            return Math.round((disponible / total) * 100);
          })()
        },
        errores_menores: apiErrors.length > 0 ? apiErrors : undefined,
        tiempo_cache_minutos: 30
      },
      
      // Timestamps
      consultado_en: new Date().toISOString(),
      expira_en: new Date(Date.now() + (CACHE_TTL_SECONDS * 1000)).toISOString(),
      version_api: "1.0"
    };

    // 7. ALMACENAR EN BASE DE DATOS (historial como especifica la prueba)
    try {
      console.log('💾 Almacenando en base de datos para historial...');
      await putFusion(fusionedData);
      console.log('✅ Datos almacenados en historial');
    } catch (error) {
      console.error("⚠️ Error almacenando en BD (no crítico):", error);
      // No fallar la petición por errores de almacenamiento
    }

    // 8. GUARDAR EN CACHÉ (30 minutos como especifica)
    try {
      console.log('📦 Guardando en caché...');
      await putCache(cacheKey, fusionedData, CACHE_TTL_SECONDS);
      console.log('✅ Datos guardados en caché');
    } catch (error) {
      console.error("⚠️ Error guardando en caché (no crítico):", error);
      // No fallar la petición por errores de caché
    }

    console.log('🎉 Fusión completada exitosamente');
    
    // 9. RESPUESTA FINAL SEGÚN ESPECIFICACIÓN
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api',
        'X-Processing-Time': `${Date.now() - new Date(fusionedData.consultado_en).getTime()}ms`
      },
      body: JSON.stringify({
        success: true,
        source: "apis_externas",
        data: fusionedData,
        message: "Datos fusionados exitosamente desde APIs externas",
        cached_for_minutes: 30,
        warnings: apiErrors.length > 0 ? 
          `${apiErrors.length} servicio(s) tuvieron errores menores pero la fusión se completó` : 
          undefined
      })
    };

  } catch (error) {
    console.error("💥 Error crítico en GET /fusionados:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Error interno del servidor",
        timestamp: new Date().toISOString(),
        suggestion: "Intenta nuevamente en unos minutos"
      })
    };
  }
};