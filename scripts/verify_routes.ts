import https from 'https';

const baseUrl = 'https://nova-sphere-atxf605qt-antonymungai47-3536s-projects.vercel.app';
const routes = [
  '/',
  '/store',
  '/auctions',
  '/admin',
  '/seller',
  '/product/NS-TRAV-003' // example PDP
];

async function checkRoute(route: string) {
  return new Promise((resolve) => {
    https.get(baseUrl + route, (res) => {
      resolve({ route, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ route, status: 'ERROR' });
    });
  });
}

async function main() {
  console.log(`Checking routes on ${baseUrl}...`);
  for (const route of routes) {
    const result: any = await checkRoute(route);
    console.log(`${result.route} - ${result.status}`);
  }
}

main();
