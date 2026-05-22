// add_form_js.js
// Adds the form.js script tag to all property pages that are missing it

const fs = require('fs');
const path = require('path');

function walkDir(dir, cb) {
    fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walkDir(full, cb);
        else cb(full);
    });
}

let added = 0, skipped = 0;

walkDir('./properties', filePath => {
    if (!filePath.endsWith('.html')) return;

    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('form.js')) {
        skipped++;
        return;
    }

    // Add form.js before chatbot.js script tag
    content = content.replace(
        '<script src="../../js/chatbot.js">',
        '<script src="../../js/form.js"></script>\n<script src="../../js/chatbot.js">'
    );

    // Also fix sidebar form button — add type="submit" explicitly so it works
    content = content.replace(
        /<button class="btn btn-primary">Request Details Instantly<\/button>/g,
        '<button type="submit" class="btn btn-primary">Request Details Instantly</button>'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    added++;
});

console.log(`✅ Added form.js to ${added} property pages`);
console.log(`⏭️  Skipped ${skipped} pages (already had form.js)`);
