import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SEPARATOR = ':';

/**
 * AES-256-GCM encryption service for sensitive data at rest.
 *
 * Encrypted format: `iv:authTag:ciphertext` (all base64-encoded, colon-delimited)
 *
 * Usage:
 *   const crypto = new CryptoService(base64Key);
 *   const encrypted = crypto.encrypt(plaintext);
 *   const decrypted = crypto.decrypt(encrypted);
 */
export class CryptoService {
    private key: Buffer;

    constructor(base64Key: string) {
        this.key = Buffer.from(base64Key, 'base64');
        if (this.key.length !== 32) {
            throw new Error('Encryption key must be exactly 32 bytes (256 bits) when decoded from base64');
        }
    }

    encrypt(plaintext: string): string {
        const iv = randomBytes(IV_LENGTH);
        const cipher = createCipheriv(ALGORITHM, this.key, iv, { authTagLength: AUTH_TAG_LENGTH });

        const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();

        return [
            iv.toString('base64'),
            authTag.toString('base64'),
            encrypted.toString('base64'),
        ].join(SEPARATOR);
    }

    decrypt(ciphertext: string): string {
        const parts = ciphertext.split(SEPARATOR);
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format — expected iv:authTag:ciphertext');
        }

        const [ivB64, authTagB64, encryptedB64] = parts;
        const iv = Buffer.from(ivB64, 'base64');
        const authTag = Buffer.from(authTagB64, 'base64');
        const encrypted = Buffer.from(encryptedB64, 'base64');

        const decipher = createDecipheriv(ALGORITHM, this.key, iv, { authTagLength: AUTH_TAG_LENGTH });
        decipher.setAuthTag(authTag);

        return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    }

    /**
     * Check if a value looks like it's already encrypted (matches iv:authTag:ciphertext format).
     * Useful for migration scripts to skip already-encrypted rows.
     */
    static isEncrypted(value: string): boolean {
        const parts = value.split(SEPARATOR);
        if (parts.length !== 3) return false;

        try {
            const iv = Buffer.from(parts[0], 'base64');
            const authTag = Buffer.from(parts[1], 'base64');
            return iv.length === IV_LENGTH && authTag.length === AUTH_TAG_LENGTH;
        } catch {
            return false;
        }
    }
}

/** Singleton instance, initialized lazily from Vault */
let cryptoServiceInstance: CryptoService | null = null;

/**
 * Get a CryptoService instance with the encryption key loaded from Supabase Vault.
 * Caches the instance after first call.
 */
export async function getCryptoService(): Promise<CryptoService> {
    if (cryptoServiceInstance) return cryptoServiceInstance;

    const { getSecret } = await import('./vault');
    const key = await getSecret('integration_encryption_key');
    cryptoServiceInstance = new CryptoService(key);
    return cryptoServiceInstance;
}

/**
 * Generate a new random 256-bit encryption key as base64.
 * Use this once to create the Vault secret value.
 */
export function generateEncryptionKey(): string {
    return randomBytes(32).toString('base64');
}
