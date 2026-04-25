require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // ── Standard Range ─────────────────────────────────────────────────
  { name: 'NEW BORN', brand: 'Can Bébé', size: 1, categoryName: 'Standard Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JMH9F07PQV4VE5YBND3EK', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ7XZSBMGG9JH7AQAHX2954S&w=1080&q=50', weightRangeKg: { min: 2, max: 5 }, externalId: '01KJ2JMH9F07PQV4VE5YBND3EK' },
  { name: 'MINI',     brand: 'Can Bébé', size: 2, categoryName: 'Standard Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JQ6MN0KPARQ0R8THDCJQW', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ7Y22ZX2VKMPHWKEWWBVJ9Q&w=1080&q=50', weightRangeKg: { min: 3, max: 6 }, externalId: '01KJ2JQ6MN0KPARQ0R8THDCJQW' },
  { name: 'MIDI',     brand: 'Can Bébé', size: 3, categoryName: 'Standard Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JRFHGRJ9PAMAE7AW7Q4W4', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ82QQ6ZDF94ZHR14XDB8423&w=1080&q=50', weightRangeKg: { min: 4, max: 9 }, externalId: '01KJ2JRFHGRJ9PAMAE7AW7Q4W4' },
  { name: 'MAXI',     brand: 'Can Bébé', size: 4, categoryName: 'Standard Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JSHDAK0H35RD07A1CFB92', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ82RQ3M1NDHE2GZQW56Y98A&w=1080&q=50', weightRangeKg: { min: 7, max: 18 }, externalId: '01KJ2JSHDAK0H35RD07A1CFB92' },
  { name: 'JUNIOR',   brand: 'Can Bébé', size: 5, categoryName: 'Standard Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JTA5XT5D3QM42PDQ8MD53', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ82SGTZM0JES2JC3NNC0P9K&w=1080&q=50', weightRangeKg: { min: 11, max: 25 }, externalId: '01KJ2JTA5XT5D3QM42PDQ8MD53' },
  { name: 'EXTRA LARGE', brand: 'Can Bébé', size: 6, categoryName: 'Standard Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JVKR5XJD3WFVN0MYRKVMK', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ82TA91RV21F4GVWNNEBWAG&w=1080&q=50', weightRangeKg: { min: 16, max: 30 }, externalId: '01KJ2JVKR5XJD3WFVN0MYRKVMK' },

  // ── Medium Range (sensitive skin) ──────────────────────────────────
  { name: 'NEW BORN', brand: 'Can Bébé', size: 1, categoryName: 'Medium Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J20R280HQPJJD4Z2K07SJ/products/01KJ2JYGG9JSQ8XBTQZZ3HKMXZ', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ82ZPCZ9Z7C6E1HSJ62RFYX&w=1080&q=50', weightRangeKg: { min: 2, max: 5 }, externalId: '01KJ2JYGG9JSQ8XBTQZZ3HKMXZ' },
  { name: 'MINI',     brand: 'Can Bébé', size: 2, categoryName: 'Medium Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J20R280HQPJJD4Z2K07SJ/products/01KJ2JZHRVHFQXPX0EYG1VJNQ6', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ832Q6Y8RZA7M6CJXECWMAM&w=1080&q=50', weightRangeKg: { min: 3, max: 6 }, externalId: '01KJ2JZHRVHFQXPX0EYG1VJNQ6' },
  { name: 'MIDI',     brand: 'Can Bébé', size: 3, categoryName: 'Medium Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J20R280HQPJJD4Z2K07SJ/products/01KJ2K09Q6W5S1A4Q1ZEJXRP6J', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ833TEFN16W6M7A7W9ESBGJ&w=1080&q=50', weightRangeKg: { min: 4, max: 9 }, externalId: '01KJ2K09Q6W5S1A4Q1ZEJXRP6J' },
  { name: 'MAXI',     brand: 'Can Bébé', size: 4, categoryName: 'Medium Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J20R280HQPJJD4Z2K07SJ/products/01KJ2K0W6C50GSBJ2B4SCS5T1K', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ834PHNNJE8VG9JMJXTE4NE&w=1080&q=50', weightRangeKg: { min: 7, max: 18 }, externalId: '01KJ2K0W6C50GSBJ2B4SCS5T1K' },
  { name: 'JUNIOR',   brand: 'Can Bébé', size: 5, categoryName: 'Medium Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J20R280HQPJJD4Z2K07SJ/products/01KJ2K1CWHTC385ZWP74M0TR4G', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ835RXKHAYBBQND429DDFFZ&w=1080&q=50', weightRangeKg: { min: 11, max: 25 }, externalId: '01KJ2K1CWHTC385ZWP74M0TR4G' },
  { name: 'EXTRA LARGE', brand: 'Can Bébé', size: 6, categoryName: 'Medium Range', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J20R280HQPJJD4Z2K07SJ/products/01KJ2K23ETFZA959SDW8TM5M65', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ836S1A9TXEFQS2S92BQ64Y&w=1080&q=50', weightRangeKg: { min: 16, max: 30 }, externalId: '01KJ2K23ETFZA959SDW8TM5M65' },

  // ── L'affaire Pack (budget) ─────────────────────────────────────────
  { name: 'MIDI',     brand: 'Can Bébé', size: 3, categoryName: "L'affaire Pack", productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J9WTX3XQKKTTRF1KV7Q0W/products/01KJ2K6EKF5CEYCV5E65KE1KV1', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ83ADQXNHWZW1X1Y4NW1G62&w=1080&q=50', weightRangeKg: { min: 4, max: 9 }, externalId: '01KJ2K6EKF5CEYCV5E65KE1KV1' },
  { name: 'MAXI',     brand: 'Can Bébé', size: 4, categoryName: "L'affaire Pack", productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J9WTX3XQKKTTRF1KV7Q0W/products/01KJ2K76Q1ZFTNSTZE21X1NEBN', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ83B19H2DJXJ25T2NZSJ4JC&w=1080&q=50', weightRangeKg: { min: 7, max: 18 }, externalId: '01KJ2K76Q1ZFTNSTZE21X1NEBN' },
  { name: 'JUNIOR',   brand: 'Can Bébé', size: 5, categoryName: "L'affaire Pack", productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J9WTX3XQKKTTRF1KV7Q0W/products/01KJ2K88FARG2DAQGJ3Z7WV8RT', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ83BND8EE0K5DN3DJWXGB7R&w=1080&q=50', weightRangeKg: { min: 11, max: 25 }, externalId: '01KJ2K88FARG2DAQGJ3Z7WV8RT' },
  { name: 'EXTRA LARGE', brand: 'Can Bébé', size: 6, categoryName: "L'affaire Pack", productUrl: 'https://www.canbebealgerie.com/categories/01KJ2J9WTX3XQKKTTRF1KV7Q0W/products/01KJ2KEWH2PFMXQVPQN7BWS2G8', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ83C5C5H2D5PAPNYC8SHJB4&w=1080&q=50', weightRangeKg: { min: 16, max: 30 }, externalId: '01KJ2KEWH2PFMXQVPQN7BWS2G8' },

  // ── Bonus Pack ──────────────────────────────────────────────────────
  { name: 'MAXI',   brand: 'Can Bébé', size: 4, categoryName: 'Bonus Pack', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JB5H44RQW62GWPHDQG349/products/01KJ2KG77HND4KYR4MFVFHBP56', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ83E2EWPHF5P7TBY7VHHGT3&w=1080&q=50', weightRangeKg: { min: 7, max: 18 }, externalId: '01KJ2KG77HND4KYR4MFVFHBP56' },
  { name: 'JUNIOR', brand: 'Can Bébé', size: 5, categoryName: 'Bonus Pack', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JB5H44RQW62GWPHDQG349/products/01KJ2KH1A78K160Q02ZTZ93JJQ', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJ83EGAMSEXFAB6XKXR5N0HQ&w=1080&q=50', weightRangeKg: { min: 11, max: 25 }, externalId: '01KJ2KH1A78K160Q02ZTZ93JJQ' },

  // ── Tom & Jerry (Limited Edition) ──────────────────────────────────
  { name: 'MIDI',     brand: 'Can Bébé', size: 3, categoryName: 'Tom & Jerry', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JH2XKCBA2KST4DRSJFGRG/products/01KJ83S33RRC0QY8MM4R0A3NB2', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJD1R70EJ2QKBTEA21CP3H26&w=1080&q=50', weightRangeKg: { min: 4, max: 9 }, externalId: '01KJ83S33RRC0QY8MM4R0A3NB2' },
  { name: 'MAXI',     brand: 'Can Bébé', size: 4, categoryName: 'Tom & Jerry', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JH2XKCBA2KST4DRSJFGRG/products/01KJ83T1926942FK2EDXQ44A67', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJD1RGKNEDEZ8QQD62120H5Q&w=1080&q=50', weightRangeKg: { min: 7, max: 18 }, externalId: '01KJ83T1926942FK2EDXQ44A67' },
  { name: 'JUNIOR',   brand: 'Can Bébé', size: 5, categoryName: 'Tom & Jerry', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JH2XKCBA2KST4DRSJFGRG/products/01KJ83V8GRRGHC19WB1TB80BVR', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJD1S1J92WNW90KRNDEP05KX&w=1080&q=50', weightRangeKg: { min: 11, max: 25 }, externalId: '01KJ83V8GRRGHC19WB1TB80BVR' },
  { name: 'EXTRA LARGE', brand: 'Can Bébé', size: 6, categoryName: 'Tom & Jerry', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JH2XKCBA2KST4DRSJFGRG/products/01KJ83WBX5NDGW6V62Z1V16GES', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJD1SF122GMN9KG38PWVJA5R&w=1080&q=50', weightRangeKg: { min: 16, max: 30 }, externalId: '01KJ83WBX5NDGW6V62Z1V16GES' },

  // ── Super Heroes (Limited Edition) ─────────────────────────────────
  { name: 'MIDI',     brand: 'Can Bébé', size: 3, categoryName: 'Super Heroes', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JDQAH9Y6TA2SP2F5FPV7Q/products/01KJ2KM8JAB3HQXN23N5SF0RXP', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJCV8J7HZ58SRHN6PVFP09VQ&w=1080&q=50', weightRangeKg: { min: 4, max: 9 }, externalId: '01KJ2KM8JAB3HQXN23N5SF0RXP' },
  { name: 'MAXI',     brand: 'Can Bébé', size: 4, categoryName: 'Super Heroes', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JDQAH9Y6TA2SP2F5FPV7Q/products/01KJ2KNB7FGTD3FYTPADMA2X0G', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJD1QKTAVQJWS4QAEDXSTS63&w=1080&q=50', weightRangeKg: { min: 7, max: 18 }, externalId: '01KJ2KNB7FGTD3FYTPADMA2X0G' },
  { name: 'JUNIOR',   brand: 'Can Bébé', size: 5, categoryName: 'Super Heroes', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JDQAH9Y6TA2SP2F5FPV7Q/products/01KJD1X4NBESP5TGB3TY4QMYJW', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJD1X827DWP5K6K68Q51ZY11&w=1080&q=50', weightRangeKg: { min: 11, max: 25 }, externalId: '01KJD1X4NBESP5TGB3TY4QMYJW' },
  { name: 'EXTRA LARGE', brand: 'Can Bébé', size: 6, categoryName: 'Super Heroes', productUrl: 'https://www.canbebealgerie.com/categories/01KJ2JDQAH9Y6TA2SP2F5FPV7Q/products/01KJD1YDAMEYCJ1Y9J5FMYZZQZ', imageUrl: 'https://www.canbebealgerie.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F01KJD1YSAC74QRQ2CMTZGGST9N&w=1080&q=50', weightRangeKg: { min: 16, max: 30 }, externalId: '01KJD1YDAMEYCJ1Y9J5FMYZZQZ' },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ Connected to MongoDB');
  let added = 0, skipped = 0;
  for (const p of products) {
    try {
      await Product.findOneAndUpdate(
        { externalId: p.externalId },
        { ...p, isActive: true, lastScrapedAt: new Date() },
        { upsert: true, new: true }
      );
      added++;
    } catch (e) {
      console.error('Error:', p.name, p.categoryName, e.message);
      skipped++;
    }
  }
  console.log(`✅ Done: ${added} products added/updated, ${skipped} errors`);

  // Summary
  const counts = await Product.aggregate([{ $group: { _id: '$categoryName', count: { $sum: 1 } } }]);
  console.log('\nProducts by category:');
  counts.forEach(c => console.log(`  ${c._id}: ${c.count}`));

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
