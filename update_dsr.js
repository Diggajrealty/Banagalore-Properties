const fs = require('fs');
const filePath = 'dsr-group/dsr-the-address/index.html';
let content = fs.readFileSync(filePath, 'utf8');

// Replace Title
content = content.replace(
    /<title>.*?<\/title>/, 
    '<title>DSR The Address Sarjapur Road | Floor Plans, Price, Master Plan & Reviews</title>'
);

// Replace Description and Add Keywords
content = content.replace(
    /<meta name="description".*?>/, 
    '<meta name="description" content="Explore DSR The Address on Sarjapur Road, Bangalore. Discover luxury 2, 3 & 4 BHK apartments, detailed floor plans, exact pricing, master plan, and reviews for this premium RERA approved project by DSR Group.">\n    <meta name="keywords" content="dsr the address, dsr the address sarjapur road, dsr the address bangalore, dsr the address floor plan, dsr the address price, dsr the address reviews, dsr the address master plan, luxury apartments sarjapur road, dsr group bangalore, 2 bhk flats sarjapur road, 3 bhk premium apartments sarjapur, under construction properties sarjapur road">'
);

// Replace Hero Image URL (lines 12 and 59)
content = content.replace(/url\('\.\.\/\.\.\/images\/hero-bg\.jpg'\)/g, "url('../../images/dsr_the_address_exterior.png')");
content = content.replace(/"https:\/\/propertiesbangalore\.co\.in\/images\/hero-bg\.jpg"/g, '"https://propertiesbangalore.co.in/images/dsr_the_address_exterior.png"');

fs.writeFileSync(filePath, content);
console.log('Successfully updated DSR The Address SEO and Image.');
