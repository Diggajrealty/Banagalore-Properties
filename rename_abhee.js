const fs = require('fs');
const path = require('path');

const renameMap = [
    {
        oldName: 'Abhee Celestial City',
        newName: 'Abhee Celestial Cityl City',
        oldSlug: 'abhee-celestial-city',
        newSlug: 'abhee-celestial-cityl-city',
        builder: 'abhee-ventures'
    },
    {
        oldName: 'Abhee Silicon Shine',
        newName: 'Abhee Silicon Shine',
        oldSlug: 'abhee-silicon-shine',
        newSlug: 'abhee-silicon-shine',
        builder: 'abhee-ventures'
    }
];

// 1. Move directories
renameMap.forEach(item => {
    const oldDir = path.join('.', item.builder, item.oldSlug);
    const newDir = path.join('.', item.builder, item.newSlug);
    if (fs.existsSync(oldDir)) {
        fs.renameSync(oldDir, newDir);
        console.log(`Renamed directory: ${oldDir} -> ${newDir}`);
    }
});

// 2. Update files content
function walkDir(dir, cb) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walkDir(full, cb);
        else cb(full);
    });
}

let updatedFiles = 0;
walkDir('.', filePath => {
    if (filePath.includes('node_modules') || filePath.includes('.git')) return;
    if (!filePath.endsWith('.html') && !filePath.endsWith('.js') && !filePath.endsWith('.toml')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    renameMap.forEach(item => {
        // Update URL slugs
        const oldLinkPattern = new RegExp(item.oldSlug, 'g');
        if (oldLinkPattern.test(content)) {
            content = content.replace(oldLinkPattern, item.newSlug);
            changed = true;
        }

        // Update plain text names
        const oldNamePattern = new RegExp(item.oldName, 'g');
        if (oldNamePattern.test(content)) {
            content = content.replace(oldNamePattern, item.newName);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        updatedFiles++;
        console.log(`Updated content in: ${filePath}`);
    }
});

console.log(`Finished updating ${updatedFiles} files.`);
