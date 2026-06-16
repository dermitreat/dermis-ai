import { useState, useRef } from "react";

const buildPrompt = (country) => `You are an expert dermatologist and licensed esthetician with 20+ years of experience. A beauty professional has uploaded a client's skin photo. The client is located in: ${country}.

Analyze the skin and provide a COMPREHENSIVE professional consultation. Be specific, practical, and include REAL brand names available in ${country} and internationally.

Respond ONLY in this exact JSON format (no markdown, no backticks, no extra text):
{
  "conditions_detected": ["list of skin conditions visible"],
  "skin_type": "oily/dry/combination/sensitive/normal",
  "severity": "mild/moderate/severe",
  "skin_concerns": ["specific concerns"],
  "therapies": [
    { "name": "therapy name", "description": "why and how it helps", "frequency": "how often" }
  ],
  "facials": [
    { "name": "facial type", "description": "what it does for this skin", "best_for": "condition it targets" }
  ],
  "professional_facial_procedures": [
    {
      "facial_name": "e.g. Chemical Peel / Enzyme Facial / Deep Cleansing Facial",
      "suitable_for": "which skin condition this targets",
      "total_sessions": "e.g. 6 sessions",
      "interval_between_sessions": "e.g. every 2 weeks",
      "contraindications": ["list of when NOT to perform this facial — e.g. active pustules, pregnancy, isotretinoin use, sunburn"],
      "what_to_avoid_during_procedure": ["things to never do during this facial for this skin type"],
      "steps": [
        {
          "step_number": 1,
          "step_name": "e.g. Skin Analysis & Consultation",
          "description": "detailed what to do",
          "products_to_use": "specific product type or ingredient",
          "duration": "e.g. 5 minutes"
        }
      ],
      "chemical_peel_details": {
        "applicable": true,
        "peel_type": "e.g. Glycolic Acid / Salicylic Acid / TCA / Lactic Acid",
        "session_1_percentage": "e.g. 20% Glycolic Acid",
        "session_2_percentage": "e.g. 30% Glycolic Acid",
        "session_3_percentage": "e.g. 40% Glycolic Acid",
        "application_time": "e.g. 2-3 minutes for first session",
        "neutralizer": "what to use to neutralize",
        "warning_signs": "what to watch for during application"
      },
      "enzyme_details": {
        "applicable": true,
        "enzyme_type": "e.g. Papain (papaya) / Bromelain (pineapple) / Pumpkin enzyme",
        "why_this_enzyme": "why this enzyme suits the condition",
        "application_time": "e.g. 10-15 minutes",
        "number_of_sessions": "e.g. 4-6 sessions"
      },
      "steaming_details": {
        "applicable": true,
        "recommended": true,
        "distance_from_face": "e.g. 30-35cm / 12 inches",
        "duration": "e.g. 5-8 minutes",
        "temperature": "e.g. warm steam, not hot",
        "when_in_routine": "e.g. after cleanse, before extractions",
        "notes": "any cautions for this skin type"
      },
      "aftercare": {
        "immediate_24hrs": ["what to do/avoid in first 24 hours"],
        "week_1": ["care instructions for first week"],
        "products_to_apply": ["specific soothing/healing products to use after"],
        "products_to_avoid": ["what NOT to use after this procedure"],
        "sun_protection": "SPF guidance after procedure",
        "follow_up": "when to book next appointment"
      }
    }
  ],
  "local_brands": [
    { "brand": "real brand name available in ${country}", "product": "specific product name", "purpose": "what it treats", "how_to_use": "step by step application instructions", "price_range": "affordable/mid-range/premium" }
  ],
  "international_brands": [
    { "brand": "international brand name", "product": "specific product name", "purpose": "what it treats", "how_to_use": "step by step application instructions", "availability": "where to buy in ${country} or online" }
  ],
  "daily_routine": {
    "morning": ["step 1: product type and how to apply", "step 2...", "step 3..."],
    "evening": ["step 1: product type and how to apply", "step 2...", "step 3..."],
    "weekly": ["weekly treatment step 1", "weekly treatment step 2"]
  },
  "key_ingredients": [
    { "ingredient": "ingredient name", "benefit": "what it does for this skin condition" }
  ],
  "ingredients_to_avoid": [
    { "ingredient": "ingredient name", "reason": "why to avoid for this skin" }
  ],
  "diet_plan": {
    "foods_to_eat": [{ "food": "food name", "benefit": "how it helps" }],
    "foods_to_avoid": [{ "food": "food name", "reason": "why it worsens" }],
    "nutrients_needed": [{ "nutrient": "nutrient name", "sources": "food sources", "benefit": "skin benefit" }],
    "daily_water_intake": "recommended daily water intake",
    "supplements": [{ "supplement": "supplement name", "benefit": "skin benefit", "dosage": "recommended amount" }]
  },
  "client_consultation_script": "Professional script spoken directly to the client.",
  "treatment_plan": {
    "week_1_2": "what to focus on first",
    "week_3_4": "next phase",
    "month_2_3": "long term care"
  },
  "recommended_courses": [
    { "course_topic": "topic", "reason": "why this helps treat this condition" }
  ],
  "lifestyle_advice": ["habits, sleep, stress tips"],
  "professional_notes": "Private therapist notes — contraindications, referral suggestions, red flags"
}`;

