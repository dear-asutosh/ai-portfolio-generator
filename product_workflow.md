# Profilio | Product Feature Workflow Diagram

This document presents a structured workflow illustrating how Profilio's core value propositions are powered under the hood by our codebase architecture.

---

## E2E Feature Workflow Diagram

```mermaid
graph TD
    %% Style Definitions
    classDef default fill:#111216,stroke:#2a2a2e,stroke-width:1.5px,color:#e2e8f0;
    classDef input fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#60a5fa;
    classDef ai fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#c7d2fe;
    classDef compile fill:#1c1917,stroke:#d97706,stroke-width:2px,color:#fde047;
    classDef custom fill:#062016,stroke:#10b981,stroke-width:2px,color:#a7f3d0;
    classDef deploy fill:#1e131d,stroke:#db2777,stroke-width:2px,color:#fbcfe8;

    %% 1. Automated Portfolio Generation
    subgraph Input ["1. Automated Portfolio Generation"]
        A["User Input / Details"]:::input
        B["PDF Resume Upload"]:::input
        C["GitHub API stats"]:::input
        D["LeetCode API stats"]:::input
        
        A --> E["Data Aggregation Service"]
        B --> E
        C --> E
        D --> E
    end

    %% 2. AI-Enhanced Content
    subgraph AI ["2. AI-Enhanced Content"]
        E --> F["AI Blueprint Generator"]:::ai
        F --> G["OpenRouter Fallback Chain"]:::ai
        G --> H["Structured Content & Copywriting"]:::ai
    end

    %% 3. Responsive Design
    subgraph Compiler ["3. Responsive Design & Styling"]
        H --> I["Profilio V1 Compiler"]:::compile
        I --> J["Tailwind JIT CDN Injection"]:::compile
        I --> K["Devicon & FontAwesome Icons"]:::compile
        I --> L["Custom Premium CSS & Glassmorphism"]:::compile
        
        J & K & L --> M["Assembled HTML Preview Document"]:::compile
    end

    %% 4. Easy Customization
    subgraph Dashboard ["4. Easy Customization"]
        M --> N["Iframe Sandbox Preview"]:::custom
        N --> O["AI Chat Dashboard Assistant"]:::custom
        O --> P["modifyPortfolioCode - AI code edits"]:::custom
        O --> Q["regenerateSection - Splices target HTML"]:::custom
        P & Q --> N
    end

    %% 5. Instant Deployment
    subgraph Deploy ["5. Instant Deployment"]
        N --> R["Publish Live Status"]:::deploy
        R --> S["Hosted under public vanity slug"]:::deploy
        R --> T["Clean Code Export (HTML, CSS, JS)"]:::deploy
        S --> U["Real-time Views & Analytics Tracker"]:::deploy
    end
```

---

## Detailed Mapping: Features to Codebase Components

| Feature | Backend Component / File | Description |
| :--- | :--- | :--- |
| **1. Automated Portfolio Generation** | [developerDataService.js](file:///d:/My%20Projects/AI%20Based%20Portfolio%20Generator/server/services/developerDataService.js) & `parseResume` | Aggregates developer data by combining profile details with parallel live stats fetches (GitHub repositories, LeetCode status) and parsing uploaded PDF resumes. |
| **2. AI-Enhanced Content** | [aiController.js](file:///d:/My%20Projects/AI%20Based%20Portfolio%20Generator/server/controllers/aiController.js) | Leverages LLMs (via OpenRouter fallback sequence) to construct a portfolio blueprint, write tailored copy, list skills, and suggest improvements. |
| **3. Responsive Design** | [codeGenPipeline.js](file:///d:/My%20Projects/AI%20Based%20Portfolio%20Generator/server/controllers/codeGenPipeline.js) & [assemblePortfolio.js](file:///d:/My%20Projects/AI%20Based%20Portfolio%20Generator/server/controllers/assemblePortfolio.js) | Compiles HTML, Custom CSS, and JS. Injects FontAwesome, Devicons, Tailwind JIT CDN, and custom animations/scrollbar styles to ensure the page is responsive and modern. |
| **4. Easy Customization** | `modifyPortfolioCode` & `regenerateSection` | Allows users to customize the design or structure. Features include an interactive AI chat interface for code revisions and a precise regex-splicer (`spliceSectionHtml`) that regenerates specific sections without affecting the rest of the site. |
| **5. Instant Deployment** | [projectController.js](file:///d:/My%20Projects/AI%20Based%20Portfolio%20Generator/server/controllers/projectController.js) | Toggles the project to `"Live"` status, making it instantly served via the platform's public vanity routes. Tracks real-time page views and allows download/export of clean, dependency-free HTML/CSS/JS source files. |
