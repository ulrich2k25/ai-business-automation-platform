import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as cheerio from 'cheerio';
import { AiService } from '../ai/ai.service';
import { ImportJobToApplyFlowDto } from './dto/import-job-to-applyflow.dto';

@Injectable()
export class JobsService {
  constructor(private readonly aiService: AiService) {}

  async analyzeUrl(url: string) {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL.');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new BadRequestException('Only HTTP and HTTPS URLs are supported.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/142 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        },
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `The job page returned HTTP ${response.status}.`,
        );
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      $('script, style, noscript, svg, iframe').remove();

      const text = $('body')
        .text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 60000);

      if (text.length < 150) {
        throw new BadRequestException(
          'Not enough readable job content could be extracted from this URL.',
        );
      }

      return this.aiService.analyzeJobPosting(text, url);
    } finally {
      clearTimeout(timeout);
    }
  }

  async analyzeText(url: string, text: string) {
    const cleanedText = text
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 60000);

    if (cleanedText.length < 100) {
      throw new BadRequestException(
        'The pasted job posting text is too short to analyze.',
      );
    }

    return this.aiService.analyzeJobPosting(cleanedText, url);
  }

  async importToApplyFlow(dto: ImportJobToApplyFlowDto) {
    const apiUrl =
      process.env.APPLYFLOW_API_URL ?? 'http://localhost:3001/api/v1';

    const apiKey = process.env.APPLYFLOW_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'APPLYFLOW_API_KEY is not configured.',
      );
    }

    const description = [
      dto.summary,
      dto.tasks?.length
        ? `Aufgaben:\n${dto.tasks.map((item) => `- ${item}`).join('\n')}`
        : undefined,
      dto.requirements?.length
        ? `Anforderungen:\n${dto.requirements.map((item) => `- ${item}`).join('\n')}`
        : undefined,
      dto.technologies?.length
        ? `Technologien:\n${dto.technologies.join(', ')}`
        : undefined,
    ]
      .filter(Boolean)
      .join('\n\n');

    const payload = {
      companyName: dto.companyName,
      companyWebsite: dto.companyWebsite,
      industry: dto.industry,
      companyCity: dto.companyCity,
      companyCountry: dto.companyCountry,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      jobTitle: dto.jobTitle,
      jobUrl: dto.jobUrl,
      description: description || undefined,
      location: dto.location,
      employmentType: dto.employmentType,
      workMode: dto.workMode,
      source: dto.source ?? 'AI_AUTOMATION',
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      currency: dto.currency,
      deadline: dto.deadline,
    };

    const response = await fetch(
      `${apiUrl.replace(/\/$/, '')}/integrations/applications/import`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      },
    );

    const body = await response.text();

    if (!response.ok) {
      throw new BadGatewayException(
        `ApplyFlow import failed (${response.status}): ${body}`,
      );
    }

    return JSON.parse(body);
  }
}
