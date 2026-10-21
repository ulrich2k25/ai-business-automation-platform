import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async analyzeDocument(text: string) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
You are a professional AI document analysis engine for a multilingual enterprise SaaS platform.

Your job:
1. Detect the original language of the document.
2. Detect the document type.
3. Summarize the document in the SAME LANGUAGE as the original document.
4. Extract all important structured information.
5. Use field names in English for technical consistency.
6. Use extracted text values and summaries in the document's original language.
7. Return ONLY valid JSON.

Possible document types:
- invoice
- order
- cv
- contract
- email
- report
- certificate
- form
- unknown

Required JSON structure:
{
  "document_language": "fr | en | de | other",
  "document_type": "invoice | order | cv | contract | email | report | certificate | form | unknown",
  "summary": "short professional summary in the document language",
  "confidence": 0.0,
  "key_information": {},
  "entities": {
    "people": [],
    "companies": [],
    "emails": [],
    "phones": [],
    "addresses": [],
    "dates": [],
    "amounts": []
  },
  "business_relevance": "short explanation in the document language",
  "extracted_fields": {}
}
          `,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: 'json_object' },
    });

    return completion.choices[0].message.content;
  }

  private resolveJobSource(sourceUrl: string): string {
    const hostname = new URL(sourceUrl).hostname.toLowerCase().replace(/^www\./, '');

    if (hostname.includes('indeed.')) return 'Indeed';
    if (hostname.includes('stepstone.')) return 'StepStone';
    if (hostname.includes('linkedin.')) return 'LinkedIn';
    if (hostname.includes('xing.')) return 'XING';

    return hostname;
  }

  async analyzeJobPosting(text: string, sourceUrl: string) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
You analyze job advertisements for a job-management application.

Extract only information that is actually present or can be safely inferred from the advertisement.
Do not invent missing information.
Return ONLY valid JSON.

Use these exact values when applicable:

employmentType:
FULL_TIME
PART_TIME
INTERNSHIP
WORKING_STUDENT
APPRENTICESHIP
FREELANCE
TEMPORARY
OTHER

workMode:
ON_SITE
HYBRID
REMOTE

If a field cannot be determined, use null.

salaryMin and salaryMax must contain numbers only.
currency must be a 3-letter code such as EUR.
deadline must use YYYY-MM-DD when clearly available.

Required JSON:
{
  "companyName": null,
  "companyWebsite": null,
  "industry": null,
  "companyCity": null,
  "companyCountry": null,
  "contactName": null,
  "contactEmail": null,
  "contactPhone": null,
  "jobTitle": null,
  "jobUrl": null,
  "location": null,
  "employmentType": null,
  "workMode": null,
  "source": null,
  "salaryMin": null,
  "salaryMax": null,
  "currency": null,
  "deadline": null,
  "summary": null,
  "tasks": [],
  "requirements": [],
  "technologies": []
}
          `,
        },
        {
          role: 'user',
          content: `Source URL: ${sourceUrl}\n\nJob advertisement:\n${text}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('OpenAI returned an empty job analysis.');
    }

    const result = JSON.parse(content) as Record<string, unknown>;
    result.jobUrl = sourceUrl;
    result.source = this.resolveJobSource(sourceUrl);

    return result;
  }
}
