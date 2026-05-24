const fs = require('fs');

fs.copyFileSync(
    'C:\\Users\\vansh\\.gemini\\antigravity\\brain\\1355da0e-26e6-4caf-8b7a-0abafaf067b1\\godrej_melange_1779521564532.png',
    'images\\godrej_melange.png'
);
fs.copyFileSync(
    'C:\\Users\\vansh\\.gemini\\antigravity\\brain\\1355da0e-26e6-4caf-8b7a-0abafaf067b1\\godrej_splendour_1779521579557.png',
    'images\\godrej_splendour.png'
);
fs.copyFileSync(
    'C:\\Users\\vansh\\.gemini\\antigravity\\brain\\1355da0e-26e6-4caf-8b7a-0abafaf067b1\\godrej_vanantara_1779521595600.png',
    'images\\godrej_vanantara.png'
);
fs.copyFileSync(
    'C:\\Users\\vansh\\.gemini\\antigravity\\brain\\1355da0e-26e6-4caf-8b7a-0abafaf067b1\\godrej_woodscapes_1779521616938.png',
    'images\\godrej_woodscapes.png'
);

console.log('Godrej Images copied successfully.');
