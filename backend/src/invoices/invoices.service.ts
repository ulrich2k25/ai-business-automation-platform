import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: { companyId: string }) {
    return this.prisma.invoice.findMany({
      where: {
        document: {
          companyId: user.companyId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        document: true,
      },
    });
  }

  async findOne(id: string, user: { companyId: string }) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id,
      },
      include: {
        document: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.document?.companyId !== user.companyId) {
      throw new ForbiddenException();
    }

    return invoice;
  }

  async updateStatus(id: string, status: string, user: { companyId: string }) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id,
      },
      include: {
        document: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.document?.companyId !== user.companyId) {
      throw new ForbiddenException();
    }

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
