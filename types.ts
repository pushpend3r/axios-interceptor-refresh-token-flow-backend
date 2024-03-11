interface LoginRequestBody {
  email: string;
  password: string;
}

interface SignUpRequestBody {
  name: string;
  email: string;
  password: string;
}

interface AccessTokenBody {
  refreshToken: string;
}

interface DbUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

interface TokenPayload extends Omit<DbUser, "password"> {
  tokenType: TokenType;
}

export type {
  LoginRequestBody,
  SignUpRequestBody,
  AccessTokenBody,
  DbUser,
  TokenPayload,
};

export { TokenType };
