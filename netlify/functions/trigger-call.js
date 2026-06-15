// netlify/functions/trigger-call.js
// Triggers an ElevenLabs Conversational AI outbound call via Twilio when a lead submits the form.
// Environment variables required (set in Netlify Site Settings → Environment Variables):
//   ELEVENLABS_API_KEY
//   ELEVENLABS_AGENT_ID
//   ELEVENLABS_PHONE_NUMBER_ID

exports.handler = async function (event) {
    const CORS_HEADERS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Invalid JSON body' })
        };
    }

    const { name = '', phone: rawPhone } = body;

    // Validate phone presence
    if (!rawPhone || String(rawPhone).trim() === '') {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'phone is required' })
        };
    }

    // Normalize phone to E.164
    // Strip spaces, dashes, parentheses
    let phone = String(rawPhone).replace(/[\s\-()]/g, '');

    if (phone.startsWith('+')) {
        // Already has country code — leave as-is
    } else if (/^\d{10}$/.test(phone)) {
        // 10-digit Indian number — prefix +91
        phone = '+91' + phone;
    } else if (/^\d{12}$/.test(phone) && phone.startsWith('91')) {
        // 12-digit starting with 91 — just add +
        phone = '+' + phone;
    } else {
        // Best-effort: prefix +91 for any other digit-only number
        phone = '+91' + phone.replace(/\D/g, '');
    }

    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        const agentId = process.env.ELEVENLABS_AGENT_ID;
        const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID;

        const response = await fetch(
            'https://api.elevenlabs.io/v1/convai/twilio/outbound-call',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    agent_id: agentId,
                    agent_phone_number_id: phoneNumberId,
                    to_number: phone,
                    conversation_initiation_client_data: {
                        dynamic_variables: {
                            lead_name: name
                        }
                    }
                })
            }
        );

        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { raw: responseText };
        }

        console.log(`📞 AI call triggered | Name: ${name} | Phone: ${phone} | Status: ${response.status}`);

        return {
            statusCode: response.status,
            headers: CORS_HEADERS,
            body: JSON.stringify(responseData)
        };
    } catch (err) {
        console.error('trigger-call error:', err);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Internal server error', message: err.message })
        };
    }
};
