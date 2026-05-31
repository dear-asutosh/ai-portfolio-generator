const getGroqClient = require("../config/groq");
const pdf = require("pdf-parse");
const { generateBlueprintInternal } = require("./blueprintController");
const { runCodeGenPipeline } = require("./codeGenPipeline");
const { assemblePortfolio, spliceSectionHtml } = require("./assemblePortfolio");
const { validatePortfolioBlueprint } = require("./blueprintValidator");
const { buildCacheKey, cacheGet, cacheSet, cacheDelete } = require("../services/generationCache");
const { callOpenRouter, selectModelsForEditType } = require("../config/openrouter");

const mammoth = require("mammoth");

// Global map to prevent concurrent AI generations for the same project
const activeGenerations = new Map();
const Tesseract = require("tesseract.js");

const cleanAndParseJSON = (str) => {
  try {
    // 1. Try standard parse first
    return JSON.parse(str);
  } catch (e) {
    console.log("Direct JSON parse failed, attempting cleanup...");
    
    // 2. Clean markdown backticks if present
    let cleanStr = str.trim();
    if (cleanStr.startsWith("```json")) {
      cleanStr = cleanStr.substring(7);
    } else if (cleanStr.startsWith("```")) {
      cleanStr = cleanStr.substring(3);
    }
    if (cleanStr.endsWith("```")) {
      cleanStr = cleanStr.substring(0, cleanStr.length - 3);
    }
    cleanStr = cleanStr.trim();

    try {
      return JSON.parse(cleanStr);
    } catch (e2) {
      console.error("Standard repair failed, trying regex extraction...");
      
      // 3. Clean up unescaped control characters (newlines) inside JSON values
      // A common failure is real newlines in JSON instead of '\n'
      let sanitized = cleanStr
        .replace(/[\r\n\t]/g, " ")
        .replace(/\\"/g, '____TEMP_ESC_QUOTE____');
        
      // Extract fields matching standard json keys
      const htmlMatch = sanitized.match(/"html"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"css")/);
      const cssMatch = sanitized.match(/"css"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"js")/);
      const jsMatch = sanitized.match(/"js"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"explanation"|\s*\})/);
      const explMatch = sanitized.match(/"explanation"\s*:\s*"([\s\S]*?)"\s*\}/);

      if (htmlMatch || cssMatch || jsMatch) {
        const restoreQuotes = (text) => {
          if (!text) return "";
          return text
            .replace(/____TEMP_ESC_QUOTE____/g, '"')
            .replace(/\\'/g, "'")
            .trim();
        };

        const result = {
          html: htmlMatch ? restoreQuotes(htmlMatch[1]) : "",
          css: cssMatch ? restoreQuotes(cssMatch[1]) : "",
          js: jsMatch ? restoreQuotes(jsMatch[1]) : ""
        };

        if (explMatch) {
          return {
            explanation: restoreQuotes(explMatch[1]),
            code: result
          };
        }
        
        return result;
      }
      throw new Error("Unable to parse or repair JSON: " + e2.message);
    }
  }
};

/**
 * Helper to extract all hyperlinks and URIs directly from the binary buffer of a PDF.
 * This ensures that social media links and icons that have hyperlink annotations
 * (but no visible text printed in the PDF) are successfully extracted.
 */
