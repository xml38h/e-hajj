// services/geminiService.ts
import { PilgrimProfile, Language } from "../types";

function langName(lang: Language) {
  if (lang === Language.AR) return "Arabic";
  if (lang === Language.UR) return "Urdu";
  if (lang === Language.ID) return "Indonesian";
  return "English";
}

function toStringArray(v: any): string[] {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    return [s];
  }
  return [];
}

function fmtLocalDT(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function localFallback(profile: PilgrimProfile): string {
  const chronicArr = toStringArray((profile as any)?.medicalHistory?.chronicDiseases);

  const medsArr = Array.isArray((profile as any)?.medicationHistory) ? (profile as any).medicationHistory : [];
  const meds = medsArr
    .map((m: any) => `${m?.name || ""} ${m?.dosage || ""} (${m?.frequency || ""})`.trim())
    .filter(Boolean);

  const latestSugar = (profile.vitalSigns?.bloodSugarReadings || [])
    .slice()
    .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];

  const latestBP = (profile.vitalSigns?.bloodPressureReadings || [])
    .slice()
    .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];

  const lines: string[] = [];

  if (chronicArr.length) lines.push(`- Chronic: ${chronicArr.join(", ")}`);
  if (meds.length) lines.push(`- Meds: ${meds.join(" | ")}`);

  if (latestBP) {
    const dt = fmtLocalDT(latestBP.measuredAt);
    lines.push(`- Latest BP: ${latestBP.systolic}/${latestBP.diastolic} mmHg${dt ? ` — ${dt}` : ""}`);
  }

  if (latestSugar) {
    const dt = fmtLocalDT(latestSugar.measuredAt);
    lines.push(`- Latest Sugar: ${latestSugar.value} ${latestSugar.unit}${dt ? ` — ${dt}` : ""}`);
  }

  if (!lines.length) return "- No key medical data provided.";

  // 3–5 نقاط (نفس طلبك)
  return lines.slice(0, 5).join("\n");
}

async function callGemini(model: string, apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    (Array.isArray(data?.candidates?.[0]?.content?.parts)
      ? data.candidates[0].content.parts.map((p: any) => p?.text || "").join("")
      : "") ||
    "";

  return String(text).trim();
}

export async function getEmergencyBrief(profile: PilgrimProfile, lang: Language): Promise<string> {
  // ✅ بياناتنا (بدون Unknown عشان لا يخبص الـ AI)
  const chronicArr = toStringArray((profile as any)?.medicalHistory?.chronicDiseases);

  const medsArr = Array.isArray((profile as any)?.medicationHistory) ? (profile as any).medicationHistory : [];
  const medsText = medsArr
    .map((m: any) => `${m?.name || ""} ${m?.dosage || ""} (${m?.frequency || ""})`.trim())
    .filter(Boolean)
    .join(" | ");

  const latestSugar = (profile.vitalSigns?.bloodSugarReadings || [])
    .slice()
    .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];

  const latestBP = (profile.vitalSigns?.bloodPressureReadings || [])
    .slice()
    .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];

  const bpLine = latestBP
    ? `${latestBP.systolic}/${latestBP.diastolic} mmHg${latestBP.measuredAt ? ` — ${fmtLocalDT(latestBP.measuredAt)}` : ""}`
    : "";

  const sugarLine = latestSugar
    ? `${latestSugar.value} ${latestSugar.unit}${latestSugar.measuredAt ? ` — ${fmtLocalDT(latestSugar.measuredAt)}` : ""}`
    : "";

  // ✅ Prompt: فقط الأمراض/الأدوية/القراءات + وقت/تاريخ
  // ولا نرسل أي أرقام تواصل نهائياً
  const prompt = `
You are a medical assistant.
Write a short patient summary for quick viewing.
Language: ${langName(lang)}.

Rules:
- Return ONLY bullet points.
- 3 to 5 bullet points maximum.
- ONLY include: chronic diseases, current medications, latest BP & sugar WITH date/time if available.
- Do NOT include phone numbers or contacts.
- Do NOT invent data.
- If something is missing, omit it (do not write "Unknown").

Data:
Chronic diseases: ${chronicArr.length ? chronicArr.join(", ") : ""}
Medications: ${medsText ? medsText : ""}
Latest BP: ${bpLine}
Latest Sugar: ${sugarLine}
`.trim();

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) return localFallback(profile);

    // ✅ جرّب أكثر من موديل (حسب توفر حسابك)
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
    ];

    let cleaned = "";
    for (const model of modelsToTry) {
      const out = await callGemini(model, apiKey, prompt);
      if (out) {
        cleaned = out;
        break;
      }
    }

    if (!cleaned) return localFallback(profile);

    // ✅ نظّف وتأكد أنه نقاط فقط + قص 5 نقاط
    const normalized = cleaned
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => (line.startsWith("-") ? line : `- ${line}`))
      .slice(0, 5)
      .join("\n");

    // ✅ لو رجع كلام عام بدون بيانات → fallback
    const tooGeneric =
      normalized.length < 30 ||
      /^-?\s*here\s+is/i.test(normalized) ||
      (!normalized.includes("BP") && !normalized.includes("Sugar") && !normalized.includes("Meds") && !normalized.includes("Chronic"));

    return tooGeneric ? localFallback(profile) : normalized;
  } catch {
    return localFallback(profile);
  }
}
