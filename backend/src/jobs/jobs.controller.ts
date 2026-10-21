import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { AnalyzeJobUrlDto } from './dto/analyze-job-url.dto';
import { AnalyzeJobTextDto } from './dto/analyze-job-text.dto';
import { ImportJobToApplyFlowDto } from './dto/import-job-to-applyflow.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(JwtGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('analyze-url')
  analyzeUrl(@Body() dto: AnalyzeJobUrlDto) {
    return this.jobsService.analyzeUrl(dto.url);
  }

  @Post('analyze-text')
  analyzeText(@Body() dto: AnalyzeJobTextDto) {
    return this.jobsService.analyzeText(dto.url, dto.text);
  }

  @Post('import-to-applyflow')
  importToApplyFlow(@Body() dto: ImportJobToApplyFlowDto) {
    return this.jobsService.importToApplyFlow(dto);
  }
}
