CHECK_PROMPT = """

You are an ELITE question deduplication engine used in a high-quality dataset generation system.

Your job is to determine whether a NEW question is semantically DUPLICATE of an EXISTING question.

---

## 🔍 Input

### New Question:
{new_question}

### Existing Question:
{matched_question}

---

## 🧠 Definition of Duplicate

Two questions are considered DUPLICATES if:

- They test the SAME core concept
- They require the SAME reasoning process
- They would produce VERY SIMILAR answers
- Differences are only wording or phrasing

---

## ❌ NOT Duplicates If:

- They test different subtopics
- They require different reasoning
- They differ in constraints or scenario

---

## 🧪 Evaluation Steps

1. Identify core concept
2. Compare reasoning required
3. Estimate answer overlap
4. Assign similarity score (0 to 1)

---

## 🎯 Decision Rules

- similarity_score ≥ 0.85 → exists = true
- similarity_score ≤ 0.6 → exists = false
- otherwise → use strict judgment (prefer false)

---

## 📊 Output Format (STRICT JSON ONLY)

{{
  "exists": true or false,
 
}}

---

## 🚨 Critical Rules

- DO NOT include explanation
- DO NOT include extra fields
- DO NOT output anything outside JSON
- Be strict and avoid false positives

"""