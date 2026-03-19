import { NextResponse } from 'next/server';

import { env } from '@/lib/env';

const baseUrl = env.NEXT_PUBLIC_APP_URL ?? 'https://app.doculet.ai';

export async function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'Doculet Partner API',
      version: '1.0.0',
      description:
        'REST API for partners to verify certificates and check student status. Authenticate with API key via Bearer token or X-API-Key header.',
    },
    servers: [{ url: `${baseUrl}/api/partner/v1`, description: 'API base' }],
    security: [{ apiKey: [] }],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Bearer <pk_live_...> or use X-API-Key header',
        },
      },
      schemas: {
        CertificateVerifyResponse: {
          type: 'object',
          properties: {
            found: { type: 'boolean' },
            valid: { type: 'boolean' },
            holderLabel: { type: 'string' },
            schoolName: { type: 'string', nullable: true },
            programName: { type: 'string', nullable: true },
            amountKobo: { type: 'integer', nullable: true },
            currency: { type: 'string', nullable: true },
            issuedAt: { type: 'string', format: 'date-time', nullable: true },
            validUntil: { type: 'string', format: 'date-time', nullable: true },
            tier: { type: 'integer', nullable: true },
            status: { type: 'string', nullable: true },
          },
        },
        StudentStatusResponse: {
          type: 'object',
          properties: {
            studentId: { type: 'string' },
            tier: { type: 'integer' },
            verifiedAt: { type: 'string', format: 'date-time' },
            kycStatus: { type: 'string', nullable: true },
            bankStatus: { type: 'string', nullable: true },
            certificateStatus: { type: 'string', nullable: true },
            certificateIssuedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        StudentListItem: {
          type: 'object',
          properties: {
            studentId: { type: 'string' },
            id: { type: 'string', description: 'Link record ID for cursor' },
            tier: { type: 'integer' },
            verifiedAt: { type: 'string', format: 'date-time' },
            schoolName: { type: 'string', nullable: true },
          },
        },
        StudentsListResponse: {
          type: 'object',
          properties: {
            students: { type: 'array', items: { $ref: '#/components/schemas/StudentListItem' } },
            nextCursor: { type: 'string', nullable: true },
          },
        },
        WebhookDelivery: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            eventType: { type: 'string' },
            entityId: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'delivered', 'failed'] },
            attempts: { type: 'integer' },
            responseStatus: { type: 'integer', nullable: true },
            lastAttemptAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        WebhookDeliveriesResponse: {
          type: 'object',
          properties: {
            deliveries: { type: 'array', items: { $ref: '#/components/schemas/WebhookDelivery' } },
          },
        },
      },
    },
    paths: {
      '/certificates/verify': {
        get: {
          summary: 'Verify certificate by token',
          description: 'Verify a proof-of-funds certificate. Requires certificatesRead scope.',
          operationId: 'verifyCertificate',
          parameters: [
            {
              name: 'token',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Certificate token from share link',
            },
          ],
          responses: {
            '200': {
              description: 'Verification result',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CertificateVerifyResponse' },
                },
              },
            },
            '400': { description: 'Missing token parameter' },
            '401': { description: 'Invalid or missing API key' },
            '403': { description: 'API key lacks certificatesRead scope' },
            '500': { description: 'Internal error' },
          },
        },
      },
      '/students': {
        get: {
          summary: 'List linked students',
          description:
            'Paginated list of students linked to your partner account. Requires studentsRead scope.',
          operationId: 'listStudents',
          parameters: [
            { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Cursor for pagination' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Page size (max 100)' },
          ],
          responses: {
            '200': {
              description: 'List of students',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StudentsListResponse' },
                },
              },
            },
            '401': { description: 'Invalid or missing API key' },
            '403': { description: 'API key lacks studentsRead scope' },
          },
        },
      },
      '/students/{studentId}/status': {
        get: {
          summary: 'Get student status',
          description:
            'Get KYC, bank, and certificate status for a student linked to your partner account. Requires studentsRead scope.',
          operationId: 'getStudentStatus',
          parameters: [
            {
              name: 'studentId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Student status',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StudentStatusResponse' },
                },
              },
            },
            '401': { description: 'Invalid or missing API key' },
            '403': { description: 'API key lacks studentsRead scope' },
            '404': { description: 'Student not linked to this partner' },
          },
        },
      },
      '/webhooks/deliveries': {
        get: {
          summary: 'List webhook deliveries',
          description:
            'Recent webhook delivery attempts for debugging. Requires webhooksWrite scope.',
          operationId: 'listWebhookDeliveries',
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Page size (max 100)' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'delivered', 'failed'] } },
          ],
          responses: {
            '200': {
              description: 'List of deliveries',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/WebhookDeliveriesResponse' },
                },
              },
            },
            '401': { description: 'Invalid or missing API key' },
            '403': { description: 'API key lacks webhooksWrite scope' },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
