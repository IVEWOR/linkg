// app/api/quiz/route.js
export const dynamic = "force-dynamic";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const FALLBACK_PAIRS = [
  ["Vim", "VS Code"],
  ["React", "Vue"],
  ["Next.js", "Remix"],
  ["Tailwind", "CSS Modules"],
  ["Notion", "Obsidian"],
  ["Discord", "Slack"],
  ["PostgreSQL", "MySQL"],
  ["Mac", "Windows"],
];

export async function POST(req) {
  try {
    const { history = [] } = await req.json(); // [{q, a}]
    // Stop after 6 questions
    if (history.length >= 6) {
      return Response.json({ done: true, mandatory: true });
    }

    // If no OpenAI key, or we want resilience, return a non-repeating pair
    const used = new Set(history.map((h) => h.q));
    const pickFallback = () => {
      const pool = FALLBACK_PAIRS.filter(([a, b]) => !used.has(`${a} vs ${b}`));
      const [A, B] =
        pool[Math.floor(Math.random() * pool.length)] ?? FALLBACK_PAIRS[0];
      return {
        question: `${A} vs ${B}`,
        options: [A, B],
        mandatory: history.length >= 5,
        done: false,
      };
    };

    if (!OPENAI_API_KEY) return Response.json(pickFallback());

    // Build a tight prompt for A/B that stays relevant and punchy
    const sys = `You write short, playful A/B questions about tools/workflows developers love.
Return JSON: {"question": "...", "options": ["A","B"]}.
Rules: 
- 2-4 words per option, no punctuation beyond "vs".
- Stay relevant to previous choices.
- Be neutral & fun.`;

    const user = `Previous answers: ${
      history.map((h) => `${h.q} -> ${h.a}`).join(" | ") || "None"
    }.
Produce ONE new A/B question only.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      // graceful fallback
      return Response.json(pickFallback());
    }

    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content || "{}");
    const out = {
      question: parsed.question || pickFallback().question,
      options:
        Array.isArray(parsed.options) && parsed.options.length === 2
          ? parsed.options
          : pickFallback().options,
      mandatory: history.length >= 5,
      done: false,
    };
    return Response.json(out);
  } catch (e) {
    return Response.json(
      { ...e, ...{ error: "quiz_api_error" } },
      { status: 200 } // keep UX flowing with fallback on client if needed
    );
  }
}
