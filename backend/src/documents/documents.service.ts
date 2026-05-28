import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFParse } from 'pdf-parse';
import { AiService } from '../ai/ai.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  createTestDocument() {
    return this.prisma.document.create({
      data: {
        fileName: 'test-commande.pdf',
        originalText: 'Commande PDF test',
        extractedData: {
          client: 'Entreprise Demo',
          total: 2500,
          currency: 'EUR',
        },
        status: 'UPLOADED',
      },
    });
  }

  async uploadPdf(file: Express.Multer.File) {
    const parser = new PDFParse({
      data: file.buffer,
    });

    const pdfData = await parser.getText();

    await parser.destroy();

    const existingDocument = await this.prisma.document.findFirst({
      where: {
        fileName: file.originalname,
        originalText: pdfData.text,
      },
    });

    if (existingDocument) {
      return existingDocument;
    }

    const aiResult = await this.aiService.analyzeDocument(pdfData.text);
    const parsedResult = JSON.parse(aiResult || '{}');

    const document = await this.prisma.document.create({
      data: {
        fileName: file.originalname,
        originalText: pdfData.text,
        extractedData: parsedResult,
        status: 'AI_PROCESSED',
      },
    });

    if (parsedResult.document_type?.toLowerCase() === 'invoice') {
      const fields = parsedResult.extracted_fields || {};
      const keyInfo = parsedResult.key_information || {};

      const cleanAmount = (value: any) => {
        if (!value) return null;

        const cleaned = String(value)
          .replace('€', '')
          .replace('EUR', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .trim();

        const number = Number(cleaned);
        return isNaN(number) ? null : number;
      };

      const parseDate = (value: any) => {
        if (!value) return null;

        const text = String(value);

        if (text.includes('.')) {
          const [day, month, year] = text.split('.');
          return new Date(`${year}-${month}-${day}`);
        }

        return new Date(text);
      };

      await this.prisma.invoice.create({
        data: {
          invoiceNumber:
            fields.invoice_number ||
            fields.invoiceNumber ||
            fields.InvoiceNumber ||
            keyInfo.invoice_number ||
            null,

          supplier:
            fields.supplier_name ||
            fields.supplier ||
            fields.SellerCompany ||
            keyInfo.seller?.company_name ||
            keyInfo.supplier_name ||
            null,

          amount: cleanAmount(
            fields.amount ||
              fields.total ||
              fields.TotalAmount ||
              keyInfo.total ||
              keyInfo.total_amount,
          ),

          currency:
            fields.currency ||
            fields.Currency ||
            keyInfo.currency ||
            null,

          vatAmount: cleanAmount(
            fields.vat ||
              fields.vat_amount ||
              fields.vatAmount ||
              fields.Tax ||
              keyInfo.vat ||
              keyInfo.tax,
          ),

          invoiceDate: parseDate(
            fields.invoice_date ||
              fields.invoiceDate ||
              fields.InvoiceDate ||
              keyInfo.invoice_date,
          ),

          status:
            fields.status ||
            fields.Status ||
            keyInfo.status ||
            'PENDING',

          documentId: document.id,
        },
      });
    }

    return document;
  }

  findAll() {
    return this.prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}