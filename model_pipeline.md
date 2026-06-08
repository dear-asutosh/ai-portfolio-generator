# 🧠 AI Model Pipeline — Profilio

```mermaid
flowchart TD
    START(["🚀 Generation Request"])

    START --> S1

    %% ── STAGE 1 ──────────────────────────────────────────────────────────
    subgraph S1["Stage 1 — Blueprint Planner"]
        M1A["① openrouter/auto"]
        M1B["② openrouter/free"]
        M1C["③ GLM-4.5 Air\nZ.AI"]
        M1D["④ Gemma 4 31B\nGoogle"]
        M1E["⑤ Kimi K2.6\nMoonshot AI"]
        M1A -->|fail| M1B -->|fail| M1C -->|fail| M1D -->|fail| M1E
    end

    %% ── STAGE 2 ──────────────────────────────────────────────────────────
    subgraph S2["Stage 2 — HTML Architect"]
        M2A["① Qwen3 Coder\nAlibaba"]
        M2B["② openrouter/free"]
        M2C["③ LLaMA 3.3 70B\nMeta"]
        M2D["④ GLM-4.5 Air\nZ.AI"]
        M2E["⑤ openrouter/auto"]
        M2A -->|fail| M2B -->|fail| M2C -->|fail| M2D -->|fail| M2E
    end

    %% ── STAGE 3 ──────────────────────────────────────────────────────────
    subgraph S3["Stage 3 — Visual Designer (CSS)"]
        M3A["① Nemotron 3 Super 120B\nNVIDIA"]
        M3B["② openrouter/free"]
        M3C["③ GLM-4.5 Air\nZ.AI"]
        M3D["④ Gemma 4 31B\nGoogle"]
        M3E["⑤ openrouter/auto"]
        M3A -->|fail| M3B -->|fail| M3C -->|fail| M3D -->|fail| M3E
    end

    %% ── STAGE 4 ──────────────────────────────────────────────────────────
    subgraph S4["Stage 4 — Interaction Engineer (JS)"]
        M4A["① Qwen3 Coder\nAlibaba"]
        M4B["② openrouter/free"]
        M4C["③ LLaMA 3.3 70B\nMeta"]
        M4D["④ Nemotron 3 Super 120B\nNVIDIA"]
        M4E["⑤ openrouter/auto"]
        M4A -->|fail| M4B -->|fail| M4C -->|fail| M4D -->|fail| M4E
    end

    %% ── GROQ FALLBACK ────────────────────────────────────────────────────
    subgraph GROQ["⚡ Groq — Ultimate Fallback (all stages)"]
        G1["① LLaMA 3.3 70B Versatile"]
        G2["② Mixtral 8x7B\nMistral"]
        G3["③ LLaMA 3.1 8B Instant"]
        G1 -->|fail| G2 -->|fail| G3
    end

    %% ── STAGE FLOW ───────────────────────────────────────────────────────
    S1 --> S2 --> S3 --> S4
    M1E -->|"all fail"| GROQ
    M2E -->|"all fail"| GROQ
    M3E -->|"all fail"| GROQ
    M4E -->|"all fail"| GROQ

    S4 --> DONE(["✅ Portfolio Generated"])

    %% ── STYLES ───────────────────────────────────────────────────────────
    classDef stage1 fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff
    classDef stage2 fill:#0f2a1e,stroke:#34d399,stroke-width:2px,color:#d1fae5
    classDef stage3 fill:#1a0f2e,stroke:#c084fc,stroke-width:2px,color:#f3e8ff
    classDef stage4 fill:#1c1008,stroke:#fbbf24,stroke-width:2px,color:#fef3c7
    classDef groq fill:#2d0a0a,stroke:#f87171,stroke-width:2px,color:#fee2e2
    classDef terminal fill:#0f172a,stroke:#94a3b8,stroke-width:2px,color:#f1f5f9

    class S1,M1A,M1B,M1C,M1D,M1E stage1
    class S2,M2A,M2B,M2C,M2D,M2E stage2
    class S3,M3A,M3B,M3C,M3D,M3E stage3
    class S4,M4A,M4B,M4C,M4D,M4E stage4
    class GROQ,G1,G2,G3 groq
    class START,DONE terminal
```

> **How it works:** Each stage tries its models top-to-bottom. On a rate-limit or error, the next model is attempted automatically. If all OpenRouter options are exhausted, Groq takes over as the ultimate fallback — ensuring zero downtime.
