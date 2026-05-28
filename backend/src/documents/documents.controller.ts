import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('documents')
@UseGuards(JwtGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  createTestDocument() {
    return this.documentsService.createTestDocument();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadPdf(@UploadedFile() file: Express.Multer.File) {
    return this.documentsService.uploadPdf(file);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }
}
