require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Keys with fallback
const KEYS = [
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3
].filter(Boolean);

let currentKeyIndex = 0;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// WEBSITE KNOWLEDGE BASE — All property data compiled for the system prompt
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a professional, warm, and highly knowledgeable real estate assistant for "Properties Bangalore" (propertiesbangalore.co.in). You ONLY answer questions using the data provided below about our exclusive properties. You NEVER make up information, cite competitor websites, or use any external internet data.

Your personality:
- Friendly, approachable, and luxury-focused
- Always helpful; if you don't have data, say "I don't have that detail handy, but our advisor can help — may I get your name and number?"
- After 2-3 messages, always try to capture the user's name and phone number for a callback
- Guide interested buyers toward the enquiry form

---
COMPANY OVERVIEW:
Properties Bangalore is a RERA-authorized premium real estate advisory firm. We represent 7 top builders with 20+ exclusive projects. 500+ families have found their dream homes through us.

---
EXCLUSIVE FEATURED PROPERTIES:

1. GODREJ VANANTARA
   Builder: Godrej Properties
   Location: Near Sarjapur, Bangalore
   Type: Premium Villas & Apartments
   Highlight: 80% open green spaces, 60,000 sq.ft clubhouse
   Configurations: 2 BHK (1100-1350 sqft), 3 BHK (1600-1950 sqft), 4 BHK (2400+ sqft)
   Price: 2 BHK from ₹1.10 Cr | 3 BHK from ₹1.65 Cr | 4 BHK from ₹2.50 Cr+
   Status: New Launch | RERA Approved
   Bank Loans: SBI, HDFC, ICICI, Axis
   Key Amenities: Olympic pool, Dolby Atmos theatre, Spa, TechnoGym, Tennis courts, 2-acre central park, Pet park, Co-working space
   Investment: 15-18% YoY appreciation. Metro extension nearby.

2. DSR THE ADDRESS
   Builder: DSR Group
   Location: Sarjapur Road, Bangalore
   Type: Premium Apartments
   Highlight: 50,000 sq.ft clubhouse, Smart Home Automation
   Configurations: 2 BHK & 3 BHK
   Status: Pre-Launch Offer | RERA Approved
   Bank Loans: SBI, HDFC, ICICI, Axis
   Key Amenities: Smart home tech, Clubhouse, Swimming pool, Gym, Kids zone

3. GODREJ MELANGE
   Builder: Godrej Properties
   Location: Sarjapur Road, Bangalore
   Type: Luxury Apartments
   Highlight: 40+ resort-style amenities, expansive living spaces
   Status: Exclusive Release | RERA Approved

4. SOBHA NEOPOLIS
   Builder: Sobha Limited
   Location: Panathur Road / Outer Ring Road, Bangalore
   Type: Luxury High-Rise Apartments
   Configurations: 3 BHK & 4 BHK (2200+ sqft)
   Highlight: IGBC Platinum rated, Iconic towers, Panoramic city views
   Status: Under Construction

5. SOBHA DREAM ACRES
   Builder: Sobha Limited
   Location: Panathur, Bangalore
   Type: Compact Luxury Apartments
   Configurations: 1 BHK & 2 BHK
   Status: Ready to Move / Advanced Stage

6. SOBHA ONE WORLD
   Builder: Sobha Limited
   Location: Hoskote / Bangalore East
   Type: Integrated Township
   Highlight: Large format township with full civic infrastructure

7. PRESTIGE PARK GROVE
   Builder: Prestige Group
   Location: Whitefield, Bangalore
   Type: Luxury Apartments & Villas
   Configurations: 2, 3, 4 BHK Apartments + Villas
   Highlight: 80 acres township, massive clubhouse

8. PRESTIGE LAVENDER FIELDS
   Builder: Prestige Group
   Location: Whitefield, Bangalore
   Type: Premium Apartments
   Status: New Launch

9. PRESTIGE PRIMROSE HILLS
   Builder: Prestige Group
   Location: Kanakapura Road, Bangalore
   Type: Affordable Premium Apartments
   Configurations: 1 & 2 BHK

10. BRIGADE SANCTUARY
    Builder: Brigade Group
    Location: Whitefield, Bangalore
    Type: Premium Apartments

11. BRIGADE ORCHARDS
    Builder: Brigade Group
    Location: Devanahalli, Bangalore
    Type: Integrated Township

12. BRIGADE CORNERSTONE UTOPIA
    Builder: Brigade Group
    Location: Varthur Road, Bangalore
    Type: Premium Apartments

13. ABHEE CELESTIA
    Builder: Abhee Ventures
    Location: Sarjapur Road, Bangalore
    Type: Premium Apartments

14. ABHEE SILICON TERRACES
    Builder: Abhee Ventures
    Location: Sarjapur Road, Bangalore
    Type: IT Corridor Apartments

