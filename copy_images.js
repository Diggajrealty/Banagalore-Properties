const fs = require('fs');

fs.copyFileSync(
    'C:\\Users\\vansh\\.gemini\\antigravity\\brain\\1355da0e-26e6-4caf-8b7a-0abafaf067b1\\abhee_celestial_city_1779519990727.png',
    'images\\abhee_celestial_city.png'
);
fs.copyFileSync(
    'C:\\Users\\vansh\\.gemini\\antigravity\\brain\\1355da0e-26e6-4caf-8b7a-0abafaf067b1\\abhee_silicon_shine_1779520019670.png',
    'images\\abhee_silicon_shine.png'
);
fs.copyFileSync(
    'C:\\Users\\vansh\\.gemini\\antigravity\\brain\\1355da0e-26e6-4caf-8b7a-0abafaf067b1\\abhee_new_dimension_1779520044686.png',
    'images\\abhee_new_dimension.png'
);

console.log('Images copied successfully.');
