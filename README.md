MVP of SIH

# ⚖️ LegalMetrologyCheck

### AI-Powered Packaged Commodity Compliance & Inspection System

> An AI-assisted system that scans packaged product labels, extracts mandatory declarations, and checks them against applicable requirements under the Legal Metrology (Packaged Commodities) Rules, 2011.

---

## 📌 Problem Statement

**Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.**

Manual inspection of packaged commodities requires checking multiple declarations on product labels. This process can be time-consuming and may lead to human oversight.

**LegalMetrologyCheck** aims to assist inspectors by automatically scanning product labels, extracting important information, and performing preliminary compliance checks using AI and a rule-based legal validation engine.

---

## 💡 Proposed Solution

LegalMetrologyCheck combines **Computer Vision, OCR, NLP, Machine Learning, and a deterministic Rule Engine** to analyze packaged commodity labels.

### Workflow

```text
📷 Scan / Upload Product
          ↓
🔧 Image Preprocessing
          ↓
🔍 OCR + Computer Vision
          ↓
🧠 Information Extraction
          ↓
🏷️ Product Classification
          ↓
⚖️ Legal Metrology Rule Engine
          ↓
🚦 Compliance Assessment
          ↓
🔎 Evidence & Explanation
          ↓
📄 Inspection Report

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


Author - TEAM DIVERGENTS 
