import { NotImplementedError } from "./errors";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";

// TODO(roman): implement these
// external libraries can be used
// you can even ignore them and use your own preferred method

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(7);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
}

export function generateToken(data: TokenData): string {
  const payload = {};
  const secret = process.env.ACCESS_TOKEN_SECRET ?? "some_default_secret";
  const options: SignOptions = {
    expiresIn: "40m",
    audience: data.id.toString()
  };

  const token = jwt.sign(payload, secret, options);
  console.log("token: ", token);
  return token;
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
  let userIdFromToken = decoded?.aud;
  let userId = -1;
  if(!Array.isArray(userIdFromToken) && userIdFromToken){
    userId = parseInt(userIdFromToken);
  }
  return {id: userId};
}

export interface TokenData {
  id: number;
}