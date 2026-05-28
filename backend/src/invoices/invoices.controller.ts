import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';

import { InvoicesService } from './invoices.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('invoices')
@UseGuards(JwtGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.invoicesService.updateStatus(id, status);
  }
}