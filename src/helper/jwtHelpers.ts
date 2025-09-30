import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
 
const createToken = (
  payload: {
    id: string;
    role: string;
    email: string;
},
  secret: Secret,
  expireTime: string | number
): string => {
  return jwt.sign(payload, secret, { expiresIn: expireTime } as jwt.SignOptions);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
