import {
    BlobSASPermissions,
    generateBlobSASQueryParameters,
    StorageSharedKeyCredential,
    SASProtocol,
} from '@azure/storage-blob';

interface AzureSasConfig {
    accountName: string;
    accountKey: string;
}

interface GenerateSasUrlOptions {
    blobUrl: string;
    containerName: string;
    expiresInMs?: number;
    contentDisposition?: string;
}

interface SasUrlResult {
    url: string;
    expires_at: string;
}

/**
 * Generate a time-limited SAS URL for an Azure Blob Storage blob.
 * Extracts the blob path from the full blob URL and creates a read-only SAS token.
 */
export function generateSasUrl(
    azureConfig: AzureSasConfig,
    options: GenerateSasUrlOptions,
): SasUrlResult {
    const { accountName, accountKey } = azureConfig;
    const { blobUrl, containerName, contentDisposition } = options;
    const expiresInMs = options.expiresInMs ?? 60 * 60 * 1000; // 1 hour default

    // Extract blob name from the full URL
    // URL format: https://{account}.blob.core.windows.net/{container}/{blobPath}
    const blobName = extractBlobName(blobUrl, containerName, accountName);

    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const expiresOn = new Date(Date.now() + expiresInMs);

    const sasToken = generateBlobSASQueryParameters(
        {
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse('r'),
            expiresOn,
            protocol: SASProtocol.Https,
            contentDisposition,
        },
        credential,
    ).toString();

    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

    return { url, expires_at: expiresOn.toISOString() };
}

/**
 * Extract the blob name (path within container) from a full Azure Blob URL.
 * Handles URLs like:
 *   https://account.blob.core.windows.net/container/recordings/id/file.mp4
 *   recordings/id/file.mp4
 */
function extractBlobName(
    blobUrl: string,
    containerName: string,
    accountName: string,
): string {
    // If it's already a relative path (no protocol), use as-is
    if (!blobUrl.startsWith('http')) {
        return blobUrl;
    }

    const prefix = `https://${accountName}.blob.core.windows.net/${containerName}/`;
    if (blobUrl.startsWith(prefix)) {
        return blobUrl.slice(prefix.length);
    }

    // Fallback: try to parse as URL and extract path after container
    try {
        const parsed = new URL(blobUrl);
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        // First part is container name, rest is blob path
        if (pathParts[0] === containerName) {
            return pathParts.slice(1).join('/');
        }
        return pathParts.join('/');
    } catch {
        return blobUrl;
    }
}
