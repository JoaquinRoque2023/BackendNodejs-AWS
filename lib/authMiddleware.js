import { verifyToken } from '../lib/jwt.js';

export const requireAuth = async (event) => {
  try {
    // Leer token de authorizationToken (TOKEN authorizer) o headers.Authorization (REQUEST authorizer)
    const tokenFromAuthToken = event.authorizationToken?.split(' ')[1];
    const tokenFromHeaders = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1];
    
    const token = tokenFromAuthToken || tokenFromHeaders;

    if (!token) {
      return generatePolicy('user', 'Deny', event.methodArn || event.routeArn || '*');
    }

    const user = verifyToken(token);

    return generatePolicy(user.username || 'user', 'Allow', event.methodArn || event.routeArn || '*');
  } catch (error) {
    return generatePolicy('user', 'Deny', event.methodArn || event.routeArn || '*');
  }
};

function generatePolicy(principalId, effect, resource) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      }],
    },
  };
}
