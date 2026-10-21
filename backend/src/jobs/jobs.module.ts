import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [AiModule, AuthModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
