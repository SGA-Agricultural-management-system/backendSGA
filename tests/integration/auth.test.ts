import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../../src/interfaces/http/server';

describe('Auth Integration', () => {
    let app: FastifyInstance;
    let prisma: PrismaClient;

    beforeAll(async () => {
        prisma = new PrismaClient({
            datasourceUrl: process.env.TEST_DATABASE_URL,
        });
        // Limpiar tablas en orden respetando FK
        await prisma.activity.deleteMany();
        await prisma.sensorReading.deleteMany();
        await prisma.lot.deleteMany();
        await prisma.farm.deleteMany();
        await prisma.refreshToken.deleteMany();
        await prisma.user.deleteMany();

        app = await buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it('POST /api/v1/auth/register should create a user and return tokens', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                name: 'Test Farmer',
                email: 'farmer@test.com',
                password: 'password123',
                farm_name: 'Finca Test',
            },
        });

        expect(response.statusCode).toBe(201);
        const body = response.json();
        expect(body.access_token).toBeDefined();
        expect(body.refresh_token).toBeDefined();
        expect(body.user.email).toBe('farmer@test.com');
    });

    it('POST /api/v1/auth/login should return tokens if credentials are correct', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'farmer@test.com',
                password: 'password123',
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().access_token).toBeDefined();
    });

    it('POST /api/v1/auth/login should fail with wrong password', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'farmer@test.com',
                password: 'wrongpass',
            },
        });

        expect(response.statusCode).toBe(401);
    });
});