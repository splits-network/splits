import NodeClam from 'clamscan';
import { createLogger } from '@splits-network/shared-logging';
import { Readable } from 'stream';

const logger = createLogger('scanner-service');

export interface ScanResult {
    isClean: boolean;
    isInfected: boolean;
    viruses: string[];
}

export class ScannerService {
    private clamscan: NodeClam | null = null;
    private initialized = false;

    constructor() { }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            logger.info('Initializing ClamAV scanner...');

            // Configure ClamAV to connect to the docker-compose service
            this.clamscan = (await new NodeClam().init({
                removeInfected: false, // We handle removal manually
                quarantineInfected: false,
                scanLog: undefined,
                debugMode: false,
                fileList: undefined,
                scanRecursively: true,
                clamdscan: {
                    host: process.env.CLAMAV_HOST || 'clamav',
                    port: parseInt(process.env.CLAMAV_PORT || '3310', 10),
                    timeout: 60000,
                    localFallback: false,
                    path: '/usr/bin/clamdscan',
                    configFile: undefined,
                    multiscan: true,
                    reloadDb: false,
                    active: true,
                    bypassTest: false,
                },
                preference: 'clamdscan'
            })) as unknown as NodeClam;

            this.initialized = true;
            logger.info('ClamAV scanner initialized successfully');
        } catch (error) {
            logger.error(error, 'Failed to initialize ClamAV scanner');
            throw error;
        }
    }

    /**
     * Scan a buffer for viruses
     */
    async scanBuffer(buffer: Buffer): Promise<ScanResult> {
        if (!this.initialized || !this.clamscan) {
            await this.initialize();
        }

        try {
            logger.debug(`Scanning buffer of size ${buffer.length} bytes`);

            // Convert buffer to stream for clamscan
            const stream = Readable.from(buffer);

            // @ts-ignore - The types for clamscan are slightly inaccurate for scanStream
            const { isInfected, viruses } = await this.clamscan.scanStream(stream);

            const result: ScanResult = {
                isClean: !isInfected,
                isInfected: !!isInfected,
                viruses: viruses || []
            };

            if (result.isInfected) {
                logger.warn(`Virus detected! Viruses: ${result.viruses.join(', ')}`);
            } else {
                logger.debug('Buffer scan complete: Clean');
            }

            return result;
        } catch (error) {
            logger.error(error, 'Error scanning buffer');
            throw error;
        }
    }
}
