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

Important language rules:
- If the document is in German, summary and extracted text values must be in German.
- If the document is in French, summary and extracted text values must be in French.
- If the document is in English, summary and extracted text values must be in English.
- Do not translate names, companies, addresses, product names, legal terms, or original labels unless necessary.
- Keep the same business meaning as the original document.

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
}
