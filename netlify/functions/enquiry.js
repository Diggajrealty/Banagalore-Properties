// netlify/functions/enquiry.js
// Saves lead data to Netlify — logs it and forwards via Netlify form submission

exports.handler = async function(event) {
    const CORS_HEADERS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
    }

    let body;
    try { body = JSON.parse(event.body); } catch {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { name, phone, interest, source, timestamp } = body;

    // Log to Netlify function logs (visible in Netlify dashboard > Functions tab)
    console.log('══════════════════════════════════════');
    console.log('📩  NEW CHATBOT LEAD');
    console.log(`   Name    : ${name}`);
    console.log(`   Phone   : ${phone}`);
    console.log(`   Interest: ${interest}`);
    console.log(`   Page    : ${source}`);
    console.log(`   Time    : ${timestamp || new Date().toISOString()}`);
    console.log('══════════════════════════════════════');

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, message: 'Lead received!' })
    };
};
