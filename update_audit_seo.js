const fs = require('fs');
let content = fs.readFileSync('audit_v1.md', 'utf8');

const additionalText = " Ensure to refer to the specific page context/topic for keywords and include relevant long-tail keywords as well.";

content = content.replace(
    /(- \[ \] \*\*SEO Optimization.*?\*\* Improve keyword density and naturally integrate targeted search terms to boost organic visibility for the DSR The Address page\.)/g, 
    `$1${additionalText}`
);

content = content.replace(
    /(- \[ \] \*\*SEO Optimization:\*\* Improve keyword density and naturally integrate targeted search terms to boost organic visibility across all 3 project pages\.)/g, 
    `$1${additionalText}`
);

content = content.replace(
    /(- \[ \] \*\*SEO Optimization:\*\* Improve keyword density and naturally integrate targeted search terms to boost organic visibility across all 4 project pages\.)/g, 
    `$1${additionalText}`
);

content = content.replace(
    /(- \[ \] \*\*SEO Optimization:\*\* Improve keyword density and naturally integrate targeted search terms to boost organic visibility across both project pages\.)/g, 
    `$1${additionalText}`
);

fs.writeFileSync('audit_v1.md', content);
console.log('Appended SEO instructions');
