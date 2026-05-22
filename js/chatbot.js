// ─────────────────────────────────────────────────────────────────────────────
// Properties Bangalore — AI Chatbot Widget (Gemini 2.5 Flash via proxy)
// ─────────────────────────────────────────────────────────────────────────────

// Smart URL — works both locally and on Netlify
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const PROXY_URL = IS_LOCAL ? 'http://localhost:3001/api/chat' : '/api/chat';
const ENQUIRY_URL = IS_LOCAL ? 'http://localhost:3001/api/enquiry' : '/api/enquiry';

let chatHistory = [];
let messageCount = 0;
let leadCaptured = false;

// ── Detect current property page from URL ────────────────────────────────────
function detectCurrentProperty() {
    const pathname = window.location.pathname;
    const match = pathname.match(/\/properties\/([^/]+)/);
    if (!match) return null;
    const slug = match[2];
    const propertyMap = {
        'godrej-vanantara':           'Godrej Vanantara',
        'godrej-melange':             'Godrej Melange',
        'godrej-woodscapes':          'Godrej Woodscapes',
        'godrej-splendour':           'Godrej Splendour',
        'dsr-the-address':            'DSR The Address',
        'dsr-parkway':                'DSR Parkway',
        'sobha-neopolis':             'Sobha Neopolis',
        'sobha-dream-acres':          'Sobha Dream Acres',
        'sobha-one-world':            'Sobha One World',
        'prestige-park-grove':        'Prestige Park Grove',
        'prestige-lavender-fields':   'Prestige Lavender Fields',
        'prestige-primrose-hills':    'Prestige Primrose Hills',
        'brigade-sanctuary':          'Brigade Sanctuary',
        'brigade-orchards':           'Brigade Orchards',
        'brigade-cornerstone-utopia': 'Brigade Cornerstone Utopia',
        'abhee-celestia':             'Abhee Celestia',
        'abhee-silicon-terraces':     'Abhee Silicon Terraces',
        'abhee-new-dimension':        'Abhee New Dimension',
        'mana-dale':                  'Mana Dale',
        'mana-tropicale':             'Mana Tropicale',
    };
    return propertyMap[slug] || null;
}

const CURRENT_PROPERTY = detectCurrentProperty();

// Conversational lead capture state machine
const LEAD_STATE = { NONE: 0, ASKING_NAME: 1, ASKING_PHONE: 2, DONE: 3 };
let leadState = LEAD_STATE.NONE;
let leadData = { name: '', phone: '' };

const QUICK_REPLIES = [
    '🏠 Show me 3 BHK options',
    '💰 What is the pricing?',
    '🏗️ Godrej properties',
    '📍 Sarjapur Road projects',
    '📞 Request a callback'
];

function createChatWidget() {
    const launcher = document.createElement('button');
    launcher.id = 'pb-chat-launcher';
    launcher.setAttribute('aria-label', 'Open AI Property Advisor');
    launcher.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        <div class="pb-notif"></div>
    `;

    const chatWindow = document.createElement('div');
    chatWindow.id = 'pb-chat-window';
    chatWindow.innerHTML = `
        <div class="pb-chat-header">
            <div class="pb-avatar">🏡</div>
            <div class="pb-chat-header-info">
                <h4>Your Personal Property Assistant</h4>
                <span>● Online now · Reply in seconds</span>
            </div>
            <button type="button" class="pb-close-btn" id="pb-close" aria-label="Close chat">✕</button>
        </div>
        <div class="pb-chat-messages" id="pb-messages"></div>
        <div class="pb-chat-footer">
            <textarea id="pb-input" placeholder="Ask about any property…" rows="1"></textarea>
            <button type="button" class="pb-send-btn" id="pb-send" aria-label="Send message">
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
        </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(chatWindow);

    // ── SPEECH BUBBLE TOOLTIP ────────────────────────────────────────────────
    const tooltip = document.createElement('div');
    tooltip.id = 'pb-chat-tooltip';
    tooltip.innerHTML = `
        <button type="button" class="pb-tooltip-close" id="pb-tooltip-close" aria-label="Close">✕</button>
        <p>💬 Try our AI Assistant!</p>
        <span>Get instant answers on pricing,<br>floor plans & availability.</span>
    `;
    document.body.appendChild(tooltip);

    document.getElementById('pb-tooltip-close').addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.remove('pb-tooltip-visible');
    });

    tooltip.addEventListener('click', () => {
        tooltip.classList.remove('pb-tooltip-visible');
        chatWindow.classList.add('pb-open');
        launcher.querySelector('.pb-notif').style.display = 'none';
        if (messageCount === 0) showWelcome();
    });

    launcher.addEventListener('click', () => {
        chatWindow.classList.toggle('pb-open');
        launcher.querySelector('.pb-notif').style.display = 'none';
        if (chatWindow.classList.contains('pb-open') && messageCount === 0) {
            showWelcome();
        }
    });

    document.getElementById('pb-close').addEventListener('click', () => {
        chatWindow.classList.remove('pb-open');
    });

    document.getElementById('pb-send').addEventListener('click', sendMessage);

    document.getElementById('pb-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    document.getElementById('pb-input').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 90) + 'px';
    });
}

