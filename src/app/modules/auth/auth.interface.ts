export type ILoginUser = {
    email: string;
    password: string;
  };
  
  export type ILoginResponse = { token: string; refreshToken: string };