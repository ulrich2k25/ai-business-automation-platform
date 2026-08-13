import {
  Controller,
  Get,
  Post,
  Req,
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
  uploadPdf(@UploadedFile() file: any, @Req() req: any) {
    return this.documentsService.uploadPdf(file, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.documentsService.findAll(req.user);
  }
}
