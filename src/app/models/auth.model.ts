export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
}

export interface IRegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface IRegisterResponse {
  id: number;
}