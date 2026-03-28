/**
 * Simple application-level encryption for request payloads.
 * This is used to obscure sensitive data (email/password) in the browser's 
 * Network tab, providing an additional layer of privacy for the local user.
 */

const ENCRYPTION_KEY = "propvista_secure_app_key_2026";

export function encryptPayload(data: any): string {
    try {
        const jsonString = JSON.stringify(data);
        let result = "";
        for (let i = 0; i < jsonString.length; i++) {
            // Simple XOR obfuscation
            result += String.fromCharCode(
                jsonString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
            );
        }
        // Use btoa for browser-compatible base64
        return typeof window !== "undefined" 
            ? btoa(result) 
            : Buffer.from(result, "binary").toString("base64");
    } catch (error) {
        console.error("Encryption error:", error);
        return "";
    }
}

export function decryptPayload(encrypted: string): any {
    try {
        const binaryString = typeof window !== "undefined"
            ? atob(encrypted)
            : Buffer.from(encrypted, "base64").toString("binary");
            
        let result = "";
        for (let i = 0; i < binaryString.length; i++) {
            result += String.fromCharCode(
                binaryString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
            );
        }
        return JSON.parse(result);
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
}
