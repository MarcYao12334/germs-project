import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { InterventionsModule } from './modules/interventions/interventions.module';
import { TeamsModule } from './modules/teams/teams.module';
import { UsersModule } from './modules/users/users.module';
import { WebsocketModule } from './websocket/websocket.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // PostgreSQL + PostGIS
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'germs_user',
      password: process.env.DB_PASSWORD || 'germs_dev_password',
      database: process.env.DB_NAME || 'germs_dev',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // On utilise init.sql
    }),

    // Redis + Bull Queues
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // JWT
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-jwt-secret',
      signOptions: { expiresIn: '24h' },
    }),

    // Feature modules
    AuthModule,
    AlertsModule,
    InterventionsModule,
    TeamsModule,
    UsersModule,
    WebsocketModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
