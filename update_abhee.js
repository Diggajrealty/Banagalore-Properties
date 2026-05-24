const fs = require('fs');

const updates = [
    {
        file: 'abhee-ventures/abhee-celestial-city/index.html',
        title: 'Abhee Celestial City | Floor Plans, Pricing, Master Plan & Reviews',
        desc: 'Explore Abhee Celestial City in Bangalore. Discover ultra-luxury residential high-rise apartments, sky gardens, exact pricing, master plan, and reviews.',
        keywords: 'abhee celestial city, abhee celestial city bangalore, abhee celestial city floor plan, abhee celestial city price, abhee celestial city reviews, luxury high rise apartments, abhee ventures new launch',
        imgName: 'abhee_celestial_city.png'
    },
    {
        file: 'abhee-ventures/abhee-silicon-shine/index.html',
        title: 'Abhee Silicon Shine | Floor Plans, Pricing, Master Plan & Reviews',
        desc: 'Explore Abhee Silicon Shine on Sarjapur Road, Bangalore. Discover modern IT-corridor luxury apartments, detailed floor plans, pricing, master plan, and reviews.',
        keywords: 'abhee silicon shine, abhee silicon shine sarjapur road, abhee silicon shine bangalore, abhee silicon shine floor plan, abhee silicon shine price, abhee silicon shine reviews, luxury apartments near IT corridor, abhee ventures',
        imgName: 'abhee_silicon_shine.png'
    },
    {
        file: 'abhee-ventures/abhee-new-dimension/index.html',
        title: 'Abhee New Dimension | Floor Plans, Pricing, Master Plan & Reviews',
        desc: 'Explore Abhee New Dimension in Bangalore. Discover futuristic luxury residential apartments, vertical forests, exact pricing, master plan, and reviews.',
        keywords: 'abhee new dimension, abhee new dimension bangalore, abhee new dimension floor plan, abhee new dimension price, abhee new dimension reviews, futuristic apartments bangalore, vertical forest apartments, abhee ventures',
        imgName: 'abhee_new_dimension.png'
    }
];

updates.forEach(u => {
    if (!fs.existsSync(u.file)) {
        console.log(`File not found: ${u.file}`);
        return;
    }
    let content = fs.readFileSync(u.file, 'utf8');

    // Update Title
    content = content.replace(/<title>.*?<\/title>/, `<title>${u.title}</title>`);

    // Update Description & Keywords
    content = content.replace(
        /<meta name="description".*?>/, 
        `<meta name="description" content="${u.desc}">\n    <meta name="keywords" content="${u.keywords}">`
    );

    // Update Hero Image
    content = content.replace(/url\('\.\.\/\.\.\/images\/hero-bg\.jpg'\)/g, `url('../../images/${u.imgName}')`);
    content = content.replace(/"https:\/\/propertiesbangalore\.co\.in\/images\/hero-bg\.jpg"/g, `"https://propertiesbangalore.co.in/images/${u.imgName}"`);

    fs.writeFileSync(u.file, content);
    console.log(`Updated: ${u.file}`);
});
