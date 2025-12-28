export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { context, optionA, optionB, constraints } = req.body || {};

    if (!context || !optionA || !optionB) {
      return res.status(400).json({
        error: "Missing required fields: context, optionA, optionB",
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    }

    const prompt = `
You are DecisionLens, an AI Decision Explainer.

Goal: help the user make a decision by providing a structured explanation, not generic advice.

Rules:
- Do NOT invent facts. If information is missing, list it under "missing_info".
- Be specific and practical. No fluff.
- Consider tradeoffs: cost, time, risk, long-term growth.
- Provide a confidence score (0-100) and justify it briefly.
- Output MUST be valid JSON matching the schema.

JSON Schema:
{
  "recommendation": {"choice": "A|B|Depends", "summary": "string"},
  "reasoning_steps": ["string"],
  "pros": {"A": ["string"], "B": ["string"]},
  "cons": {"A": ["string"], "B": ["string"]},
  "risks": ["string"],
  "missing_info": ["string"],
  "next_actions_7_days": ["string"],
  "confidence": {"score": 0, "why": "string"}
}

User input:
<context>
${context}
</context>
<option_a>
${optionA}
</option_a>
<option_b>
${optionB}
</option_b>
<constraints>
${constraints || "N/A"}
</constraints>
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        text: { format: { type: "json_object" } },
      }),
    });

    const data = await response.json();

    const text =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "";

    if (!text || typeof text !== "string") {
      return res.status(500).json({
        error: "Empty model output",
        details: JSON.stringify(data)?.slice(0, 500),
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Model did not return valid JSON",
        details: text.slice(0, 800),
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({
      error: "Failed to generate explanation",
      details: String(err),
    });
  }
}
