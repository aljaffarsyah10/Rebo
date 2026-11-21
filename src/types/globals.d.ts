export {};

// REBO V2: Role-based personas and access control
export type UserRole = 'admin' | 'koordinator' | 'operator' | 'tpi';
export type Roles = UserRole;

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
      assigned_pilar_id?: string | null;
    };
  }

  interface UserPublicMetadata {
    role?: UserRole | null;
    assigned_pilar_id?: string | null;
  }
}
