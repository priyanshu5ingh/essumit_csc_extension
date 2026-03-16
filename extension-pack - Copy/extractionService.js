/* ============================================================
   CSC Sahayak — Extraction Service (FAST)
   Pipeline: Image Resize → Tesseract OCR (eng only) → Groq 8B Instant
   Speed optimisations:
     ✓ Images pre-scaled to ≤1200px before OCR (much faster recognition)
     ✓ Tesseract language: eng only (hin doubles recognition time)
     ✓ Tesseract PSM 6: uniform block — avoids full-page layout analysis
     ✓ Groq model: llama-3.1-8b-instant (5-10× faster than 70B)
     ✓ Single Groq call regardless of doc count (no per-doc calls)
     ✓ Mismatch detection done on OCR text diff, no extra API round-trips
   ============================================================ */

const ExtractionService = (() => {
  "use strict";

  // ─── Groq Configuration ────────────────────────────────────
  const GROQ_API_KEY  = "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";
  // 8B-instant: same quality for structured JSON, but 5-10× faster than 70B
  const GROQ_MODEL    = "llama-3.1-8b-instant";
  const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

  // OCR image pre-scaling cap (pixels). 800px is the sweet spot: large enough for
  // printed text, small enough to decode and recognise quickly.
  const MAX_OCR_DIMENSION = 800;

  // ─── Field Label Mappings ──────────────────────────────────
  const FIELD_LABELS = {
    childName:           { en: "Child Name",            hi: "बच्चे का नाम" },
    dateOfBirth:         { en: "Date of Birth",         hi: "जन्म तिथि" },
    gender:              { en: "Gender",                 hi: "लिंग" },
    placeOfBirth:        { en: "Place of Birth",         hi: "जन्म स्थान" },
    fatherName:          { en: "Father's Name",          hi: "पिता का नाम" },
    motherName:          { en: "Mother's Name",          hi: "माता का नाम" },
    fatherAadhaar:       { en: "Father's Aadhaar",       hi: "पिता का आधार" },
    motherAadhaar:       { en: "Mother's Aadhaar",       hi: "माता का आधार" },
    hospitalName:        { en: "Hospital Name",          hi: "अस्पताल का नाम" },
    address:             { en: "Address",                hi: "पता" },
    district:            { en: "District",               hi: "जिला" },
    state:               { en: "State",                  hi: "राज्य" },
    applicantName:       { en: "Applicant Name",         hi: "आवेदक का नाम" },
    deceasedName:        { en: "Deceased Name",          hi: "मृतक का नाम" },
    dateOfDeath:         { en: "Date of Death",          hi: "मृत्यु तिथि" },
    causeOfDeath:        { en: "Cause of Death",         hi: "मृत्यु का कारण" },
    placeOfDeath:        { en: "Place of Death",         hi: "मृत्यु स्थान" },
    age:                 { en: "Age",                    hi: "आयु" },
    fatherOrSpouseName:  { en: "Father/Spouse Name",     hi: "पिता/पति का नाम" },
    applicantRelation:   { en: "Applicant Relation",     hi: "आवेदक का संबंध" },
    currentAddress:      { en: "Current Address",        hi: "वर्तमान पता" },
    permanentAddress:    { en: "Permanent Address",      hi: "स्थायी पता" },
    residenceSinceYear:  { en: "Residence Since",        hi: "निवास वर्ष से" },
    tehsil:              { en: "Tehsil",                  hi: "तहसील" },
    village:             { en: "Village",                 hi: "गाँव" },
    occupation:          { en: "Occupation",              hi: "व्यवसाय" },
    annualIncome:        { en: "Annual Income",           hi: "वार्षिक आय" },
    sourceOfIncome:      { en: "Source of Income",        hi: "आय का स्रोत" },
    caste:               { en: "Caste",                   hi: "जाति" },
    subCaste:            { en: "Sub-Caste",               hi: "उप-जाति" },
    category:            { en: "Category",                hi: "वर्ग" },
    bankAccountNumber:   { en: "Bank Account No.",        hi: "बैंक खाता नं." },
    ifscCode:            { en: "IFSC Code",               hi: "IFSC कोड" },
    bankName:            { en: "Bank Name",               hi: "बैंक का नाम" },
    branchName:          { en: "Branch Name",             hi: "शाखा का नाम" },
    husbandName:         { en: "Husband's Name",          hi: "पति का नाम" },
    dateOfHusbandDeath:  { en: "Husband's Death Date",    hi: "पति की मृत्यु तिथि" },
    aadhaarNumber:       { en: "Aadhaar Number",          hi: "आधार नंबर" },
    mobileNumber:        { en: "Mobile Number",           hi: "मोबाइल नंबर" },
    khasraNumber:        { en: "Khasra Number",           hi: "खसरा नंबर" },
    landArea:            { en: "Land Area",               hi: "भूमि क्षेत्रफल" },
    cropType:            { en: "Crop Type",               hi: "फसल का प्रकार" },
    headOfFamily:        { en: "Head of Family",          hi: "परिवार का मुखिया" },
    familyMembersCount:  { en: "Family Members",          hi: "परिवार के सदस्य" },
    gasConnection:       { en: "Gas Connection",          hi: "गैस कनेक्शन" },
    ward:                { en: "Ward",                    hi: "वार्ड" },
    farmerName:          { en: "Farmer Name",             hi: "किसान का नाम" },
    serviceType:         { en: "Service Type",            hi: "सेवा प्रकार" }
  };

  // ─── OPTIMISATION 1: Pre-scale image before OCR ──────────
  /**
   * Resize a base64 image to MAX_OCR_DIMENSION on its longest side.
   * Tesseract is ~2-4× faster on smaller images with no quality loss for text.
   * Returns a new base64 string (jpeg, quality 0.88).
   */
  async function resizeImageForOCR(base64, mimeType) {
    // PDFs cannot be resized via canvas — return as-is
    if (mimeType && mimeType.includes("pdf")) return base64;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        const longest = Math.max(w, h);

        // If already small enough, skip resize
        if (longest <= MAX_OCR_DIMENSION) {
          resolve(base64);
          return;
        }

        const scale  = MAX_OCR_DIMENSION / longest;
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(w * scale);
        canvas.height = Math.round(h * scale);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 0.70 quality gives a much smaller blob with no visible text quality loss
        resolve(canvas.toDataURL("image/jpeg", 0.70));
      };
      img.onerror = () => resolve(base64); // fallback: use original
      img.src = base64.startsWith("data:") ? base64 : `data:${mimeType};base64,${base64}`;
    });
  }

  // ─── OPTIMISATION 2: Fast Tesseract settings ─────────────
  /**
   * Run Tesseract OCR with speed-optimised settings.
   * Language: eng only (adding 'hin' doubles recognition time).
   * PSM 6: treat page as a single uniform block — skips expensive layout analysis.
   */
  async function runTesseractOCR(base64, mimeType) {
    if (typeof Tesseract === "undefined") {
      throw new Error("Tesseract.js not loaded");
    }

    // Pre-scale the image first
    const scaledBase64 = await resizeImageForOCR(base64, mimeType);

    // Strip the data-URI prefix if present
    const srcForTesseract = scaledBase64.startsWith("data:")
      ? scaledBase64
      : `data:${mimeType || "image/jpeg"};base64,${scaledBase64}`;

    // Convert to blob URL (Tesseract.recognize accepts URLs directly)
    const rawB64 = srcForTesseract.includes(",")
      ? srcForTesseract.split(",")[1]
      : srcForTesseract;
    const byteChars = atob(rawB64);
    const byteNums  = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
    const resolvedMime = srcForTesseract.match(/data:([^;]+);/)?.[1] || mimeType || "image/jpeg";
    const blob    = new Blob([byteNums], { type: resolvedMime });
    const blobUrl = URL.createObjectURL(blob);

    try {
      const result = await Tesseract.recognize(blobUrl, "eng", {
        logger: () => {},                       // suppress verbose per-progress logs
        tessedit_pageseg_mode: "6",             // PSM 6: single uniform block (fastest)
        tessedit_ocr_engine_mode: "1"           // OEM 1: LSTM only — skips legacy engine
      });
      return (result.data && result.data.text) ? result.data.text.trim() : "";
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  // ─── OPTIMISATION 3: Tight Groq prompt for 8B model ─────
  /**
   * Builds a compact, instruction-focused prompt.
   * Shorter prompts = faster token generation on 8B models.
   */
  function buildGroqPrompt(ocrText, fieldsToExtract, serviceType) {
    const fieldList = fieldsToExtract
      .map(f => {
        const lbl = FIELD_LABELS[f] || { en: f };
        return `"${f}" (${lbl.en})`;
      })
      .join(", ");

    return `Extract government form fields from this OCR text (service: ${serviceType || "general"}).

OCR TEXT:
${ocrText || "(empty — no text extracted)"}

Return ONLY a JSON object. Keys: ${fieldList}
Each value: {"value": string|null, "confidence": 0.0-1.0}
Confidence: 0.85-1.0=exact match in text, 0.6-0.84=inferred, 0.0-0.59=guessed/absent.
Dates: DD/MM/YYYY. Aadhaar: 12 digits no spaces. No extra text, no markdown.`;
  }

  // ─── Groq API call ─────────────────────────────────────────
  async function callGroq(prompt) {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages:    [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens:  512    // Field values are short strings — 512 is more than enough
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const data    = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    console.log("[ExtractionService] Groq response:", content.substring(0, 400));
    return content;
  }

  // ─── Parse Groq JSON response ─────────────────────────────
  function parseGroqResponse(content, fieldsToExtract) {
    let parsed = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch (e) {
        console.warn("[ExtractionService] JSON parse failed:", e.message);
      }
    }

    const extractedFields = {};
    fieldsToExtract.forEach(key => {
      const raw = parsed && parsed[key];
      if (raw && typeof raw === "object" && raw.value !== undefined) {
        const val = typeof raw.value === "string" ? raw.value.trim() : null;
        extractedFields[key] = {
          value:      (val === "" || val === null || val === "null") ? null : val,
          confidence: Math.min(1, Math.max(0, Number(raw.confidence) || 0)),
          source:     "groq_ocr"
        };
      } else {
        extractedFields[key] = { value: null, confidence: 0, source: "groq_ocr" };
      }
    });
    return extractedFields;
  }

  // ─── OPTIMISATION 4: Single mismatch pass (no extra API calls) ─
  /**
   * Compare OCR text snippets per field using simple text search.
   * No additional Groq calls needed — just look for name/Aadhaar in raw texts.
   */
  function detectMismatchesFromOcrTexts(ocrTexts, extractedFields, fieldsToExtract) {
    const mismatches = [];
    if (ocrTexts.length < 2) return mismatches;

    fieldsToExtract.forEach(field => {
      if (!field.toLowerCase().includes("name") && !field.toLowerCase().includes("aadhaar")) return;
      const fieldData = extractedFields[field];
      if (!fieldData || !fieldData.value) return;

      const val = fieldData.value.trim().toLowerCase();

      // Check which documents contain this value in their raw OCR text
      const foundIn  = [];
      const missingIn = [];
      ocrTexts.forEach((text, idx) => {
        if (text.toLowerCase().includes(val)) {
          foundIn.push(`doc_${idx + 1}`);
        } else {
          missingIn.push(`doc_${idx + 1}`);
        }
      });

      // Mismatch = value found in one doc but not the other(s)
      if (foundIn.length > 0 && missingIn.length > 0) {
        mismatches.push({
          field,
          doc1:     foundIn[0],
          val1:     fieldData.value,
          doc2:     missingIn[0],
          val2:     "(not found)",
          severity: "warning"
        });
      }
    });

    return mismatches;
  }

  // ─── Main Extraction Function ─────────────────────────────
  /**
   * Extract fields from uploaded documents using Tesseract OCR + Groq AI.
   * Optimised for speed: image resize → eng-only OCR → 8B Groq model → single call.
   *
   * @param {Array}    documents       — [{ docType, fileName, base64, mimeType }]
   * @param {Array}    fieldsToExtract — ["childName", "fatherName", ...]
   * @param {string}   serviceType     — "birth_certificate" etc.
   * @param {Function} onProgress      — callback(stage, message)
   * @returns {Promise<{ extractedFields, crossDocumentMismatches }>}
   */
  async function extractFields(documents, fieldsToExtract, serviceType, onProgress) {
    onProgress = onProgress || (() => {});

    try {
      const uploadedDocs = (documents || []).filter(d => d.base64 && d.mimeType);

      if (uploadedDocs.length === 0) {
        onProgress("no_docs", "कोई दस्तावेज़ अपलोड नहीं / No documents uploaded");
        return getManualEntryFields(fieldsToExtract);
      }

      // ── STAGE 1: OCR all documents (sequentially — Tesseract is single-threaded) ──
      const ocrTexts = [];

      for (let i = 0; i < uploadedDocs.length; i++) {
        const doc = uploadedDocs[i];
        onProgress(
          "ocr",
          `📷 OCR जारी है (${i + 1}/${uploadedDocs.length})... / Reading document ${i + 1} of ${uploadedDocs.length}...`
        );
        console.log(`[ExtractionService] OCR doc ${i + 1}:`, doc.fileName, doc.mimeType);

        let text = "";
        try {
          text = await runTesseractOCR(doc.base64, doc.mimeType);
          console.log(`[ExtractionService] OCR #${i + 1}: ${text.length} chars —`, text.substring(0, 150));
        } catch (ocrErr) {
          console.warn(`[ExtractionService] OCR failed doc ${i + 1}:`, ocrErr.message);
        }

        ocrTexts.push(text);
      }

      const combinedOcrText = ocrTexts
        .map((t, i) => `[Doc ${i + 1}: ${uploadedDocs[i].fileName || uploadedDocs[i].docType}]\n${t}`)
        .join("\n\n---\n\n");

      // ── STAGE 2: Single Groq call for all fields ─────────
      onProgress("groq", "🤖 Groq AI से जानकारी निकाली जा रही है... / Extracting with AI...");
      console.log("[ExtractionService] Groq call — fields:", fieldsToExtract.length, "model:", GROQ_MODEL);

      const prompt          = buildGroqPrompt(combinedOcrText, fieldsToExtract, serviceType);
      const content         = await callGroq(prompt);
      const extractedFields = parseGroqResponse(content, fieldsToExtract);

      // ── STAGE 3: Mismatch detection (no extra API calls) ─
      const crossDocumentMismatches = detectMismatchesFromOcrTexts(
        ocrTexts, extractedFields, fieldsToExtract
      );

      onProgress("complete", "✅ निष्कर्षण पूरा / Extraction complete");

      console.log("[ExtractionService] Done. Fields:", extractedFields);
      console.log("[ExtractionService] Mismatches:", crossDocumentMismatches);

      return { extractedFields, crossDocumentMismatches };

    } catch (error) {
      console.error("[ExtractionService] Error:", error);
      onProgress("error", `⚠️ त्रुटि — ${error.message}`);
      await new Promise(r => setTimeout(r, 2500));
      return getManualEntryFields(fieldsToExtract);
    }
  }

  // ─── Helpers ───────────────────────────────────────────────

  function getManualEntryFields(fieldsToExtract) {
    const extractedFields = {};
    (fieldsToExtract || []).forEach(f => {
      extractedFields[f] = { value: "", confidence: 0.0, source: "manual" };
    });
    return { extractedFields, crossDocumentMismatches: [] };
  }

  function getFieldLabel(fieldKey) {
    return FIELD_LABELS[fieldKey] || { en: fieldKey, hi: fieldKey };
  }

  function getConfidenceLevel(confidence) {
    if (confidence >= 0.85) return "high";
    if (confidence >= 0.60) return "medium";
    return "low";
  }

  // ─── Public API ────────────────────────────────────────────
  return {
    extractFields,
    getManualEntryFields,
    getFieldLabel,
    getConfidenceLevel,
    FIELD_LABELS
  };
})();
