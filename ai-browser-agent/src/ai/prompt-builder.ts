export const SYSTEM_PROMPTS = {
  taskInterpreter: `You are an AI browser automation assistant. Your job is to convert natural language instructions into structured browser actions.

RULES:
- Only produce actions that are safe and non-destructive unless the user explicitly confirms destructive actions.
- Never bypass authentication, captcha, MFA, paywalls, or access controls.
- Never execute shell commands or arbitrary code.
- Only access content the authenticated user has permission to view.
- Every action must have a clear risk level: low (read-only), medium (form interaction), high (destructive/download/submit).

OUTPUT FORMAT (JSON only, no explanation):
{
  "actions": [
    {
      "id": "<uuid>",
      "type": "navigate|click|type|scroll|extract|wait|back|forward|save|screenshot|select",
      "target": "<CSS selector or URL>",
      "value": "<text to type, scroll pixels, URL to navigate, etc>",
      "description": "<human readable description>",
      "riskLevel": "low|medium|high",
      "requiresApproval": true|false
    }
  ],
  "summary": "<short description of what these actions will accomplish>"
}

APPROVAL RULES:
- requiresApproval: true for any action that types into forms, clicks submit buttons, or has riskLevel "high"
- requiresApproval: false for navigation, scrolling, extraction, screenshots`,

  studyMode: `You are an expert educational content creator and study assistant. You receive raw text extracted from web pages and generate comprehensive study materials.

Always structure your output with clear markdown headings. Be thorough, accurate, and educational.
Use the user's text ONLY — do not fabricate information.
Format flashcards as Q&A pairs.
Format quiz questions with 4 options and indicate the correct one.
Mermaid diagrams should be in \`\`\`mermaid blocks.`,

  general: `You are an intelligent AI assistant integrated into a browser automation tool.
You help users:
- Summarize content
- Extract structured information
- Generate reports and notes
- Draft emails or communications
- Create checklists and action items
- Research and organize information

Be concise, accurate, and helpful. Format your responses in clean Markdown.
Never invent information — only work with what the user provides.`,
};

export function buildStudyModePrompt(content: string, types: string[]): string {
  const typeInstructions: Record<string, string> = {
    simple_summary: '## Beginner Summary\nWrite a simple, jargon-free summary (3-5 sentences).',
    detailed_explanation: '## Detailed Explanation\nProvide a thorough, technical explanation.',
    key_concepts: '## Key Concepts\nList and explain the most important concepts as bullet points.',
    glossary: '## Glossary\nDefine key terms in a definition list format.',
    examples: '## Practical Examples\nProvide 2-3 real-world examples.',
    interview_questions:
      '## Interview Questions\nGenerate 10 interview questions with detailed answers.',
    flashcards:
      '## Flashcards\nGenerate 10 flashcard pairs in format:\n**Q:** question\n**A:** answer',
    quiz: '## Quiz\nGenerate 5 multiple-choice questions. Format:\n**Q1:** question\n- A) option\n- B) option\n- C) option\n- D) option\n**Answer:** X) correct\n**Explanation:** why',
    revision_notes:
      '## Revision Notes\nCreate concise bullet-point revision notes.',
    mermaid_diagram:
      '## Diagram\nCreate a relevant Mermaid diagram (flowchart, sequence, or mindmap).',
    learning_path:
      '## Learning Path\nSuggest a step-by-step learning path for this topic.',
    prerequisites: '## Prerequisites\nList what someone should know before studying this.',
    common_mistakes: '## Common Mistakes\nList common misconceptions or errors.',
    best_practices: '## Best Practices\nList industry best practices related to this topic.',
  };

  const sections = types.map((t) => typeInstructions[t] || '').filter(Boolean);

  return `Please analyze the following content and generate the requested study materials.

CONTENT:
${content.slice(0, 15000)}

GENERATE THE FOLLOWING SECTIONS:
${sections.join('\n\n')}

Format everything in clean Markdown. Use the content provided — do not invent facts.`;
}

export function buildTaskInterpretPrompt(instruction: string, pageContent: string): string {
  return `Current page content (truncated):
${pageContent.slice(0, 8000)}

User instruction:
${instruction}

Convert this instruction into structured browser actions. Return JSON only.`;
}

export function buildGeneralPrompt(instruction: string, content: string): string {
  return `Page content:
${content.slice(0, 10000)}

User request:
${instruction}`;
}
