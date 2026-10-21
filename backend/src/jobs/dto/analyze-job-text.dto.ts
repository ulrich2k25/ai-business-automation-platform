import { IsNotEmpty, IsString, IsUrl, MinLength } from 'class-validator';

export class AnalyzeJobTextDto {
  @IsUrl({ require_protocol: true })
  url: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(100)
  text: string;
}
