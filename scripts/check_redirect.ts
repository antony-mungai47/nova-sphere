import https from 'https';

https.get('https://nova-sphere-atxf605qt-antonymungai47-3536s-projects.vercel.app/', (res) => {
  console.log(res.headers.location);
});
