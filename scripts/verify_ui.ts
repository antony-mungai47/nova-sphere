import http from 'http';

const baseUrl = 'http://localhost:3001';
const routes = [
  '/',
  '/store',
  '/auctions',
  '/admin',
  '/seller',
  '/product/NS-TRAV-003' 
];

async function checkRoute(route: string) {
  return new Promise((resolve) => {
    http.get(baseUrl + route, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ route, status: res.statusCode, html: data });
      });
    }).on('error', (e) => {
      resolve({ route, status: 'ERROR', html: '' });
    });
  });
}

async function main() {
  console.log(`Checking routes on ${baseUrl}...`);
  for (const route of routes) {
    const result: any = await checkRoute(route);
    
    let isV3 = false;
    let isV2 = false;
    let contentAnalysis = [];
    
    if (result.html.includes('V3Navbar') || result.html.includes('v3-navbar') || result.html.includes('useCartStore')) {
      isV3 = true;
      contentAnalysis.push('V3 Navbar found');
    }
    
    console.log(`Route: ${result.route}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  HTML Size: ${result.html.length} bytes`);
    console.log(`  Indicators: ${contentAnalysis.join(', ')}`);
    console.log('---');
  }
}

main();
