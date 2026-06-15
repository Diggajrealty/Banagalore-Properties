# Netlify Functions

## trigger-call.js

Triggers an **ElevenLabs Conversational AI** outbound phone call via Twilio whenever a lead submits the homepage hero form on `index.html`.

### Required Environment Variables

Set these in **Netlify Dashboard → Site Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key |
| `ELEVENLABS_AGENT_ID` | The Conversational AI agent ID |
| `ELEVENLABS_PHONE_NUMBER_ID` | The Twilio phone number ID registered in ElevenLabs |

### How it works

- The homepage hero form calls `submitHomepageEnquiry()` (an inline wrapper in `index.html`)
- That wrapper calls the existing `submitEnquiry()` function unchanged (Netlify Forms + success message)
- After that, it fires a **background `fetch`** to `/.netlify/functions/trigger-call` with `{ name, phone }`
- If the call trigger fails for any reason, it fails silently — zero impact on the user experience

### Phone normalisation

- 10-digit numbers → prefixed with `+91`
- Numbers already starting with `+` → left as-is
- Spaces, dashes, and parentheses are stripped before processing

---

## enquiry.js

Logs chatbot leads to Netlify function logs (visible in Netlify Dashboard → Functions tab).

## chat.js

Handles the chatbot conversation flow.
