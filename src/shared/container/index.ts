import 'reflect-metadata';
import { container } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IFarmRepository } from '@domain/repositories/IFarmRepository';
import { IActivityRepository } from '@domain/repositories/IActivityRepository';
import { ITokenService } from '@application/ports/ITokenService';
import { IPasswordService } from '@application/ports/IPasswordService';
import { ICacheService } from '@application/ports/ICacheService';
import { INotificationService } from '@application/ports/INotificationService';
import { ISensorService } from '@application/ports/ISensorService';
import { PrismaUserRepository } from '@infrastructure/database/repositories/PrismaUserRepository';
import { PrismaFarmRepository } from '@infrastructure/database/repositories/PrismaFarmRepository';
import { PrismaActivityRepository } from '@infrastructure/database/repositories/PrismaActivityRepository';
import { JwtTokenService } from '@infrastructure/auth/JwtTokenService';
import { BcryptPasswordService } from '@infrastructure/auth/BcryptPasswordService';
import { RedisAdapter } from '@infrastructure/cache/RedisAdapter';
import { EmailAdapter } from '@infrastructure/notifications/EmailAdapter';
import { SensorAdapter } from '@infrastructure/sensors/SensorAdapter';

// Repositories
container.registerSingleton<IUserRepository>('IUserRepository', PrismaUserRepository);
container.registerSingleton<IFarmRepository>('IFarmRepository', PrismaFarmRepository);
container.registerSingleton<IActivityRepository>('IActivityRepository', PrismaActivityRepository);

// Auth & cache
container.registerSingleton<ITokenService>('ITokenService', JwtTokenService);
container.registerSingleton<IPasswordService>('IPasswordService', BcryptPasswordService);
container.registerSingleton<ICacheService>('ICacheService', RedisAdapter);

// Notificaciones y sensores
container.registerSingleton<INotificationService>('INotificationService', EmailAdapter);
container.registerSingleton<ISensorService>('ISensorService', SensorAdapter);

export { container };