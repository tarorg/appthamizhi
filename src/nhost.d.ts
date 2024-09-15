declare module '@nhost/nhost-js' {
  export class NhostClient {
    constructor(config: { subdomain: string; region: string });
    auth: {
      isAuthenticatedAsync(): Promise<boolean>;
      signOut(): Promise<void>;
      signIn(options: { provider: string }): Promise<void>;
    };
  }
}