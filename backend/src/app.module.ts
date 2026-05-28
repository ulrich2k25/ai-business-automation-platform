import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentsModule } from './documents/documents.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [PrismaModule, DocumentsModule, AiModule, AuthModule, InvoicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
