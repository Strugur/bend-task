import { NotImplementedError } from "./errors";
import jwt, { SignOptions } from "jsonwebtoken";

// TODO(roman): implement these
// external libraries can be used
// you can even ignore them and use your own preferred method

export function hashPassword(password: string): string {
 
  throw new NotImplementedError('PASSWORD_HASHING_NOT_IMPLEMENTED_YET');
}

export function generateToken(data: TokenData): string {
  console.log("userId: ", data.id);
  const payload = {};
  const secret = process.env.ACCESS_TOKEN_SECRET ?? "some_default_secret";
  console.log("secret: ", secret);
  const options: SignOptions = {
    expiresIn: "40m",
    audience: data.id.toString()
  };

  const token = jwt.sign(payload, secret, options);
  console.log("token: ", token);
  return token;
  // throw new NotImplementedError('TOKEN_GENERATION_NOT_IMPLEMENTED_YET');
}

export function isValidToken(token: string): boolean {
  const secret = process.env.ACCESS_TOKEN_SECRET ?? "some_default_secret";
  try {
    var decoded = jwt.verify(token, secret);
    console.log("decoded: ", decoded);
    return true;
  } catch(err) {
    return false;
  }
}
 
// NOTE(roman): assuming that `isValidToken` will be called before
export function extraDataFromToken(token: string): TokenData {
  const decoded = jwt.decode(token, {json:true});

  // console.log("[extraDataFromToken] decoded: ", decoded);
  console.log("[extraDataFromToken] decoded: ", decoded?.aud);
  // const userId = decoded?.aud as number ;
  return {id: 2};
  // throw new NotImplementedError('TOKEN_EXTRACTION_NOT_IMPLEMENTED_YET');
}

export interface TokenData {
  id: number;
}