function extractPDFLinks(buffer) {
  const binary = buffer.toString('binary');
  const links = [];
  
  // 1. Match literal strings: /URI (http...) or /URI (mailto:...)
  const literalPattern = /\/URI\s*\(([^)]+)\)/gi;
  let match;
  while ((match = literalPattern.exec(binary)) !== null) {
    const url = match[1].trim();
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
      links.push(url);
    }
  }
  
  // 2. Match hex strings: /URI <hex...>
  const hexPattern = /\/URI\s*<([0-9a-fA-F]+)>/gi;
  while ((match = hexPattern.exec(binary)) !== null) {
    try {
      const hex = match[1];
      let str = '';
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      const url = str.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
        links.push(url);
      }
    } catch (e) {
      // Ignore conversion errors
    }
  }
  
  // 3. Match raw http/https links in the binary stream that are not annotations (plain text URLs)
  const rawUrlPattern = /(https?:\/\/[^\s()<>{}|\\^~[\]`"';]+)/gi;
  while ((match = rawUrlPattern.exec(binary)) !== null) {
    // Clean trailing punctuation or brackets
    let url = match[1].replace(/[.,;:!?'")\]]+$/, '');
    links.push(url);
  }
  
  return [...new Set(links)];
}

/**
 * @desc    Parse resume (PDF, DOCX, Image) and return structured data
 * @route   POST /api/ai/parse-resume
 * @access  Private
 */
exports.parseResume = async (req, res) => {
  try {
    if (!req.file) {
      console.log("No file uploaded in req.file");
      return res.status(400).json({
        success: false,
        message: "Please upload a file (PDF, DOCX, or Image).",
      });
    }

    const { mimetype, buffer } = req.file;
    console.log("File received:", { mimetype, size: buffer.length });
    let extractedText = "";

    try {
      // 1. Handle DOCX
      if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        console.log("Extracting text and hyperlinks from DOCX...");
        const result = await mammoth.convertToHtml({ buffer });
        extractedText = result.value;
      } 
      // 2. Handle PDF
      else if (mimetype === "application/pdf") {
        console.log("Extracting text and hyperlinks from PDF...");
        try {
          const pdfData = await pdf(buffer);
          extractedText = pdfData.text;
          
          // Extract hyperlinks directly from binary buffer
          const links = extractPDFLinks(buffer);
          if (links.length > 0) {
            extractedText += "\n\n--- EXTRACTED HYPERLINKS ---\n" + links.join("\n");
            console.log(`Successfully extracted ${links.length} hyperlinks from PDF resume!`);
          }
        } catch (pdfError) {
          console.error("PDF Parsing Error (pdf-parse):", pdfError);
          throw new Error("Failed to parse PDF: " + pdfError.message);
        }

        // Fallback for scanned PDFs (if text is suspiciously short)
        if (!extractedText || extractedText.trim().length < 50) {
          console.log("PDF extraction returned very little text, possible scanned PDF.");
          return res.status(400).json({
            success: false,
            message: "This PDF seems to be a scanned image. Please upload a text-based PDF, a DOCX file, or a high-quality image of your resume.",
          });
        }
      }
      // 3. Handle Images (OCR)
      else if (mimetype.startsWith("image/")) {
        console.log("Performing OCR on image...");
        const { data: { text } } = await Tesseract.recognize(buffer, "eng");
        extractedText = text;
      } 
      else {
        console.log("Unsupported mimetype:", mimetype);
        return res.status(400).json({
          success: false,
          message: "Unsupported file type. Please upload PDF, DOCX, or an image.",
        });
      }
    } catch (extractionError) {
      console.error("Text Extraction Error:", extractionError);
      return res.status(500).json({
        success: false,
        message: "Failed to extract text from the uploaded file.",
        error: extractionError.message,
      });
    }

    console.log("Text extraction complete. Length:", extractedText.length);

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Could not extract enough text from the file. Please ensure the file is not empty or corrupted.",
      });
    }

    // AI Parsing with Groq with robust fallback logic
    console.log("Sending text to Groq for parsing...");
    const systemPrompt = "You are an expert resume parser and portfolio architect. Extract structured information from the provided text and return it as a clean JSON object following this schema: { personalInfo: { name, email, phone, location, bio, socialLinks: [] }, skills: [], experience: [{ title, company, location, duration, description }], education: [{ degree, school, year }], projects: [{ title, description, technologies: [] }] }. ONLY return JSON, no extra text.";
    
    try {
      const groq = getGroqClient();
      let chatCompletion;
      
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: extractedText },
          ],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
        });
      } catch (apiError) {
        if (apiError.status === 429) {
          console.warn("Groq 429 Rate Limit for 70B model during parsing. Fallback to mixtral-8x7b-32768...");
          try {
            chatCompletion = await groq.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: extractedText },
              ],
              model: "mixtral-8x7b-32768",
            });
          } catch (mixtralError) {
            console.warn("Mixtral fallback failed or rate-limited. Fallback to llama-3.1-8b-instant...");
            chatCompletion = await groq.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: extractedText },
              ],
              model: "llama-3.1-8b-instant",
            });
          }
        } else {
          throw apiError;
        }
      }

      console.log("Groq response received.");
      const content = chatCompletion.choices[0].message.content;
      console.log("AI Content Length:", content.length);

      try {
        const parsedData = cleanAndParseJSON(content);
        res.status(200).json({
          success: true,
          data: parsedData,
        });
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Raw content:", content);
        res.status(500).json({
          success: false,
          message: "Failed to parse AI response into JSON.",
          error: parseError.message,
          rawContent: content
        });
      }
    } catch (groqError) {
      console.error("Groq API Error:", groqError);
      res.status(500).json({
        success: false,
        message: "AI Parsing failed via Groq.",
        error: groqError.message,
      });
    }
  } catch (error) {
    console.error("Critical Error in parseResume:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during resume processing.",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};



/**
 * @desc    Generate structured portfolio data from text (e.g., resume)
 * @route   POST /api/ai/generate-data
 * @access  Private
 */
exports.generatePortfolioData = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Please provide text content to parse.",
      });
    }

    const systemPrompt = "You are an expert resume parser and portfolio architect. Extract structured information from the provided text and return it as a clean JSON object following this schema: { personalInfo: { name, email, phone, location, bio, socialLinks: [] }, skills: [], experience: [{ title, company, location, duration, description }], education: [{ degree, school, year }], projects: [{ title, description, technologies: [] }] }. ONLY return JSON, no extra text.";
    
    try {
      const groq = getGroqClient();
      let chatCompletion;
      
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
        });
      } catch (apiError) {
        if (apiError.status === 429) {
          console.warn("Groq 429 Rate Limit for 70B model during data generation. Fallback to mixtral-8x7b-32768...");
          try {
            chatCompletion = await groq.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text },
              ],
              model: "mixtral-8x7b-32768",
            });
          } catch (mixtralError) {
            console.warn("Mixtral fallback failed or rate-limited. Fallback to llama-3.1-8b-instant...");
            chatCompletion = await groq.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text },
              ],
              model: "llama-3.1-8b-instant",
            });
          }
        } else {
          throw apiError;
        }
      }

      const parsedData = cleanAndParseJSON(chatCompletion.choices[0].message.content);

      res.status(200).json({
        success: true,
        data: parsedData,
      });
    } catch (error) {
      console.error("Groq AI Error:", error);
      res.status(500).json({
        success: false,
        message: "AI generation failed. Please try again later.",
        error: error.message,
      });
    }
  } catch (outerError) {
    console.error("Critical Error in generatePortfolioData:", outerError);
    res.status(500).json({
      success: false,
      message: "Critical server error during data generation.",
      error: outerError.message
    });
  }
};

/**
 * @desc    Suggest portfolio sections or improvements
 * @route   POST /api/ai/suggest
 * @access  Private
 */
exports.suggestImprovements = async (req, res) => {
  try {
    const { currentData, prompt } = req.body;

    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a senior portfolio consultant. Based on the current user data, suggest improvements or new sections to make the portfolio stand out.",
        },
        {
          role: "user",
          content: `Current Data: ${JSON.stringify(currentData)}\nUser Request: ${prompt}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.status(200).json({
      success: true,
      suggestion: chatCompletion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Groq AI Error:", error);
    res.status(500).json({
      success: false,
      message: "AI suggestion failed.",
      error: error.message,
    });
  }
};

/**
 * @desc    Initialize portfolio code (HTML/CSS/JS) from structured data
 * @route   POST /api/ai/initialize-portfolio
 * @access  Private
 */
exports.initializePortfolio = async (req, res) => {
  const { userData, targetRole } = req.body;
  const projectId = req.body.projectId;

  if (projectId) {
    if (activeGenerations.has(projectId)) {
      return res.status(429).json({
        success: false,
        message: "Generation already in progress for this project.",
      });
    }
    activeGenerations.set(projectId, true);
  }

  try {
    return await initializePortfolioBlueprintMode(req, res, { userData, targetRole });
  } finally {
    if (projectId) {
      activeGenerations.delete(projectId);
    }
  }
};

// ─── Blueprint-Guided Portfolio Initialization ──────────────────────────────

/**
 * Blueprint-first portfolio generation pipeline.
 */
async function initializePortfolioBlueprintMode(req, res, { userData, targetRole }) {
  // Normalize user data
  const hasProfile = userData && userData.personalInfo && Object.keys(userData.personalInfo).length > 0;
  const normalizedUserData = {
    personalInfo: {
      name: hasProfile ? userData.personalInfo.name : "Creative Professional",
      bio: hasProfile ? userData.personalInfo.bio : "Passionate designer and engineer dedicated to crafting premium web experiences.",
      location: hasProfile ? userData.personalInfo.location : "New York, NY",
      email: hasProfile ? userData.personalInfo.email : "hello@professional.com",
      socialLinks: hasProfile ? userData.personalInfo.socialLinks : [],
      targetRole: targetRole || "",
    },
    skills: userData?.skills?.length > 0 ? userData.skills : ["React.js", "Tailwind CSS", "UI/UX Engineering"],
    experience: userData?.experience?.length > 0 ? userData.experience : [
      { title: "Senior Engineer", company: "Acme Corp", duration: "2023 - Present", description: "Led frontend architecture." }
    ],
    education: userData?.education?.length > 0 ? userData.education : [
      { degree: "B.S. Computer Science", school: "State University", year: "2022" }
    ],
    projects: userData?.projects?.length > 0 ? userData.projects : [
      { title: "Portfolio Generator", description: "AI-powered portfolio creation tool.", technologies: ["React", "Node.js"] }
    ],
  };

  const Project = require("../models/Project");
  const projectId = req.body.projectId;

  const setPhase = async (phase) => {
    if (!projectId) return;
    try {
      await Project.findByIdAndUpdate(projectId, { generationPhase: phase });
      console.log(`[Blueprint Mode] Phase → ${phase}`);
    } catch (e) {
      console.warn(`[Blueprint Mode] Failed to set phase '${phase}': ${e.message}`);
    }
  };

  const cacheKey = buildCacheKey(normalizedUserData);
  const cached = cacheGet(cacheKey);
  if (cached.hit) {
    console.log(`[Blueprint Mode] Cache HIT — skipping pipeline.`);

    // Save cached result to project
    if (projectId) {
      try {
        await Project.findByIdAndUpdate(projectId, {
          blueprint: cached.value.blueprint,
          generatedCode: {
            html: cached.value.html,
            css: cached.value.customCss,
            js: cached.value.js,
          },
          generationPhase: 'done',
        });
      } catch (e) {
        console.warn(`[Blueprint Mode] Failed to save cached result: ${e.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        html: cached.value.html,
        css: cached.value.customCss,
        js: cached.value.js,
        fullPreviewHtml: cached.value.fullPreviewHtml,
      },
      blueprint: cached.value.blueprint,
      meta: {
        pipeline: "3-layer-hybrid",
        blueprintModel: cached.value.blueprintModel,
        cacheHit: true,
      },
    });
  }

  // ── Step 1: Generate Blueprint ──────────────────────────────────────────
  let blueprint, blueprintModel;

  try {
    await setPhase('blueprint');
    console.log(`[Blueprint Mode] Step 1 — generating blueprint...`);
    const result = await generateBlueprintInternal(normalizedUserData);
    blueprintModel = result.model;

    // ── Zod Validation ──────────────────────────────────────────────────
    const { blueprint: validatedBlueprint, valid, errors } = validatePortfolioBlueprint(result.blueprint);
    blueprint = validatedBlueprint;
    if (!valid) {
      console.warn(`[Blueprint Mode] Blueprint validation issues (using defaults for ${errors.length} field(s)).`);
    }
    console.log(`[Blueprint Mode] Blueprint ready (via ${blueprintModel}, valid: ${valid}).`);
  } catch (blueprintError) {
    console.error(`[Blueprint Mode] Blueprint generation failed: ${blueprintError.message}.`);
    await setPhase('error');
    return res.status(500).json({ success: false, message: "Blueprint generation failed.", error: blueprintError.message });
  }

  // ── Step 2: 3-Layer Code Generation Pipeline ───────────────────────────
  let rawHtml, rawCss, rawJs;

  try {
    await setPhase('design-interactions');
    console.log(`[Blueprint Mode] Instantly compiling template assets for project ${projectId || 'temp'}...`);
    const compiledCode = await runCodeGenPipeline(blueprint, normalizedUserData);
    rawHtml = compiledCode.html;
    rawCss = compiledCode.css;
    rawJs = compiledCode.js;

    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        'generatedCode.html': rawHtml,
        'generatedCode.css': rawCss,
        'generatedCode.js': rawJs
      });
      console.log(`[Progressive Preview] HTML, CSS and JS saved intermediate for project ${projectId}`);
    }
  } catch (pipelineError) {
    console.error(`[Blueprint Mode] 3-layer pipeline failed: ${pipelineError.message}.`);
    await setPhase('error');
    return res.status(500).json({ success: false, message: "Generation pipeline failed.", error: pipelineError.message });
  }

  // ── Step 3: Assembly ────────────────────────────────────────────────────
  await setPhase('assembling');
  const assembled = assemblePortfolio({ html: rawHtml, customCss: rawCss, js: rawJs });

  // ── Save to DB + Cache ──────────────────────────────────────────────────
  const cachePayload = {
    ...assembled,
    blueprint,
    blueprintModel,
  };
  cacheSet(cacheKey, cachePayload);

  if (projectId) {
    try {
      await Project.findByIdAndUpdate(projectId, {
        blueprint,
        generatedCode: {
          html: assembled.html,
          css: assembled.customCss,
          js: assembled.js,
        },
        generationPhase: 'done',
      });
      console.log(`[Blueprint Mode] Result saved to project ${projectId}.`);
    } catch (saveError) {
      console.warn(`[Blueprint Mode] Failed to save to project: ${saveError.message}`);
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      html: assembled.html,
      css: assembled.customCss,
      js: assembled.js,
      fullPreviewHtml: assembled.fullPreviewHtml,
    },
    blueprint,
    meta: {
      pipeline: "3-layer-hybrid",
      blueprintModel,
      cacheHit: false,
      assemblyMeta: assembled.meta,
    },
  });
}


/**
 * @desc    Modify portfolio code (HTML/CSS/JS) using AI based on user prompt
 * @route   POST /api/ai/modify-portfolio
 * @access  Private
 */
exports.modifyPortfolioCode = async (req, res) => {
  try {
    const { projectId, prompt, currentCode } = req.body;

    if (!projectId || !prompt || !currentCode) {
      return res.status(400).json({
        success: false,
        message: "Project ID, prompt, and current code are required.",
      });
    }

    const Project = require('../models/Project');
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const groq = getGroqClient();
    console.log(`Modifying portfolio for project ${projectId} with prompt: ${prompt}`);
    
    // High-fidelity modification prompt to guarantee all modifications are visually stunning and modern
    const systemPrompt = `You are a master UI/UX designer and elite frontend engineer who builds Awwwards-winning websites using Tailwind CSS. You edit existing portfolio code to reflect user requests while keeping the design stunning, ultra-modern, and premium. You always return a valid, parsable JSON object containing "explanation" and a "code" object with "html", "css", and "js" fields. No markdown, no backticks outside the JSON. Ensure the code is beautifully formatted with proper double-space indentation. DO NOT return minified code.`;

    const userPrompt = `
      You are editing an existing personal portfolio website styled with Tailwind CSS. 
      The website belongs to:
      Name: ${project.content?.personalInfo?.name || 'Professional'}
      Role: ${project.description || 'Professional'}
      Bio: ${project.content?.personalInfo?.bio || ''}
      Skills: ${JSON.stringify(project.content?.skills || [])}
      Experience: ${JSON.stringify(project.content?.experience || [])}
      Projects: ${JSON.stringify(project.content?.projects || [])}

      Current HTML (includes Tailwind CSS CDN script tag):
      \`\`\`html
      ${currentCode.html}
      \`\`\`

      Current CSS (contains custom keyframes, variables, and fonts):
      \`\`\`css
      ${currentCode.css}
      \`\`\`

      Current JS:
      \`\`\`javascript
      ${currentCode.js}
      \`\`\`

      User Requested Modification:
      "${prompt}"

      Elite UI/UX Editing Guidelines:
      1. Make all additions and updates using Tailwind CSS utility classes inside the HTML "class" attributes to ensure the layout remains 100% responsive (using sm:, md:, lg: prefixes).
      2. Keep the design extremely premium, using modern layouts (Bento grids, glow effects, floating elements, beautiful fonts, gradient headings, SVG or FontAwesome icons).
      3. Maintain all existing visual details, responsiveness, and functional sections unless explicitly asked to modify or remove them.
      4. Ensure all newly added buttons, sections, or styles have smooth CSS transitions and hover states.
      5. CRITICAL LAYOUT WARNING: NEVER use 'h-screen' or vertically-centered flex layout ('justify-center') on the root container of the page, as it pushes headers and hero sections off-screen. ALWAYS ensure root wrappers are scrollable, using 'min-h-screen' and 'justify-start' with top-padding/margin to accommodate fixed navbars.
      6. Provide a concise, professional explanation of the changes made in the "explanation" field (written in first-person as a helpful coding assistant).
      7. Return ONLY a JSON object with this exact structure:
      {
        "explanation": "Explanation of the premium changes made...",
        "code": {
          "html": "Updated html body content...",
          "css": "Updated css styles...",
          "js": "Updated javascript code..."
        }
      }
    `;

    // ── Update Workflow: Route to stage-appropriate model ────────────────
    // Content edits → Kimi K2.6  |  Layout → Qwen3  |  Design/JS → Nemotron
    const editModelList = selectModelsForEditType(prompt);
    console.log(`[Update Workflow] Modifying portfolio ${projectId} | prompt: "${prompt.slice(0, 60)}..."`);

    let modificationResult;
    try {
      const { content } = await callOpenRouter(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        {
          maxTokens: 8000,
          temperature: 0.4,
          modelList: editModelList,
          jsonMode: true,
        }
      );
      modificationResult = content;
    } catch (openRouterErr) {
      // Ultimate fallback: Groq (if all OpenRouter models and built-in Groq chain failed)
      console.warn(`[Update Workflow] OpenRouter exhausted for modify. Falling back to Groq directly...`);
      const groq = getGroqClient();
      let chatCompletion;
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          max_tokens: 8000,
        });
      } catch (groqErr) {
        if (groqErr.status === 429) {
          chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            model: "mixtral-8x7b-32768",
            response_format: { type: "json_object" },
            max_tokens: 4096,
          });
        } else {
          throw groqErr;
        }
      }
      modificationResult = chatCompletion.choices[0].message.content;
    }

    const content = modificationResult;
    const result = cleanAndParseJSON(content);

    // Defensive extraction of explanation and code blocks
    let explanation = result.explanation || "I have updated your portfolio code according to your suggestions.";
    let finalCode = result.code;
    
    if (!finalCode && result.html) {
      finalCode = {
        html: result.html,
        css: result.css || "",
        js: result.js || ""
      };
    }
    
    if (!finalCode) {
      throw new Error("Could not extract HTML, CSS, or JS from the AI response.");
    }

    // Save the updated code to the project in the database
    project.generatedCode = finalCode;
    await project.save();

    res.status(200).json({
      success: true,
      data: {
        explanation,
        code: finalCode
      }
    });
  } catch (error) {
    console.error("Modify Code Error:", error);
    
    // Check for Groq API Rate Limit (429) or token capacity limit
    const isRateLimit = error.status === 429 || 
                        error.statusCode === 429 || 
                        error.message?.includes("rate_limit") || 
                        error.message?.includes("429") ||
                        error.message?.includes("Rate limit reached");
                        
    if (isRateLimit) {
      return res.status(429).json({
        success: false,
        message: "Groq AI Rate Limit Reached: You have exhausted the daily free token budget (100,000 tokens) on our AI engine. Please wait a few minutes or try again later today.",
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to modify portfolio code.",
      error: error.message,
    });
  }
};

// ─── Section Regeneration ────────────────────────────────────────────────────

/**
 * @desc    Blueprint-driven section-level regeneration
 * @route   POST /api/ai/regenerate-section
 * @access  Private
 *
 * Architecture:
 *   1. Load the project's stored blueprint
 *   2. Apply blueprintMutations (intent fields like animationIntensity) to the blueprint
 *   3. Regenerate ONLY the targeted section's HTML using Layer 1
 *   4. Optionally regenerate CSS targeting that section via Layer 2
 *   5. Splice the new section HTML back into the full portfolio HTML
 *   6. Re-assemble fullPreviewHtml
 *   7. Save updated code + blueprint to project
 *   8. Invalidate the generation cache for this user+template combination
 *
 * This keeps regeneration blueprint-driven — "Make More Futuristic" becomes
 * a blueprint mutation (animationIntensity: 'immersive') rather than brittle
 * code editing.
 */
exports.regenerateSection = async (req, res) => {
  try {
    const { projectId, section, instruction, blueprintMutations } = req.body;

    if (!projectId || !section) {
      return res.status(400).json({
        success: false,
        message: "projectId and section are required.",
      });
    }

    const SUPPORTED_SECTIONS = ['hero', 'skills', 'projects', 'experience', 'education', 'contact', 'nav'];
    if (!SUPPORTED_SECTIONS.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported section '${section}'. Supported: ${SUPPORTED_SECTIONS.join(', ')}.`,
      });
    }

    const Project = require("../models/Project");

    if (activeGenerations.has(projectId)) {
      return res.status(429).json({
        success: false,
        message: "Generation already in progress for this project.",
      });
    }
    activeGenerations.set(projectId, true);

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found." });
      }

      const { DESIGN_SYSTEM_CAPABILITIES } = require("./blueprintController");

      // ── 1. Get existing blueprint + apply mutations ──────────────────────
      // Use existing blueprint or empty object. validation will fill defaults if fields are missing.
      let blueprint = project.blueprint && Object.keys(project.blueprint).length > 0 
        ? project.blueprint 
        : {};

      // Apply blueprint mutations from the request (e.g. { animationIntensity: 'immersive' })
      if (blueprintMutations && typeof blueprintMutations === 'object') {
        // Deep merge mutations into visualPersonalization or themeTweaks
        if (blueprintMutations.animationIntensity) {
          blueprint = {
            ...blueprint,
            visualPersonalization: {
              ...(blueprint.visualPersonalization || {}),
              animationIntensity: blueprintMutations.animationIntensity,
            },
          };
        }
        if (blueprintMutations.portfolioTone) {
          blueprint = { ...blueprint, portfolioTone: blueprintMutations.portfolioTone };
        }
        if (blueprintMutations.typographyPersonality) {
          blueprint = {
            ...blueprint,
            visualPersonalization: {
              ...(blueprint.visualPersonalization || {}),
              typographyPersonality: blueprintMutations.typographyPersonality,
            },
          };
        }
        // Extend here as more mutation types are added
      }

      // Validate the mutated blueprint (this safely fills defaults for any missing fields)
      const { blueprint: validBlueprint } = validatePortfolioBlueprint(blueprint);
      blueprint = validBlueprint;

      // ── 2. Build a section-scoped HTML prompt ────────────────────────────
      const userData = project.content || {};
      const currentHtml = project.generatedCode?.html || '';
      const currentCss = project.generatedCode?.css || '';
      const currentJs = project.generatedCode?.js || '';

      console.log(`[SectionRegen] Regenerating section '${section}' for project ${projectId}`);
      console.log(`[SectionRegen] Instruction: "${instruction || 'default'}"`);

      // Generate section-scoped HTML via a targeted prompt
      const { callOpenRouter, HTML_MODELS } = require('../config/openrouter');

      const sectionSystemPrompt = `You are a world-class frontend engineer. You are regenerating ONLY the "${section}" section of an existing portfolio website.

STRICT RULES:
1. Return ONLY a JSON object: { "sectionHtml": "<the complete section HTML>" }
2. The section must have id="${section}" on its root element.
3. Use Tailwind CSS utility classes for all styling.
4. Apply data-animate="reveal" to the root section element.
5. Do NOT include <style>, <script>, <html>, <head>, or <body> tags.
6. Do NOT regenerate any other section — only the "${section}" section.
7. Match the color palette and visual personality of the existing design.`;

      const sectionUserPrompt = `Regenerate the "${section}" section of this portfolio.

INSTRUCTION: ${instruction || 'Keep the same quality but improve the design.'}

BLUEPRINT CONTEXT:
- Tone: ${blueprint.portfolioTone}
- Animation Intensity: ${blueprint.visualPersonalization?.animationIntensity}
- Typography: ${blueprint.visualPersonalization?.typographyPersonality}
- Primary Accent: ${blueprint.themeTweaks?.primaryAccent}
- Secondary Accent: ${blueprint.themeTweaks?.secondaryAccent}
- Design System: Profilio Design System V1 — ${DESIGN_SYSTEM_CAPABILITIES.personality}

USER DATA:
- Name: ${userData.personalInfo?.name}
- Role: ${userData.personalInfo?.targetRole || 'Professional'}
- Skills: ${JSON.stringify((userData.skills || []).slice(0, 12))}
- Experience: ${JSON.stringify((userData.experience || []).slice(0, 3))}
- Projects: ${JSON.stringify((userData.projects || []).slice(0, 4))}
- Education: ${JSON.stringify((userData.education || []).slice(0, 2))}
- Email: ${userData.personalInfo?.email}
- Social Links: ${JSON.stringify(userData.personalInfo?.socialLinks || [])}

Return ONLY: { "sectionHtml": "..." }`;

      const { content: sectionContent } = await callOpenRouter(
        [
          { role: 'system', content: sectionSystemPrompt },
          { role: 'user', content: sectionUserPrompt },
        ],
        {
          maxTokens: 3000,
          temperature: 0.4,
          modelList: HTML_MODELS,
          jsonMode: true,
        }
      );

      // Extract the section HTML from the JSON response
      let newSectionHtml = '';
      try {
        let cleaned = sectionContent.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        const parsed = JSON.parse(cleaned.trim());
        newSectionHtml = parsed.sectionHtml || parsed.html || '';
      } catch {
        // Fallback: try to extract raw HTML
        newSectionHtml = sectionContent
          .replace(/^```html?\n?/i, '')
          .replace(/\n?```$/, '')
          .trim();
      }

      if (!newSectionHtml || newSectionHtml.length < 50) {
        return res.status(500).json({
          success: false,
          message: 'Section regeneration returned insufficient content.',
        });
      }

      // ── 3. Splice new section into full HTML ─────────────────────────────
      const updatedHtml = spliceSectionHtml(currentHtml, section, newSectionHtml);

      // ── 4. Re-assemble the full preview document ─────────────────────────
      const assembled = assemblePortfolio({
        html: updatedHtml,
        customCss: currentCss,
        js: currentJs,
      });

      // ── 5. Save updated code + mutated blueprint to project ──────────────
      await Project.findByIdAndUpdate(projectId, {
        'generatedCode.html': assembled.html,
        blueprint,
      });

      // ── 6. Invalidate cache ───────────────────────────────────────────────
      const cacheKey = buildCacheKey(project.content || {});
      cacheDelete(cacheKey);

      console.log(`[SectionRegen] ✅ Section '${section}' regenerated successfully.`);

      return res.status(200).json({
        success: true,
        data: {
          section,
          sectionHtml: newSectionHtml,
          html: assembled.html,
          css: assembled.customCss,
          js: assembled.js,
          fullPreviewHtml: assembled.fullPreviewHtml,
        },
        blueprint,
        meta: {
          section,
          instruction: instruction || null,
          blueprintMutationsApplied: blueprintMutations || null,
        },
      });
    } finally {
      activeGenerations.delete(projectId);
    }
  } catch (error) {
    console.error('[SectionRegen] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Section regeneration failed.',
      error: error.message,
    });
  }
};
