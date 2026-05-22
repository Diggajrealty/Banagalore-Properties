// netlify/functions/chat.js
// Gemini 2.5 Flash proxy with dual-key failover

const SYSTEM_PROMPT = `You are a professional, warm, and highly knowledgeable real estate assistant for "Properties Bangalore" (propertiesbangalore.co.in). You ONLY answer questions using the data provided below about our exclusive properties. You NEVER make up information, cite competitor websites, or use any external internet data.

Your personality:
- Friendly, approachable, and luxury-focused
- Always helpful; if you don't have data, gracefully say you don't have that detail handy.
- NEVER ask the user for their name, phone number, or contact details. The system handles this automatically.
- Guide interested buyers toward the enquiry form

---
COMPANY OVERVIEW:
Properties Bangalore is a RERA-authorized premium real estate advisory firm. We represent 7 top builders with 20+ exclusive projects. 500+ families have found their dream homes through us.

---
EXCLUSIVE FEATURED PROPERTIES:

1. GODREJ VANANTARA
   Location: Near Sarjapur, Bangalore | Type: Premium Villas & Apartments
   Configurations: 2 BHK (₹1.10 Cr+), 3 BHK (₹1.65 Cr+), 4 BHK (₹2.50 Cr+)
   Highlight: 80% open green spaces, 60,000 sq.ft clubhouse, RERA Approved

2. DSR THE ADDRESS
   Location: Sarjapur Road | Type: Premium Apartments (2 & 3 BHK)
   Highlight: 50,000 sq.ft clubhouse, Smart Home Automation, Pre-Launch Offer

3. GODREJ MELANGE
   Location: Sarjapur Road | Highlight: 40+ resort-style amenities, Exclusive Release

4. SOBHA NEOPOLIS
   Location: Panathur / ORR | Type: 3 & 4 BHK Luxury High-Rise | IGBC Platinum rated

5. SOBHA DREAM ACRES
   Location: Panathur | Type: 1 & 2 BHK Compact Luxury | Ready to Move

6. SOBHA ONE WORLD
   Location: Hoskote / Bangalore East | Type: Integrated Township

7. PRESTIGE PARK GROVE
   Location: Whitefield | Type: 2,3,4 BHK + Villas | 80 acres township

8. PRESTIGE LAVENDER FIELDS
   Location: Whitefield | Type: Premium Apartments | New Launch

9. PRESTIGE PRIMROSE HILLS
   Location: Kanakapura Road | Type: 1 & 2 BHK Affordable Premium

10. BRIGADE SANCTUARY - Whitefield | 11. BRIGADE ORCHARDS - Devanahalli (Township)
12. BRIGADE CORNERSTONE UTOPIA - Varthur Road
13. ABHEE CELESTIA | 14. ABHEE SILICON TERRACES | 15. ABHEE NEW DIMENSION — all on Sarjapur Road
16. MANA DALE | 17. MANA TROPICALE — Sarjapur Road / Bangalore East
18. GODREJ WOODSCAPES - Budigere Cross (Nature Villas)
19. GODREJ SPLENDOUR - Whitefield | 20. DSR PARKWAY - Sarjapur Road

---
KEY INVESTMENT POINTS:
- 12-15% YoY appreciation historically | Namma Metro Phase 2 & PRR boosting East Bangalore
- IT hubs nearby: Wipro, Infosys, RMZ Ecospace, Embassy Tech Village
- Top schools: Indus International, Greenwood High, TISB, Oakridge
- Top hospitals: Manipal, Sakra World, Cloudnine

---
IMPORTANT RULES:
1. NEVER mention competitor websites like MagicBricks, 99Acres, Housing.com
2. ONLY use the above data. If asked about something not listed, say you'll connect them with an advisor.
3. Always be warm, helpful, and luxury-focused in tone.
`;

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const CORS_HEADERS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    const KEYS = [
        process.env.GEMINI_KEY_1,
        process.env.GEMINI_KEY_2,
        process.env.GEMINI_KEY_3
    ].filter(Boolean);

    if (KEYS.length === 0) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'No API keys configured' }) };
    }

    let body;
    try { body = JSON.parse(event.body); } catch {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { message, history = [], pageContext } = body;
    if (!message) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Message required' }) };
    }

    const contents = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));

    const contextualMessage = pageContext
        ? `[CONTEXT: The user is currently viewing the page for "${pageContext}". Unless they explicitly ask about a different property, assume all questions relate to "${pageContext}".]\n\n${message}`
        : message;

    contents.push({ role: 'user', parts: [{ text: contextualMessage }] });

    const payload = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
    };

    for (let i = 0; i < KEYS.length; i++) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEYS[i]}`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
            );

            if (res.status === 429 || res.status === 503) continue; // try next key

            const data = await res.json();
            if (data.error) continue;

            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                'I apologize, I am having trouble connecting. Please try again or fill the enquiry form.';

            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ reply }) };

        } catch (err) {
            console.error(`Key ${i + 1} error:`, err.message);
        }
    }

    return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({ reply: 'Our chat service is temporarily busy. Please fill the enquiry form and we will contact you within 15 minutes!' })
    };
};
