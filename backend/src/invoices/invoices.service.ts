import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.invoice.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        document: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: {
        id,
      },
      include: {
        document: true,
      },
    });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.invoice.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}