export default function SkinAnalysisApp() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [country, setCountry] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("conditions");
  const [activeProcedure, setActiveProcedure] = useState(0);
  const fileRef = useRef();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
      setImageBase64(ev.target.result.split(",")[1]);
      setAnalysis(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imageBase64 || !country.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: buildPrompt(country) },
                { inline_data: { mime_type: "image/jpeg", data: imageBase64 } },
              ],
            }],
          }),
        }
      );
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAnalysis(parsed);
      setActiveTab("conditions");
      setActiveProcedure(0);
    } catch (err) {
      setError("Analysis failed. Please try a clearer photo.");
    }
    setLoading(false);
  };

  const tabs = [
    { id: "conditions", label: "Skin Status", icon: "🔍" },
    { id: "therapies", label: "Therapies", icon: "💆" },
    { id: "procedures", label: "Facial Procedures", icon: "🧴" },
    { id: "local_brands", label: "Local Products", icon: "🏪" },
    { id: "international_brands", label: "Int'l Brands", icon: "🌍" },
    { id: "routine", label: "Daily Routine", icon: "⏰" },
    { id: "ingredients", label: "Ingredients", icon: "🌿" },
    { id: "diet", label: "Diet Plan", icon: "🥗" },
    { id: "consultation", label: "Client Script", icon: "💬" },
    { id: "plan", label: "Treatment Plan", icon: "📋" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "notes", label: "Pro Notes", icon: "🔒" },
  ];

  const severityColor = { mild: "#4ade80", moderate: "#fbbf24", severe: "#f87171" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0a0a 0%, #1a0f12 50%, #0f0a0a 100%)", fontFamily: "'Georgia', serif", color: "#f0e6d3" }}>
      <div style={{ borderBottom: "1px solid #3d1f2a", padding: "20px 24px", display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #c9956a, #8b5e3c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: "bold", letterSpacing: "0.05em", color: "#e8c9a0" }}>DERMIS AI</div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#8a6a55", textTransform: "uppercase" }}>Professional Skin Analysis System</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10, color: "#5a3f35", textAlign: "right" }}>Spa Owners & Skin Therapists</div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px" }}>

        {!analysis && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, letterSpacing: "0.25em", color: "#8a6a55", textTransform: "uppercase", marginBottom: 16 }}>Step 1 — Upload Client Photo</div>
            <div onClick={() => fileRef.current.click()} style={{ border: "1px dashed #5a3f35", borderRadius: 16, padding: "40px 24px", cursor: "pointer", background: image ? "transparent" : "rgba(201,149,106,0.03)", maxWidth: 440, margin: "0 auto 24px" }}>
              {image
                ? <img src={image} alt="Uploaded" style={{ maxHeight: 260, borderRadius: 10, maxWidth: "100%" }} />
                : <><div style={{ fontSize: 44, marginBottom: 12 }}>📷</div><div style={{ color: "#8a6a55", fontSize: 13 }}>Tap to upload a skin photo</div><div style={{ color: "#5a3f35", fontSize: 11, marginTop: 6 }}>Face, neck, or body — any area</div></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            {image && (
              <>
                <div style={{ fontSize: 12, letterSpacing: "0.25em", color: "#8a6a55", textTransform: "uppercase", marginBottom: 10 }}>Step 2 — Enter Client's Country</div>
                <input type="text" placeholder="e.g. Nigeria, South Africa, Ghana, UK..." value={country} onChange={(e) => setCountry(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #5a3f35", borderRadius: 10, padding: "12px 20px", color: "#e8c9a0", fontSize: 14, fontFamily: "Georgia, serif", width: "100%", maxWidth: 380, outline: "none", textAlign: "center", marginBottom: 20 }} />
              </>
            )}
            {image && country.trim() && !loading && (
              <button onClick={analyzeImage} style={{ padding: "13px 44px", background: "linear-gradient(135deg, #c9956a, #8b5e3c)", border: "none", borderRadius: 40, color: "#fff", fontSize: 13, fontFamily: "Georgia, serif", letterSpacing: "0.1em", cursor: "pointer", fontWeight: "bold" }}>
                ANALYSE SKIN ✦
              </button>
            )}
            {loading && (
              <div style={{ marginTop: 28 }}>
                <div style={{ fontSize: 30, animation: "spin 2s linear infinite", display: "inline-block" }}>✦</div>
                <div style={{ color: "#8a6a55", marginTop: 10, fontSize: 12, letterSpacing: "0.1em" }}>Analysing skin & building full protocol...</div>
              </div>
            )}
            {error && <div style={{ marginTop: 16, color: "#f87171", fontSize: 13 }}>{error}</div>}
          </div>
        )}

        {analysis && (
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid #3d1f2a", alignItems: "center" }}>
              {image && <img src={image} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, color: "#e8c9a0", fontWeight: "bold", marginBottom: 6 }}>{analysis.skin_type?.toUpperCase()} SKIN · {country.toUpperCase()}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {analysis.conditions_detected?.map((c, i) => <span key={i} style={{ background: "rgba(201,149,106,0.15)", border: "1px solid #8b5e3c", borderRadius: 20, padding: "2px 10px", fontSize: 10, color: "#c9956a" }}>{c}</span>)}
                  {analysis.severity && <span style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${severityColor[analysis.severity] || "#888"}`, borderRadius: 20, padding: "2px 10px", fontSize: 10, color: severityColor[analysis.severity] || "#888" }}>{analysis.severity?.toUpperCase()}</span>}
                </div>
              </div>
              <button onClick={() => { setAnalysis(null); setImage(null); setImageBase64(null); setCountry(""); }} style={{ background: "transparent", border: "1px solid #5a3f35", borderRadius: 8, color: "#8a6a55", padding: "7px 14px", cursor: "pointer", fontSize: 11, fontFamily: "Georgia, serif" }}>New ✦</button>
            </div>

            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 20 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "7px 12px", borderRadius: 20, fontSize: 10, fontFamily: "Georgia, serif", cursor: "pointer", border: activeTab === t.id ? "1px solid #c9956a" : "1px solid #3d1f2a", background: activeTab === t.id ? "rgba(201,149,106,0.2)" : "transparent", color: activeTab === t.id ? "#e8c9a0" : "#8a6a55", transition: "all 0.2s" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #3d1f2a", borderRadius: 14, padding: 20 }}>

              {activeTab === "conditions" && (
                <div>
                  <SectionTitle>Skin Assessment</SectionTitle>
                  <Grid><Card title="Skin Type" value={analysis.skin_type} /><Card title="Severity" value={analysis.severity} highlight={severityColor[analysis.severity]} /></Grid>
                  <SubTitle>Skin Concerns</SubTitle><TagList items={analysis.skin_concerns} />
                  <SubTitle>Lifestyle Advice</SubTitle><BulletList items={analysis.lifestyle_advice} />
                </div>
              )}

              {activeTab === "therapies" && (
                <div>
                  <SectionTitle>Recommended Therapies</SectionTitle>
                  {analysis.therapies?.map((t, i) => <DetailCard key={i} title={t.name} badge={t.frequency}>{t.description}</DetailCard>)}
                </div>
              )}

              {activeTab === "procedures" && (
                <div>
                  <SectionTitle>🧴 Professional Facial Procedures</SectionTitle>
                  {analysis.professional_facial_procedures?.length > 1 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                      {analysis.professional_facial_procedures.map((p, i) => (
                        <button key={i} onClick={() => setActiveProcedure(i)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 10, fontFamily: "Georgia, serif", cursor: "pointer", border: activeProcedure === i ? "1px solid #c9956a" : "1px solid #3d1f2a", background: activeProcedure === i ? "rgba(201,149,106,0.2)" : "transparent", color: activeProcedure === i ? "#e8c9a0" : "#8a6a55" }}>
                          {p.facial_name}
                        </button>
                      ))}
                    </div>
                  )}
                  {analysis.professional_facial_procedures?.length > 0 && (() => {
                    const proc = analysis.professional_facial_procedures[activeProcedure];
                    if (!proc) return null;
                    return (
                      <div>
                        <div style={{ background: "rgba(201,149,106,0.06)", border: "1px solid #5a3f35", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                          <div style={{ fontSize: 16, color: "#e8c9a0", fontWeight: "bold", marginBottom: 8 }}>{proc.facial_name}</div>
                          <div style={{ fontSize: 12, color: "#a08070", marginBottom: 10 }}>Suitable for: <span style={{ color: "#c9956a" }}>{proc.suitable_for}</span></div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <InfoPill label="Total Sessions" value={proc.total_sessions} />
                            <InfoPill label="Interval" value={proc.interval_between_sessions} />
                          </div>
                        </div>
                        {proc.contraindications?.length > 0 && (
                          <>
                            <SubTitle>⛔ Contraindications — When NOT to Perform</SubTitle>
                            <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid #5a2020", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                              {proc.contraindications.map((c, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
                                  <span style={{ color: "#f87171", fontSize: 11 }}>✕</span>
                                  <span style={{ fontSize: 12, color: "#d4a0a0", lineHeight: 1.6 }}>{c}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {proc.what_to_avoid_during_procedure?.length > 0 && (
                          <>
                            <SubTitle>🚫 What to Avoid During Procedure</SubTitle>
                            <div style={{ background: "rgba(251,191,36,0.05)", border: "1px solid #5a4a20", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                              {proc.what_to_avoid_during_procedure.map((c, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                                  <span style={{ color: "#fbbf24", fontSize: 11 }}>⚠</span>
                                  <span style={{ fontSize: 12, color: "#d4c090", lineHeight: 1.6 }}>{c}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {proc.steaming_details?.applicable && (
                          <>
                            <SubTitle>💨 Steaming Protocol</SubTitle>
                            <div style={{ background: "rgba(99,179,237,0.06)", border: "1px solid #2a4a6a", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                                <InfoPill label="Distance from Face" value={proc.steaming_details.distance_from_face} blue />
                                <InfoPill label="Duration" value={proc.steaming_details.duration} blue />
                                <InfoPill label="Temperature" value={proc.steaming_details.temperature} blue />
                                <InfoPill label="When in Routine" value={proc.steaming_details.when_in_routine} blue />
                              </div>
                              {proc.steaming_details.notes && <div style={{ fontSize: 12, color: "#90cdf4", marginTop: 8, fontStyle: "italic" }}>Note: {proc.steaming_details.notes}</div>}
                            </div>
                          </>
                        )}
                        {proc.chemical_peel_details?.applicable && (
                          <>
                            <SubTitle>⚗️ Chemical Peel Protocol</SubTitle>
                            <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid #4a3a6a", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                              <div style={{ fontSize: 13, color: "#c4b5fd", fontWeight: "bold", marginBottom: 10 }}>{proc.chemical_peel_details.peel_type}</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                                <PeelSessionCard session="Session 1" value={proc.chemical_peel_details.session_1_percentage} />
                                <PeelSessionCard session="Session 2" value={proc.chemical_peel_details.session_2_percentage} />
                                <PeelSessionCard session="Session 3" value={proc.chemical_peel_details.session_3_percentage} />
                              </div>
                              <div style={{ fontSize: 12, color: "#a09080", lineHeight: 1.7 }}>
                                <div>⏱ Application time: <span style={{ color: "#c4b5fd" }}>{proc.chemical_peel_details.application_time}</span></div>
                                <div>🧪 Neutralizer: <span style={{ color: "#c4b5fd" }}>{proc.chemical_peel_details.neutralizer}</span></div>
                                <div style={{ marginTop: 8, background: "rgba(248,113,113,0.08)", borderRadius: 8, padding: "8px 12px", color: "#f87171" }}>⚠ Watch for: {proc.chemical_peel_details.warning_signs}</div>
                              </div>
                            </div>
                          </>
                        )}
                        {proc.enzyme_details?.applicable && (
                          <>
                            <SubTitle>🌿 Enzyme Treatment Details</SubTitle>
                            <div style={{ background: "rgba(74,222,128,0.05)", border: "1px solid #1a4a2a", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                              <div style={{ fontSize: 13, color: "#4ade80", fontWeight: "bold", marginBottom: 8 }}>{proc.enzyme_details.enzyme_type}</div>
                              <div style={{ fontSize: 12, color: "#a0c0a0", lineHeight: 1.7 }}>
                                <div>Why this enzyme: {proc.enzyme_details.why_this_enzyme}</div>
                                <div>⏱ Application time: <span style={{ color: "#4ade80" }}>{proc.enzyme_details.application_time}</span></div>
                                <div>🔢 Sessions: <span style={{ color: "#4ade80" }}>{proc.enzyme_details.number_of_sessions}</span></div>
                              </div>
                            </div>
                          </>
                        )}
                        <SubTitle>📋 Step-by-Step Procedure</SubTitle>
                        {proc.steps?.map((step, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                            <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #c9956a, #8b5e3c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: "bold" }}>{step.step_number}</div>
                            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid #3d1f2a", borderRadius: 10, padding: "12px 14px" }}>
                              <div style={{ fontSize: 13, color: "#e8c9a0", fontWeight: "bold", marginBottom: 4 }}>{step.step_name}</div>
                              <div style={{ fontSize: 12, color: "#a08070", lineHeight: 1.7, marginBottom: 6 }}>{step.description}</div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {step.products_to_use && <span style={{ fontSize: 10, background: "rgba(201,149,106,0.1)", border: "1px solid #5a3f35", borderRadius: 10, padding: "2px 10px", color: "#c9956a" }}>🧴 {step.products_to_use}</span>}
                                {step.duration && <span style={{ fontSize: 10, background: "rgba(255,255,255,0.04)", border: "1px solid #3d1f2a", borderRadius: 10, padding: "2px 10px", color: "#8a6a55" }}>⏱ {step.duration}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                        {proc.aftercare && (
                          <>
                            <SubTitle>🛡️ Aftercare Protocol</SubTitle>
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #3d1f2a", borderRadius: 10, padding: 16 }}>
                              {proc.aftercare.immediate_24hrs?.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                  <div style={{ fontSize: 10, color: "#8a6a55", letterSpacing: "0.1em", marginBottom: 6 }}>FIRST 24 HOURS</div>
                                  {proc.aftercare.immediate_24hrs.map((a, i) => <div key={i} style={{ fontSize: 12, color: "#a08070", lineHeight: 1.7, paddingLeft: 8, borderLeft: "2px solid #5a3f35", marginBottom: 4 }}>{a}</div>)}
                                </div>
                              )}
                              {proc.aftercare.week_1?.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                  <div style={{ fontSize: 10, color: "#8a6a55", letterSpacing: "0.1em", marginBottom: 6 }}>WEEK 1 CARE</div>
                                  {proc.aftercare.week_1.map((a, i) => <div key={i} style={{ fontSize: 12, color: "#a08070", lineHeight: 1.7, paddingLeft: 8, borderLeft: "2px solid #5a3f35", marginBottom: 4 }}>{a}</div>)}
                                </div>
                              )}
                              {proc.aftercare.products_to_apply?.length > 0 && (
                                <div style={{ marginBottom: 10 }}>
                                  <div style={{ fontSize: 10, color: "#4ade80", letterSpacing: "0.1em", marginBottom: 6 }}>✅ APPLY AFTER</div>
                                  <TagList items={proc.aftercare.products_to_apply} green />
                                </div>
                              )}
                              {proc.aftercare.products_to_avoid?.length > 0 && (
                                <div style={{ marginBottom: 10 }}>
                                  <div style={{ fontSize: 10, color: "#f87171", letterSpacing: "0.1em", marginBottom: 6 }}>❌ AVOID AFTER</div>
                                  <TagList items={proc.aftercare.products_to_avoid} red />
                                </div>
                              )}
                              {proc.aftercare.sun_protection && (
                                <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid #5a4a20", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#fbbf24" }}>
                                  ☀️ SPF: {proc.aftercare.sun_protection}
                                </div>
                              )}
                              {proc.aftercare.follow_up && (
                                <div style={{ fontSize: 12, color: "#8a6a55", fontStyle: "italic" }}>📅 Follow-up: {proc.aftercare.follow_up}</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === "local_brands" && (
                <div>
                  <SectionTitle>🏪 Local Products in {country}</SectionTitle>
                  {analysis.local_brands?.map((p, i) => (
                    <DetailCard key={i} title={p.brand} badge={p.price_range}>
                      <div style={{ marginBottom: 6, color: "#c9956a", fontSize: 12 }}>📦 {p.product}</div>
                      <div style={{ marginBottom: 8 }}>{p.purpose}</div>
                      <div style={{ background: "rgba(201,149,106,0.06)", borderRadius: 8, padding: "10px 12px", borderLeft: "2px solid #8b5e3c" }}>
                        <div style={{ fontSize: 10, color: "#8a6a55", letterSpacing: "0.1em", marginBottom: 4 }}>HOW TO USE</div>
                        <div style={{ fontSize: 12, color: "#c9a880", lineHeight: 1.7 }}>{p.how_to_use}</div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              )}

              {activeTab === "international_brands" && (
                <div>
                  <SectionTitle>🌍 International Brand Recommendations</SectionTitle>
                  {analysis.international_brands?.map((p, i) => (
                    <DetailCard key={i} title={p.brand} badge={p.availability}>
                      <div style={{ marginBottom: 6, color: "#c9956a", fontSize: 12 }}>📦 {p.product}</div>
                      <div style={{ marginBottom: 8 }}>{p.purpose}</div>
                      <div style={{ background: "rgba(201,149,106,0.06)", borderRadius: 8, padding: "10px 12px", borderLeft: "2px solid #8b5e3c" }}>
                        <div style={{ fontSize: 10, color: "#8a6a55", letterSpacing: "0.1em", marginBottom: 4 }}>HOW TO USE</div>
                        <div style={{ fontSize: 12, color: "#c9a880", lineHeight: 1.7 }}>{p.how_to_use}</div>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              )}

              {activeTab === "routine" && (
                <div>
                  <SectionTitle>Daily Skincare Routine</SectionTitle>
                  <SubTitle>☀️ Morning</SubTitle><StepList items={analysis.daily_routine?.morning} />
                  <SubTitle>🌙 Evening</SubTitle><StepList items={analysis.daily_routine?.evening} />
                  <SubTitle>📅 Weekly</SubTitle><StepList items={analysis.daily_routine?.weekly} />
                </div>
              )}

              {activeTab === "ingredients" && (
                <div>
                  <SectionTitle>✅ Key Ingredients to Use</SectionTitle>
                  {analysis.key_ingredients?.map((ing, i) => <DetailCard key={i} title={ing.ingredient} color="#4ade80">{ing.benefit}</DetailCard>)}
                  <SectionTitle>❌ Ingredients to Avoid</SectionTitle>
                  {analysis.ingredients_to_avoid?.map((ing, i) => <DetailCard key={i} title={ing.ingredient} color="#f87171">{ing.reason}</DetailCard>)}
                </div>
              )}

              {activeTab === "diet" && (
                <div>
                  <SectionTitle>🥗 Diet Plan for Skin Health</SectionTitle>
                  <SubTitle>✅ Foods to Eat</SubTitle>
                  {analysis.diet_plan?.foods_to_eat?.map((f, i) => <DetailCard key={i} title={f.food} color="#4ade80">{f.benefit}</DetailCard>)}
                  <SubTitle>❌ Foods to Avoid</SubTitle>
                  {analysis.diet_plan?.foods_to_avoid?.map((f, i) => <DetailCard key={i} title={f.food} color="#f87171">{f.reason}</DetailCard>)}
                  <SubTitle>💊 Key Nutrients</SubTitle>
                  {analysis.diet_plan?.nutrients_needed?.map((n, i) => <DetailCard key={i} title={n.nutrient} badge={n.sources}>{n.benefit}</DetailCard>)}
                  <SubTitle>💧 Daily Water Intake</SubTitle>
                  <div style={{ background: "rgba(99,179,237,0.08)", border: "1px solid #2a4a6a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#90cdf4", marginBottom: 16 }}>{analysis.diet_plan?.daily_water_intake}</div>
                  <SubTitle>🌿 Supplements</SubTitle>
                  {analysis.diet_plan?.supplements?.map((s, i) => <DetailCard key={i} title={s.supplement} badge={s.dosage}>{s.benefit}</DetailCard>)}
                </div>
              )}

              {activeTab === "consultation" && (
                <div>
                  <SectionTitle>Client Consultation Script</SectionTitle>
                  <div style={{ background: "rgba(201,149,106,0.05)", border: "1px solid #5a3f35", borderRadius: 12, padding: 20, lineHeight: 1.8, fontSize: 13, color: "#d4b896", fontStyle: "italic" }}>"{analysis.client_consultation_script}"</div>
                </div>
              )}

              {activeTab === "plan" && (
                <div>
                  <SectionTitle>Treatment Plan</SectionTitle>
                  {analysis.treatment_plan && Object.entries(analysis.treatment_plan).map(([phase, desc]) => (
                    <DetailCard key={phase} title={phase.replace(/_/g, " ").toUpperCase()}>{desc}</DetailCard>
                  ))}
                </div>
              )}

              {activeTab === "courses" && (
                <div>
                  <SectionTitle>Recommended Training Courses</SectionTitle>
                  {analysis.recommended_courses?.map((c, i) => <DetailCard key={i} title={c.course_topic}>{c.reason}</DetailCard>)}
                </div>
              )}

              {activeTab === "notes" && (
                <div>
                  <SectionTitle>🔒 Professional Notes (Private)</SectionTitle>
                  <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid #5a2020", borderRadius: 12, padding: 20, lineHeight: 1.8, fontSize: 13, color: "#d4a0a0" }}>{analysis.professional_notes}</div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9956a", marginBottom: 14, borderBottom: "1px solid #3d1f2a", paddingBottom: 7 }}>{children}</div>;
}
function SubTitle({ children }) {
  return <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#8a6a55", margin: "16px 0 8px", textTransform: "uppercase" }}>{children}</div>;
}
function Grid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>{children}</div>;
}
function Card({ title, value, highlight }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #3d1f2a", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#5a3f35", textTransform: "uppercase", marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 15, fontWeight: "bold", color: highlight || "#e8c9a0", textTransform: "capitalize" }}>{value}</div>
    </div>
  );
}
function DetailCard({ title, children, badge, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #3d1f2a", borderRadius: 10, padding: "13px 15px", marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
        <div style={{ fontWeight: "bold", color: color || "#e8c9a0", fontSize: 13 }}>{title}</div>
        {badge && <span style={{ fontSize: 9, background: "rgba(201,149,106,0.1)", border: "1px solid #5a3f35", borderRadius: 10, padding: "2px 9px", color: "#8a6a55", whiteSpace: "nowrap", marginLeft: 8 }}>{badge}</span>}
      </div>
      <div style={{ fontSize: 12, color: "#a08070", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}
function InfoPill({ label, value, blue }) {
  return (
    <div style={{ background: blue ? "rgba(99,179,237,0.08)" : "rgba(201,149,106,0.08)", border: `1px solid ${blue ? "#2a4a6a" : "#5a3f35"}`, borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 9, color: blue ? "#4a8aaa" : "#8a6a55", letterSpacing: "0.1em", marginBottom: 3 }}>{label?.toUpperCase()}</div>
      <div style={{ fontSize: 12, color: blue ? "#90cdf4" : "#c9956a", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
function PeelSessionCard({ session, value }) {
  return (
    <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid #4a3a6a", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 9, color: "#7a6aaa", letterSpacing: "0.1em", marginBottom: 4 }}>{session?.toUpperCase()}</div>
      <div style={{ fontSize: 12, color: "#c4b5fd", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
function TagList({ items, green, red }) {
  const color = green ? "#4ade80" : red ? "#f87171" : "#c9956a";
  const border = green ? "#1a4a2a" : red ? "#5a2020" : "#5a3f35";
  const bg = green ? "rgba(74,222,128,0.08)" : red ? "rgba(248,113,113,0.08)" : "rgba(201,149,106,0.1)";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
      {items?.map((item, i) => <span key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, color }}>{item}</span>)}
    </div>
  );
}
function BulletList({ items }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items?.map((item, i) => <li key={i} style={{ fontSize: 12, color: "#a08070", lineHeight: 1.8, marginBottom: 3 }}>{item}</li>)}
    </ul>
  );
}
function StepList({ items }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {items?.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
          <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "rgba(201,149,106,0.2)", border: "1px solid #8b5e3c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#c9956a", fontWeight: "bold" }}>{i + 1}</div>
          <div style={{ fontSize: 12, color: "#a08070", lineHeight: 1.7, paddingTop: 2 }}>{item}</div>
        </div>
      ))}
    </div>
  );
}
