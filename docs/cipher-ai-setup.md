# Connect Cipher to a free AI model

Cipher already works in **guided mode**: it reads the learner's SecurePlus progress, recommends the next weak area, explains Smart Review, and can launch a three-question repair sprint. The live chat field is also wired to a protected server endpoint, but it stays safely disabled until the environment variables below are added.

## Recommended beginner setup: Gemini free tier

1. Open [Google AI Studio](https://aistudio.google.com/) and create a Gemini API key.
2. In Vercel, open the SecurePlus project, then go to **Settings → Environment Variables**.
3. Add these three variables for Production, Preview, and Development:

   ```text
   CIPHER_AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
   CIPHER_AI_API_KEY=your_key_from_google_ai_studio
   CIPHER_AI_MODEL=gemini-3.5-flash
   ```

4. Redeploy the latest commit once. Open SecurePlus, sign in with a Supabase account, press **Ask Cipher**, and send a Security+ question.

Never add the API key to a variable beginning with `VITE_`. Vite variables are shipped to the browser and would expose the key. The existing SecurePlus endpoint keeps the key on the server.

The Gemini free tier can use submitted content to improve Google's products. SecurePlus currently sends only the learner's message and a small study summary—never their email, name, access token, or raw answer history—but the UI should continue reminding learners not to submit personal information.

## Before opening live AI to every user

Complete these in order:

1. **Add a daily message allowance.** Create a small Supabase usage table and allow, for example, 10 live AI messages per learner per day. This prevents one account from exhausting the free quota.
2. **Add feedback controls.** Put helpful/not-helpful buttons below replies so weak explanations can be found and improved.
3. **Ground Cipher in approved notes.** Store short, original SecurePlus concept notes and retrieve only the relevant notes for each answer. This reduces hallucinations without exposing the question bank or real exam material.
4. **Add a teacher escalation path.** Let Cipher say when it is uncertain and link the learner to the correct objective or a human-reviewed explanation.
5. **Review privacy and provider terms.** Decide whether free-tier data handling is acceptable before enabling live AI broadly. Move to a paid/no-training tier if learner privacy requirements increase.
6. **Monitor cost and quality.** Track request count, failures, response time, and feedback—but do not log access tokens, API keys, or unnecessary personal data.

## How the current foundation is protected

- A valid Supabase access token is checked on the server before every live AI request.
- The AI key stays in Vercel environment variables.
- Messages and context are length-limited and the model response is capped.
- Cipher is instructed to teach concepts and refuse exam dumps or guaranteed pass claims.
- The assistant route shares the existing consolidated API router, so it does not add another Vercel function slot.
- If no model is configured or the provider is unavailable, the UI falls back to guided actions instead of breaking.
