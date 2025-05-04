
export class JwtPayload {

    sub!: string;                  // Username or user identifier
    authorities!: string[];        // Roles and permissions
    type!: string;                 // Token type, e.g., "access"
    iat!: number;                  // Issued at (Unix timestamp)
    exp!: number;                  // Expiry (Unix timestamp)
}
