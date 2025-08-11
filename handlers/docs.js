import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Configuración de Swagger basada en el serverless.yml
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SWAPI Weather Fusion API',
      version: '1.0.0',
      description: 'API que fusiona datos de Star Wars (SWAPI) con información meteorológica',
      contact: {
        name: 'Equipo Softtek',
        email: 'soporte@softtek.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://your-api-gateway-url',
        description: 'Servidor de producción'
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // tu definición de schemas aquí
      }
    },
    tags: [
      // tu definición de tags aquí
    ],
  },
  apis: [
    './handlers/*.js',
  
  ]
};


const swaggerSpec = swaggerJSDoc(swaggerOptions);
// Imprime las rutas que encontró
console.log('Rutas Swagger detectadas:', Object.keys(swaggerSpec.paths));
// Imprime las rutas que encontró
console.log('Rutas Swagger detectadas:', Object.keys(swaggerSpec.paths));

export { swaggerSpec };
// Handler para servir la interfaz Swagger UI
export const handler = async (event, context) => {
  try {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SWAPI Weather Fusion API - Documentación</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
      <style>
        .swagger-ui .topbar { display: none !important; }
        .swagger-ui .info { margin: 50px 0; }
        .swagger-ui .info .title { 
          color: #3b4151; 
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        .swagger-ui .info .description { 
          font-size: 1.1rem; 
          color: #3b4151;
          margin-bottom: 2rem;
        }
        body { 
          margin: 0; 
          background: #fafafa; 
        }
        .custom-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
          margin-bottom: 0;
        }
        .custom-header h1 {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 300;
        }
        .custom-header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }
      </style>
    </head>
    <body>
      <div class="custom-header">
        <h1>🌟 SWAPI Weather Fusion API</h1>
        <p>Documentación interactiva de la API</p>
      </div>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: window.location.origin + window.location.pathname.replace('/docs', '') + '/docs.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            docExpansion: 'list',
            filter: true,
            showRequestDuration: true,
            tryItOutEnabled: true,
            requestInterceptor: function(request) {
              request.headers['X-API-Version'] = '1.0';
              return request;
            },
            responseInterceptor: function(response) {
              return response;
            }
          });
        };
      </script>
    </body>
    </html>
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      },
      body: html
    };
  } catch (error) {
    console.error('Error serving Swagger UI:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message
      })
    };
  }
};

// Handler para servir la especificación JSON
export const jsonHandler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify(swaggerSpec, null, 2)
    };
  } catch (error) {
    console.error('Error serving OpenAPI spec:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message
      })
    };
  }
};
