#!/usr/bin/env node

/**
 * Banner Upload Script
 * Uploads hero and secondary banners from public/assets
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const https = require('https');

const API_BASE_URL = 'https://linceecom-production.up.railway.app/api/v1';

// You'll need to provide a valid token - for now we'll prompt for it
const TOKEN = process.env.AUTH_TOKEN || process.argv[2];

if (!TOKEN) {
  console.error('❌ Error: AUTH_TOKEN not provided');
  console.log('Usage: AUTH_TOKEN=your_token node upload-banners.js');
  console.log('Or: node upload-banners.js your_token');
  process.exit(1);
}

console.log('🚀 Starting banner upload process...\n');

// Image files to upload
const images = [
  {
    path: 'public/assets/image.png',
    type: 'hero',
    title: 'Summer Collection',
    subtitle: 'Discover Our Latest Designs',
    buttonText: 'Shop Now',
    link: '/products'
  },
  {
    path: 'public/assets/image copy 2.png',
    type: 'secondary',
    title: 'Limited Edition',
    subtitle: 'Exclusive Drops Every Week',
    buttonText: 'View Collection',
    link: '/products?filter=new'
  }
];

/**
 * Make HTTPS POST request
 */
function makeRequest(method, path, options, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || body}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      if (data.pipe) {
        data.pipe(req);
      } else {
        req.write(JSON.stringify(data));
      }
    } else {
      req.end();
    }
  });
}

/**
 * Upload image and get URL
 */
async function uploadImage(imagePath, fileName) {
  console.log(`📤 Uploading image: ${fileName}...`);
  
  const filePath = path.join(__dirname, imagePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const form = new FormData();
  form.append('image', fs.createReadStream(filePath), fileName);

  try {
    const result = await makeRequest('POST', '/images/upload', {
      headers: form.getHeaders()
    }, form);
    
    console.log(`✅ Image uploaded: ${result.imageUrl || result.url || result.path}`);
    return result.imageUrl || result.url || result.path;
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    throw error;
  }
}

/**
 * Create banner entry
 */
async function createBanner(bannerData) {
  console.log(`📝 Creating ${bannerData.position} banner: ${bannerData.title}...`);

  try {
    const result = await makeRequest('POST', '/admin/banners', {
      headers: { 'Content-Type': 'application/json' }
    }, bannerData);
    
    console.log(`✅ Banner created (ID: ${result.id})\n`);
    return result;
  } catch (error) {
    console.error(`❌ Banner creation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Main upload process
 */
async function uploadBanners() {
  try {
    for (const image of images) {
      // Upload image
      const imageUrl = await uploadImage(image.path, path.basename(image.path));

      // Create banner entry
      await createBanner({
        title: image.title,
        subtitle: image.subtitle,
        imageUrl: imageUrl,
        position: image.type,
        link: image.link,
        buttonText: image.buttonText,
        isActive: true,
        displayOrder: 1
      });
    }

    console.log('🎉 All banners uploaded successfully!');
    console.log('\n📍 Banners are now live on your website.');
    console.log('💡 Hero banner will display at the top');
    console.log('💡 Secondary banner will display in the middle\n');
    
  } catch (error) {
    console.error('\n❌ Upload process failed:', error.message);
    process.exit(1);
  }
}

// Run the upload
uploadBanners();
