// migrate_url_structure.js
// Migrates property pages from /properties/slug/ to /builder/slug/
// No redirects needed — site is not yet live.

const fs = require('fs');
const path = require('path');

const BASE_DOMAIN = 'https://propertiesbangalore.co.in';

const PROPERTY_BUILDER_MAP = {
    'godrej-vanantara':            'godrej-properties',
    'godrej-melange':              'godrej-properties',
    'godrej-woodscapes':           'godrej-properties',
    'godrej-splendour':            'godrej-properties',
    'dsr-the-address':             'dsr-group',
    'dsr-parkway':                 'dsr-group',
    'sobha-neopolis':              'sobha-limited',
    'sobha-dream-acres':           'sobha-limited',
    'sobha-one-world':             'sobha-limited',
    'prestige-park-grove':         'prestige-group',
    'prestige-lavender-fields':    'prestige-group',
    'prestige-primrose-hills':     'prestige-group',
    'brigade-sanctuary':           'brigade-group',
    'brigade-orchards':            'brigade-group',
    'brigade-cornerstone-utopia':  'brigade-group',
    'abhee-celestial-city':              'abhee-ventures',
    'abhee-silicon-shine':      'abhee-ventures',
    'abhee-new-dimension':         'abhee-ventures',
    'mana-dale':                   'mana-projects',
    'mana-tropicale':              'mana-projects',
};

// ── STEP 1: Move property pages to new builder-based paths ────────────────────
console.log('\n📁 STEP 1: Moving property pages to new locations...\n');

for (const [slug, builder] of Object.entries(PROPERTY_BUILDER_MAP)) {
    const oldDir  = path.join('.', 'properties', slug);
    const newDir  = path.join('.', builder, slug);
    const oldFile = path.join(oldDir, 'index.html');
    const newFile = path.join(newDir, 'index.html');

    if (!fs.existsSync(oldFile)) {
        console.log(`  ⚠️  Skipping (not found): ${oldFile}`);
        continue;
    }

    // Create new builder/slug directory
    fs.mkdirSync(newDir, { recursive: true });

    let content = fs.readFileSync(oldFile, 'utf8');

    // Update canonical URL
    const newCanonical = `${BASE_DOMAIN}/${builder}/${slug}/`;
    content = content.replace(
        /<link rel="canonical" href="[^"]*">/g,
        `<link rel="canonical" href="${newCanonical}">`
    );

    // Update og:url
    content = content.replace(
        /<meta property="og:url" content="[^"]*">/g,
        `<meta property="og:url" content="${newCanonical}">`
    );

    fs.writeFileSync(newFile, content, 'utf8');

    // Delete the old directory
    fs.rmSync(oldDir, { recursive: true, force: true });

    console.log(`  ✅ /properties/${slug}/ → /${builder}/${slug}/`);
}

// ── STEP 2: Update ALL internal links across the entire site ─────────────────
console.log('\n🔗 STEP 2: Updating all internal links in HTML files...\n');

function walkDir(dir, cb) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walkDir(full, cb);
        else cb(full);
    });
}

let linksUpdated = 0;
walkDir('.', filePath => {
    if (!filePath.endsWith('.html') || filePath.includes('node_modules')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [slug, builder] of Object.entries(PROPERTY_BUILDER_MAP)) {
        const oldLink = `/properties/${slug}/`;
        const newLink = `/${builder}/${slug}/`;
        if (content.includes(oldLink)) {
            content = content.split(oldLink).join(newLink);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        linksUpdated++;
        console.log(`  ✅ ${path.relative('.', filePath)}`);
    }
});

// ── STEP 3: Update chatbot.js URL detection ───────────────────────────────────
console.log('\n🤖 STEP 3: Updating chatbot.js URL detection...\n');

const chatbotPath = path.join('.', 'js', 'chatbot.js');
let chatbot = fs.readFileSync(chatbotPath, 'utf8');

// Old: matches /properties/slug/
// New: match the last two path segments /builder/slug/
chatbot = chatbot.replace(
    /const match = pathname\.match\(\/\\\/properties\\\/\(\[^\/\]\+\)\/\);/,
    `const match = pathname.match(/\\/([^\\/]+)\\/([^\\/]+)\\/?$/);`
);
chatbot = chatbot.replace(
    /if \(!match\) return null;\s*const slug = match\[1\];/,
    `if (!match) return null;\n    const slug = match[2];`
);

fs.writeFileSync(chatbotPath, chatbot, 'utf8');
console.log('  ✅ chatbot.js detectCurrentProperty() updated');

// ── STEP 4: Update PROP_SLUG_MAP links in chatbot.js ─────────────────────────
// (Slug keys stay the same — the map is slug→slug, not slug→path, so no change needed)

console.log('\n🎉 Migration complete!');
console.log(`   • Moved ${Object.keys(PROPERTY_BUILDER_MAP).length} property pages`);
console.log(`   • Updated internal links in ${linksUpdated} HTML files`);
console.log(`   • Updated chatbot.js URL detection\n`);
