import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventPublisher } from '../src/events';
import amqp from 'amqplib';
import { DomainEvent } from '@splits-network/shared-types';

// Mock amqplib
vi.mock('amqplib');

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

describe('EventPublisher', () => {
  let eventPublisher: EventPublisher;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockChannel = {
      assertExchange: vi.fn(),
      publish: vi.fn(),
    };
    
    mockConnection = {
      createChannel: vi.fn().mockResolvedValue(mockChannel),
    };
    
    vi.mocked(amqp.connect).mockResolvedValue(mockConnection as any);
    
    eventPublisher = new EventPublisher('amqp://localhost', mockLogger as any);
  });

  describe('constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(eventPublisher).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should successfully connect to RabbitMQ', async () => {
      await eventPublisher.connect();

      expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost');
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'splits-network-events',
        'topic',
        { durable: true }
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Connected to RabbitMQ');
    });

    it('should handle connection errors', async () => {
      const connectionError = new Error('Connection failed');
      vi.mocked(amqp.connect).mockRejectedValue(connectionError);

      await expect(eventPublisher.connect()).rejects.toThrow('Connection failed');
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        { err: connectionError },
        'Failed to connect to RabbitMQ'
      );
    });

    it('should handle channel creation errors', async () => {
      const channelError = new Error('Channel creation failed');
      mockConnection.createChannel.mockRejectedValue(channelError);

      await expect(eventPublisher.connect()).rejects.toThrow('Channel creation failed');
    });

    it('should handle null channel', async () => {
      mockConnection.createChannel.mockResolvedValue(null);

      await expect(eventPublisher.connect()).rejects.toThrow('Failed to create channel');
    });

    it('should handle exchange assertion errors', async () => {
      const exchangeError = new Error('Exchange assertion failed');
      mockChannel.assertExchange.mockRejectedValue(exchangeError);

      await expect(eventPublisher.connect()).rejects.toThrow('Exchange assertion failed');
    });
  });

  describe('publish', () => {
    beforeEach(async () => {
      await eventPublisher.connect();
    });

    it('should successfully publish an event', async () => {
      const eventType = 'user.created';
      const payload = { userId: '123', email: 'test@example.com' };
      const sourceService = 'identity-service';

      await eventPublisher.publish(eventType, payload, sourceService);

      expect(mockChannel.publish).toHaveBeenCalledTimes(1);
      
      const publishCall = mockChannel.publish.mock.calls[0];
      expect(publishCall[0]).toBe('splits-network-events'); // exchange
      expect(publishCall[1]).toBe('user.created'); // routing key
      
      // Parse the message buffer
      const messageBuffer = publishCall[2];
      const event = JSON.parse(messageBuffer.toString()) as DomainEvent;
      
      expect(event.event_type).toBe(eventType);
      expect(event.source_service).toBe(sourceService);
      expect(event.payload).toEqual(payload);
      expect(event.event_id).toBeDefined();
      expect(event.timestamp).toBeDefined();
      
      // Verify event_id is a valid UUID format
      expect(event.event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      
      // Verify timestamp is a valid ISO string
      expect(new Date(event.timestamp).toISOString()).toBe(event.timestamp);
    });

    it('should handle complex payload objects', async () => {
      const complexPayload = {
        user: {
          id: '123',
          email: 'test@example.com',
          metadata: { source: 'api', version: 2 }
        },
        organization: {
          id: '456',
          name: 'Test Org'
        },
        timestamp: new Date().toISOString(),
        nested: {
          array: [1, 2, 3],
          boolean: true,
          null_value: null
        }
      };

      await eventPublisher.publish('membership.created', complexPayload, 'identity-service');

      expect(mockChannel.publish).toHaveBeenCalledTimes(1);
      
      const messageBuffer = mockChannel.publish.mock.calls[0][2];
      const event = JSON.parse(messageBuffer.toString()) as DomainEvent;
      
      expect(event.payload).toEqual(complexPayload);
    });

    it('should use event type as routing key', async () => {
      const eventTypes = [
        'user.created',
        'user.updated', 
        'organization.created',
        'membership.added',
        'invitation.sent'
      ];

      for (const eventType of eventTypes) {
        await eventPublisher.publish(eventType, {}, 'identity-service');
        
        const lastCall = mockChannel.publish.mock.calls[mockChannel.publish.mock.calls.length - 1];
        expect(lastCall[1]).toBe(eventType); // routing key should match event type
      }
    });

    it('should skip publishing when channel is not initialized', async () => {
      const unconnectedPublisher = new EventPublisher('amqp://localhost', mockLogger as any);

      await unconnectedPublisher.publish('test.event', {}, 'test-service');

      expect(mockChannel.publish).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { event_type: 'test.event' },
        'Skipping event publish - RabbitMQ channel not initialized'
      );
    });

    it('should handle empty payload', async () => {
      await eventPublisher.publish('test.event', {}, 'identity-service');

      const messageBuffer = mockChannel.publish.mock.calls[0][2];
      const event = JSON.parse(messageBuffer.toString()) as DomainEvent;
      
      expect(event.payload).toEqual({});
    });

    it('should generate unique event IDs for each publish', async () => {
      await eventPublisher.publish('event1', {}, 'service1');
      await eventPublisher.publish('event2', {}, 'service2');

      const event1Buffer = mockChannel.publish.mock.calls[0][2];
      const event2Buffer = mockChannel.publish.mock.calls[1][2];
      
      const event1 = JSON.parse(event1Buffer.toString()) as DomainEvent;
      const event2 = JSON.parse(event2Buffer.toString()) as DomainEvent;
      
      expect(event1.event_id).not.toBe(event2.event_id);
    });

    it('should generate timestamps close to current time', async () => {
      const beforePublish = new Date();
      await eventPublisher.publish('test.event', {}, 'identity-service');
      const afterPublish = new Date();

      const messageBuffer = mockChannel.publish.mock.calls[0][2];
      const event = JSON.parse(messageBuffer.toString()) as DomainEvent;
      const eventTime = new Date(event.timestamp);
      
      expect(eventTime.getTime()).toBeGreaterThanOrEqual(beforePublish.getTime());
      expect(eventTime.getTime()).toBeLessThanOrEqual(afterPublish.getTime());
    });
  });
});