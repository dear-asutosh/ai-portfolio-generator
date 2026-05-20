const getGroqClient = require("../config/groq");
const pdf = require("pdf-parse");


const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");

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
        console.log("Extracting text from DOCX...");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } 
      // 2. Handle PDF
      else if (mimetype === "application/pdf") {
        console.log("Extracting text from PDF...");
        try {
          const pdfData = await pdf(buffer);
          extractedText = pdfData.text;
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

    // AI Parsing with Groq
    console.log("Sending text to Groq for parsing...");
    try {
      const groq = getGroqClient();
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert resume parser and portfolio architect. Extract structured information from the provided text and return it as a clean JSON object following this schema: { personalInfo: { name, email, phone, location, bio, socialLinks: [] }, skills: [], experience: [{ title, company, location, duration, description }], education: [{ degree, school, year }], projects: [{ title, description, technologies: [] }] }. ONLY return JSON, no extra text.",
          },
          {
            role: "user",
            content: extractedText,
          },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      console.log("Groq response received.");
      const content = chatCompletion.choices[0].message.content;
      console.log("AI Content Length:", content.length);

      try {
        const parsedData = JSON.parse(content);
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

    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser and portfolio architect. Extract structured information from the provided text and return it as a clean JSON object following this schema: { personalInfo: { name, email, phone, location, bio, socialLinks: [] }, skills: [], experience: [{ title, company, location, duration, description }], education: [{ degree, school, year }], projects: [{ title, description, technologies: [] }] }. ONLY return JSON, no extra text.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(chatCompletion.choices[0].message.content);

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
  try {
    const { userData, targetRole } = req.body;

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "User data is required for initialization.",
      });
    }

    console.log("Generating initial portfolio code with Groq...");
    const groq = getGroqClient();
    
    const prompt = `
      You are a world-class frontend developer and UI/UX designer. 
      Generate a professional, modern, and highly aesthetic portfolio website based on this user data:
      ${JSON.stringify(userData)}
      
      Target Role: ${targetRole || 'Professional'}

      Requirements:
      1. Use modern CSS (Flexbox/Grid), elegant typography (Inter/Roboto), and premium dark mode aesthetics.
      2. The design should be responsive and include:
         - A hero section with a compelling headline.
         - An about section using the bio provided.
         - A skills section with visual icons or chips.
         - Experience and Projects sections that look premium.
         - Contact information.
      3. Use only vanilla HTML, CSS, and JS.
      4. Ensure the code is WELL-FORMATTED with proper indentation (2 spaces) and line breaks for readability. DO NOT return minified code.
      5. RETURN ONLY a JSON object with this exact structure:
         {
           "html": "...",
           "css": "...",
           "js": "..."
         }
      Do not include any Markdown formatting or extra text.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a master portfolio generator. You always return valid JSON containing well-formatted, indented html, css, and js fields. No markdown, no triple backticks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0].message.content;
    const generatedCode = JSON.parse(content);

    res.status(200).json({
      success: true,
      data: generatedCode,
    });
  } catch (error) {
    console.error("Initialization Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize portfolio code.",
      error: error.message,
    });
  }
};