function showWelcome() {
    let welcomeMsg;
    if (CURRENT_PROPERTY) {
        welcomeMsg = `Hi there! 👋 I'm your **Personal Property Assistant** for **Properties Bangalore**.

I can see you're exploring **${CURRENT_PROPERTY}** — great choice! I can answer any questions about pricing, floor plans, amenities, and availability for this project.

What would you like to know about **${CURRENT_PROPERTY}**?`;
    } else {
        welcomeMsg = `Hi there! 👋 I'm your **Personal Property Assistant** for **Properties Bangalore**.

I can help you find the perfect home from our 20+ exclusive luxury projects — Godrej, Prestige, Sobha, Brigade, and more!

What are you looking for today?`;
    }
    appendBotMessage(welcomeMsg, QUICK_REPLIES);
}

function appendBotMessage(text, quickReplies = []) {
    const messagesDiv = document.getElementById('pb-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'pb-msg bot';
    msgDiv.innerHTML = formatText(text);
    messagesDiv.appendChild(msgDiv);

    if (quickReplies.length > 0) {
        const qDiv = document.createElement('div');
        qDiv.className = 'pb-quick-btns';
        quickReplies.forEach(q => {
            const btn = document.createElement('button');
            btn.className = 'pb-quick-btn';
            btn.textContent = q;
            btn.addEventListener('click', () => {
                qDiv.remove();
                sendMessage(q);
            });
            qDiv.appendChild(btn);
        });
        messagesDiv.appendChild(qDiv);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    messageCount++;
}

function appendUserMessage(text) {
    const messagesDiv = document.getElementById('pb-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'pb-msg user';
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showTyping() {
    const messagesDiv = document.getElementById('pb-messages');
    const typing = document.createElement('div');
    typing.className = 'pb-typing';
    typing.id = 'pb-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById('pb-typing');
    if (t) t.remove();
}

// ── PROPERTY RECOMMENDATION AFTER LEAD CAPTURE ───────────────────────────────
const PROP_SLUG_MAP = {
    'Godrej Vanantara':            'godrej-vanantara',
    'Godrej Melange':              'godrej-melange',
    'Godrej Woodscapes':           'godrej-woodscapes',
    'Godrej Splendour':            'godrej-splendour',
    'DSR The Address':             'dsr-the-address',
    'DSR Parkway':                 'dsr-parkway',
    'Sobha Neopolis':              'sobha-neopolis',
    'Sobha Dream Acres':           'sobha-dream-acres',
    'Sobha One World':             'sobha-one-world',
    'Prestige Park Grove':         'prestige-park-grove',
    'Prestige Lavender Fields':    'prestige-lavender-fields',
    'Prestige Primrose Hills':     'prestige-primrose-hills',
    'Brigade Sanctuary':           'brigade-sanctuary',
    'Brigade Orchards':            'brigade-orchards',
    'Brigade Cornerstone Utopia':  'brigade-cornerstone-utopia',
    'Abhee Celestia':              'abhee-celestia',
    'Abhee Silicon Terraces':      'abhee-silicon-terraces',
    'Abhee New Dimension':         'abhee-new-dimension',
    'Mana Dale':                   'mana-dale',
    'Mana Tropicale':              'mana-tropicale',
};

function detectRecommendedProperty() {
    // First priority: the current page property
    if (CURRENT_PROPERTY && PROP_SLUG_MAP[CURRENT_PROPERTY]) {
        return { name: CURRENT_PROPERTY, slug: PROP_SLUG_MAP[CURRENT_PROPERTY] };
    }
    // Second priority: scan chat history for any mentioned property
    const allText = chatHistory.map(h => h.text).join(' ').toLowerCase();
    for (const [name, slug] of Object.entries(PROP_SLUG_MAP)) {
        if (allText.includes(name.toLowerCase())) {
            return { name, slug };
        }
    }
    return null;
}

function showPropertyCard({ name, slug }) {
    const messagesDiv = document.getElementById('pb-messages');
    const card = document.createElement('div');
    card.style.cssText = `
        background: linear-gradient(135deg, #1A1A2E, #2d2d50);
        border-radius: 14px; padding: 18px; margin-top: 4px;
        align-self: flex-start; max-width: 88%;
        animation: pb-msg-in 0.4s ease;
        border: 1px solid rgba(201,168,76,0.3);
    `;
    card.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
            <span style="font-size:1.5rem;">🏡</span>
            <div>
                <p style="color:#C9A84C; font-weight:700; font-size:0.9rem; margin:0; font-family:'DM Sans',sans-serif;">Recommended for you</p>
                <p style="color:white; font-weight:700; font-size:1rem; margin:0; font-family:'DM Sans',sans-serif;">${name}</p>
            </div>
        </div>
        <p style="color:rgba(255,255,255,0.65); font-size:0.82rem; margin:0 0 14px 0; font-family:'DM Sans',sans-serif; line-height:1.5;">
            Explore floor plans, pricing, amenities, and the EMI calculator on the dedicated project page.
        </p>
        <a href="/properties/${slug}/"
           style="
             display:block; text-align:center;
             background: linear-gradient(135deg, #C9A84C, #b59540);
             color: white; font-weight:700; font-size:0.88rem;
             padding: 11px 16px; border-radius: 8px;
             text-decoration: none; font-family:'DM Sans',sans-serif;
             transition: opacity 0.2s;
           "
           onmouseover="this.style.opacity='0.88'"
           onmouseout="this.style.opacity='1'"
        >
            View ${name} →
        </a>
    `;
    messagesDiv.appendChild(card);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


function startLeadCapture() {
    if (leadCaptured || leadState !== LEAD_STATE.NONE) return;
    leadState = LEAD_STATE.ASKING_NAME;
    appendBotMessage(`To connect you with our senior advisor and share **exclusive pricing & floor plans**, may I get your **name**? 😊`);
}

async function handleLeadCapture(userText) {
    if (leadState === LEAD_STATE.ASKING_NAME) {
        const cleaned = userText.trim();

        // Reject short/non-name responses
        const rejectionWords = ['no', 'nope', 'nah', 'yes', 'ok', 'okay', 'skip', 'later',
            'dont', "don't", 'nothing', 'none', 'na', 'n/a', 'not now', 'no thanks'];
        const isRejection = rejectionWords.some(w => cleaned.toLowerCase() === w);
        const isTooShort = cleaned.replace(/\s/g, '').length < 2;
        const hasNoLetters = !/[a-zA-Z]/.test(cleaned);

        if (isRejection || isTooShort || hasNoLetters) {
            appendBotMessage(`No worries! 😊 I just need a name to address you — even your first name works!\n\n**What should I call you?**`);
            return true;
        }

        leadData.name = cleaned;
        leadState = LEAD_STATE.ASKING_PHONE;
        appendBotMessage(`Thanks, **${leadData.name}**! 🙏\n\n**What's the best phone number to reach you on?**\n\n_(Our senior advisor will personally call you within 15 minutes.)_`);
        return true;
    }

    if (leadState === LEAD_STATE.ASKING_PHONE) {
        // Strip spaces, dashes, + and 91 prefix, then validate EXACTLY 10 digits starting 6-9
        const stripped = userText.replace(/[\s\-\+]/g, '').replace(/^91/, '');
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(stripped)) {
            appendBotMessage(`Please share a valid **10-digit Indian mobile number** starting with 6, 7, 8, or 9. 📱\n\n_(Example: 9876543210)_`);
            return true;
        }
        leadData.phone = stripped;
        leadState = LEAD_STATE.DONE;
        leadCaptured = true;

        // Submit lead to Netlify Forms (triggers email notification)
        try {
            const formData = new URLSearchParams();
            formData.append('form-name', 'chatbot-lead');
            formData.append('name', leadData.name);
            formData.append('phone', leadData.phone);
            formData.append('interest', CURRENT_PROPERTY || chatHistory.map(h => h.text).slice(-4).join(' | '));
            formData.append('source', window.location.href);
            formData.append('timestamp', new Date().toISOString());

            await fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
        } catch (e) {
            // Fallback to serverless function on local dev
            try {
                await fetch(ENQUIRY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: leadData.name,
                        phone: leadData.phone,
                        interest: CURRENT_PROPERTY || chatHistory.map(h => h.text).slice(-4).join(' | '),
                        source: window.location.href,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (e2) { /* silent fail */ }
        }




        // Confirmation message
        appendBotMessage(`✅ All set, **${leadData.name}**! Our senior advisor will call **+91 ${leadData.phone}** within the next **15 minutes** with the latest pricing and available inventory${CURRENT_PROPERTY ? ' for **' + CURRENT_PROPERTY + '**' : ''}. 🏡✨\n\nIs there anything else I can help you with?`);

        // Property recommendation card
        const recommendedProp = detectRecommendedProperty();
        if (recommendedProp) {
            setTimeout(() => showPropertyCard(recommendedProp), 800);
        }

        return true;
    }

    return false; // not in lead flow
}

async function sendMessage(overrideText = null) {
    // If called via click event, overrideText is an Event object, not a string
    if (overrideText && typeof overrideText !== 'string') {
        overrideText = null;
    }
    const input = document.getElementById('pb-input');
    const text = (overrideText || input.value).trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';

    appendUserMessage(text);

    // Check if we're in conversational lead capture mode
    if (leadState === LEAD_STATE.ASKING_NAME || leadState === LEAD_STATE.ASKING_PHONE) {
        await handleLeadCapture(text);
        return;
    }

    // Check if user explicitly typed "callback" or "call me"
    const callbackTriggers = ['callback', 'call me', 'contact me', 'reach me', 'enquiry', 'book', '📞'];
    if (callbackTriggers.some(t => text.toLowerCase().includes(t)) && !leadCaptured) {
        startLeadCapture();
        return;
    }

    // Track which property is being discussed from conversation + page
    // Scan new message + history for any property mentions
    let activeProperty = CURRENT_PROPERTY;
    if (!activeProperty) {
        const allText = (chatHistory.map(h => h.text).join(' ') + ' ' + text).toLowerCase();
        for (const [name] of Object.entries(PROP_SLUG_MAP)) {
            if (allText.includes(name.toLowerCase())) {
                activeProperty = name;
                break;
            }
        }
    }

    chatHistory.push({ role: 'user', text });

    // Trigger lead capture after 2 bot responses
    if (messageCount >= 2 && !leadCaptured && leadState === LEAD_STATE.NONE) {
        showTyping();
        setTimeout(() => { hideTyping(); startLeadCapture(); }, 600);
        return;
    }

    showTyping();

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                history: chatHistory.slice(-10),
                pageContext: activeProperty   // always scoped — page or conversation
            })
        });

        const data = await response.json();
        hideTyping();

        const reply = data.reply || "I'm having trouble connecting. Please try again!";
        chatHistory.push({ role: 'model', text: reply });

        const quickReplies = messageCount <= 1 ? QUICK_REPLIES : [];
        appendBotMessage(reply, quickReplies);

    } catch (err) {
        hideTyping();
        appendBotMessage("⚠️ I'm temporarily unavailable. Please try again in a moment!");
    }
}

function formatText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

// ── INITIALIZE ────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
} else {
    createChatWidget();
}

// Show tooltip after 2.5s, then auto-dismiss after 8s
setTimeout(() => {
    const tooltip = document.getElementById('pb-chat-tooltip');
    if (tooltip) {
        tooltip.classList.add('pb-tooltip-visible');
        // Auto-dismiss after 8 seconds
        setTimeout(() => tooltip.classList.remove('pb-tooltip-visible'), 8000);
    }
}, 2500);

// Hide tooltip when chat is opened via launcher
document.addEventListener('click', (e) => {
    if (e.target.closest('#pb-chat-launcher')) {
        const tooltip = document.getElementById('pb-chat-tooltip');
        if (tooltip) tooltip.classList.remove('pb-tooltip-visible');
    }
});
