export {};

// Create a type for the roles (match Clerk example)
export type Roles = 'admin' | 'moderator';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