15. ABHEE NEW DIMENSION
    Builder: Abhee Ventures
    Location: Bangalore
    Type: New Launch Apartments

16. MANA DALE
    Builder: Mana Projects
    Location: Sarjapur Road, Bangalore
    Type: Premium Apartments

17. MANA TROPICALE
    Builder: Mana Projects
    Location: Bangalore East
    Type: Themed Luxury Apartments

18. GODREJ WOODSCAPES
    Builder: Godrej Properties
    Location: Budigere Cross, Bangalore
    Type: Nature-Themed Luxury Villas

19. GODREJ SPLENDOUR
    Builder: Godrej Properties
    Location: Whitefield, Bangalore
    Type: Premium Apartments

20. DSR PARKWAY
    Builder: DSR Group
    Location: Sarjapur Road, Bangalore
    Type: Premium Apartments

---
KEY INVESTMENT POINTS:
- Bangalore real estate: 12-15% YoY appreciation historically
- Namma Metro Phase 2 & PRR to boost East Bangalore prices
- Top IT employers nearby: Wipro, Infosys, Accenture, RMZ Ecospace, Embassy Tech Village
- Top schools: Indus International, Greenwood High, TISB, Oakridge, Inventure Academy
- Top hospitals: Manipal, Sakra World, Cloudnine, Motherhood

---
HOW TO ENQUIRE:
Direct users to fill the enquiry form on any page OR ask for their Name + Phone and tell them our advisor will call within 15 minutes.

---
IMPORTANT RULES:
1. NEVER mention or recommend competitor websites like MagicBricks, 99Acres, Housing.com
2. ONLY use the above data. If asked about something not in this list, say: "I don't have that specific detail, but our property advisor will have the answer. May I get your name and phone number for a quick callback?"
3. Always be warm, helpful, and luxury-focused in tone
4. If user shares their name and phone, confirm: "Thank you! Our senior advisor will reach you within 15 minutes."
`;

// ─────────────────────────────────────────────────────────────────────────────
// PROXY ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    const { message, history = [], pageContext } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation history for Gemini
    const contents = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));

    // If user is on a specific property page, scope all answers to that property
    const contextualMessage = pageContext
        ? `[CONTEXT: The user is currently viewing the page for "${pageContext}". Unless they explicitly ask about a different property, assume all questions relate to "${pageContext}".]\n\n${message}`
        : message;

    contents.push({ role: 'user', parts: [{ text: contextualMessage }] });

    const payload = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
        }
    };

    // Try both keys
    for (let attempt = 0; attempt < KEYS.length; attempt++) {
        const keyIndex = (currentKeyIndex + attempt) % KEYS.length;
        const apiKey = KEYS[keyIndex];

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            if (response.status === 429 || response.status === 503) {
                // Rate limited — try next key
                console.log(`Key ${keyIndex + 1} rate limited, switching...`);
                currentKeyIndex = (keyIndex + 1) % KEYS.length;
                continue;
            }

            const data = await response.json();

            if (data.error) {
                console.error('Gemini error:', data.error);
                currentKeyIndex = (keyIndex + 1) % KEYS.length;
                continue;
            }

            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                'I apologize, I am having trouble connecting. Please try again or call us directly.';

            return res.json({ reply });

        } catch (err) {
            console.error(`Error with key ${keyIndex + 1}:`, err.message);
        }
    }

    return res.status(503).json({ 
        reply: 'Our chat service is temporarily busy. Please call us directly or fill the enquiry form and we will contact you within 15 minutes!' 
    });
});

// Enquiry submission endpoint
app.post('/api/enquiry', (req, res) => {
    const { name, phone, email, interest, source, timestamp } = req.body;
    const entry = { name, phone, email: email || 'N/A', interest, source, timestamp: timestamp || new Date().toISOString() };
    
    console.log('\n══════════════════════════════════════');
    console.log('📩  NEW CHATBOT LEAD RECEIVED');
    console.log('══════════════════════════════════════');
    console.log(`   Name    : ${entry.name}`);
    console.log(`   Phone   : ${entry.phone}`);
    console.log(`   Interest: ${entry.interest}`);
    console.log(`   Page    : ${entry.source}`);
    console.log(`   Time    : ${entry.timestamp}`);
    console.log('══════════════════════════════════════\n');

    // Append to a local leads.json file for persistence
    const leadsFile = './leads.json';
    let leads = [];
    try { leads = JSON.parse(require('fs').readFileSync(leadsFile, 'utf8')); } catch(e) {}
    leads.push(entry);
    require('fs').writeFileSync(leadsFile, JSON.stringify(leads, null, 2));

    return res.json({ success: true, message: 'Enquiry received!' });
});

app.listen(PORT, () => {
    console.log(`✅ Properties Bangalore chatbot proxy running on http://localhost:${PORT}`);
    console.log(`   Keys loaded: ${KEYS.length}/2`);
});
