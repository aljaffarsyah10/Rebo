if (!self.define) {
  let e,
    s = {};
  const a = (a, i) => (
    (a = new URL(a + '.js', i).href),
    s[a] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, t) => {
    const c =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (s[c]) return;
    let n = {};
    const f = (e) => a(e, c),
      r = { module: { uri: c }, exports: n, require: f };
    s[c] = Promise.all(i.map((e) => r[e] || f(e))).then((e) => (t(...e), n));
  };
}
define(['./workbox-e9849328'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/Homepage_rebo.png',
          revision: '50b30fe91ff39cdb116ddd942d627790'
        },
        { url: '/SK_RB.pdf', revision: '96a9cadc74aa612e49159890839259a6' },
        {
          url: '/_next/app-build-manifest.json',
          revision: 'fe74453a0bd99ce17f76ffcaba04d2a1'
        },
        {
          url: '/_next/static/9Vmtk4Fitf2Z3mJxtCnpD/_buildManifest.js',
          revision: '289ebec8e9bd3c5df3dc45366245e351'
        },
        {
          url: '/_next/static/9Vmtk4Fitf2Z3mJxtCnpD/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933'
        },
        {
          url: '/_next/static/chunks/1289.f5803961f74dcad1.js',
          revision: 'f5803961f74dcad1'
        },
        {
          url: '/_next/static/chunks/1470-58ae4d58f5fb64a0.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/1544-a1b689cc9e6d6528.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/1551-3fe03b5a9a3b6e0f.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/3037-c3a8f0953c244816.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/3564-62863b27d3e1a0c6.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/5156.e95e0b676bae616d.js',
          revision: 'e95e0b676bae616d'
        },
        {
          url: '/_next/static/chunks/5389-bc1167678bfba636.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/5595-0cea3fcfbd58859d.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/5652-54c561b8588f2e48.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/5806-2f9dd6a2ff06b261.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/6318.8aefff2b7df9e210.js',
          revision: '8aefff2b7df9e210'
        },
        {
          url: '/_next/static/chunks/632-321821ca7971f46b.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/6932-028569c505a10d89.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/6987.28b91cd86522a148.js',
          revision: '28b91cd86522a148'
        },
        {
          url: '/_next/static/chunks/7003-6d440bc63735a1fe.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/7210-cd1c34a08156863f.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/8073-37a73e6ccfb09706.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/8074-73ef1839cae3fc42.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/818-7491238d292d2603.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/8517-d5a4e1d20dde7f33.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/8750-1ed35454914a46c3.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/9252-dce2fcd62fa34153.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/927-c85ff86bfbe0fd53.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/9479-10154b4d00153583.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/9901-b1b8b130a39c12b7.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-c96b36637a0981ef.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/api/download/route-b2cb58f539726987.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/api/export/lke/route-8284e96065d072b7.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/api/pilarHasil/route-a03d32d48e3f6f4c.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/api/route-5cc68cdacba34c8a.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/api/status/route-0ad605099c29fa57.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/auth/callback/page-0e1f5fd6905cb4cd.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/auth/sign-in/%5B%5B...sign-in%5D%5D/page-ad28b6b951ee4aa5.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/auth/sign-up/%5B%5B...sign-up%5D%5D/page-44d745cd03161843.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/dashboard/layout-fdf819db0bbe5a4a.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/dashboard/overview/page-1d20d7d2fcca1862.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-ee67b89bc473ddb8.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/dashboard/profile/%5B%5B...profile%5D%5D/page-afb2f7ccefcd51da.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/global-error-212a96b570070d5a.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/layout-309c90753dd9c015.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/not-found-ae41954e41489d82.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/notes/page-b7c9b1ac64b24f70.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/page-15696f5cbef28b0c.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/admin/api/role/route-fe805e57526d056c.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/admin/audit-log/page-296cb04ada1978cf.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/admin/gdrive-generator/page-48a3fad439eec471.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/admin/page-93a2135808ca8b89.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/admin/periode/page-6a27f66c745aa7a7.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/arsip/page-c62d4b924fc4d0c8.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/dataRB/pilar/page-21b6168828ae161c.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/dataRB/pilar/pertanyaan/page-89f3bb1caf8baa9b.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/dataRB/pilar/subpilar/page-fe7a852f227f5ef4.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/formRB/%5BpilarId%5D/page-f91fc53924fb50de.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/formRB/area/page-33499f4a7ef948e6.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/formRB/page-f6029e6ad45edcb7.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/formRB/pemenuhan/page-34887ae33cb0193d.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/formRB/reform/page-df8fe9e7bed8232a.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/informasi/page-86919c061904a17f.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/kanban/page-4043ae18fbc6aa64.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/layout-dfdac7736a212e00.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/login/page-c3f972556fdf9e33.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/monitoring/page-59911cd3195fefe3.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/overview/page-4e61f19dc2ca7eda.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/page-af8b8bc575b5b967.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/app/rebo/pilarHasil/page-8c14eae3dc28c9e1.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/f687099f-281f6dcdccc077e6.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/framework-8fec5047f188a437.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/main-295f6cf74ae02764.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/main-app-13b4fbc5b573b2b5.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/pages/_app-f5d245ac36bc9ac5.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/pages/_error-22ccc1e530af0598.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f'
        },
        {
          url: '/_next/static/chunks/webpack-56b4c47994db1214.js',
          revision: '9Vmtk4Fitf2Z3mJxtCnpD'
        },
        {
          url: '/_next/static/css/0c695dd85a2f82ee.css',
          revision: '0c695dd85a2f82ee'
        },
        {
          url: '/_next/static/css/451dfc06877ad82b.css',
          revision: '451dfc06877ad82b'
        },
        {
          url: '/_next/static/css/eff032140c1ce13b.css',
          revision: 'eff032140c1ce13b'
        },
        {
          url: '/_next/static/media/013b72fa676f92e0-s.woff2',
          revision: 'bc06a1ea50382b6956e53aeb91c889c1'
        },
        {
          url: '/_next/static/media/15605e25b523335c-s.woff2',
          revision: '21e7cdfe3c2e0b4c68b98c4d4c79a953'
        },
        {
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
          revision: '9dda5cfc9a46f256d0e131bb535e46f8'
        },
        {
          url: '/_next/static/media/1a3dce5cfb5f7760-s.woff2',
          revision: '80d8103bc98d4d592d75c49fb4d430c7'
        },
        {
          url: '/_next/static/media/1ba4bcc28d9acde5-s.woff2',
          revision: '91a8f4be810123e220351e0ef0325df6'
        },
        {
          url: '/_next/static/media/1cdd02902f937a18-s.woff2',
          revision: '65aa21931967c619a8264ccb6040ce8f'
        },
        {
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
          revision: '4e2553027f1d60eff32898367dd4d541'
        },
        {
          url: '/_next/static/media/22a5144ee8d83bca-s.p.woff2',
          revision: 'f4634c3bc1fa7cb53247e1f2872adb5a'
        },
        {
          url: '/_next/static/media/26d0ba92e140f0dc-s.p.woff2',
          revision: 'e35fad09c70beb975a297c43c6af4e66'
        },
        {
          url: '/_next/static/media/2b5b02fc7e511755-s.woff2',
          revision: 'a27466d069120e75e25b4fd06edd5be2'
        },
        {
          url: '/_next/static/media/3be83a346553616c-s.p.woff2',
          revision: 'ce75879fa69cca9bc1e3973804bdca46'
        },
        {
          url: '/_next/static/media/3cca6a2fae6396cc-s.woff2',
          revision: '47fada90dd946a0cefa70a25af330980'
        },
        {
          url: '/_next/static/media/4c4b3b30b6bcb2be-s.woff2',
          revision: 'e4cd8ea9dfef4742c7c8f81e7a7ec773'
        },
        {
          url: '/_next/static/media/641a7b8a5800ee0e-s.woff2',
          revision: '3df27f1818a32ac5008a02ef79803567'
        },
        {
          url: '/_next/static/media/65f03d54ccadf4a8-s.woff2',
          revision: '58bcf4f276e0844890901b91c411447c'
        },
        {
          url: '/_next/static/media/7d4881bb7e1bf84d-s.p.woff2',
          revision: 'cd5b25781181c5c03d99ac2cbf88016a'
        },
        {
          url: '/_next/static/media/7d87e5ac6ec6000d-s.woff2',
          revision: '978b61464b21905406853c715049f376'
        },
        {
          url: '/_next/static/media/7deddc85b7ffd1dc-s.woff2',
          revision: 'cdf771739fbc44c3414970906a4e844b'
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75'
        },
        {
          url: '/_next/static/media/9766a7e9e2e0ad5a-s.woff2',
          revision: '9a45f5a5937490fac6d4f5043a36c125'
        },
        {
          url: '/_next/static/media/aa016aab0e6d1295-s.woff2',
          revision: '49215a3bccaeb5d483f4cf8fceb24776'
        },
        {
          url: '/_next/static/media/adb45196eddef626-s.woff2',
          revision: 'e2385a0176261fc4c6a08188e35189cb'
        },
        {
          url: '/_next/static/media/af6b7096c023fb67-s.woff2',
          revision: '7220ba741f778481ed7bbcd1d74cc908'
        },
        {
          url: '/_next/static/media/b66cf8e69499582a-s.woff2',
          revision: 'dea7cff2e11a000dc4e0e913992f9c21'
        },
        {
          url: '/_next/static/media/b9408752a0c24fb9-s.woff2',
          revision: 'c10faa6c8fbd7a47d8f00e75e82935cb'
        },
        {
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
          revision: '9e494903d6b0ffec1a1e14d34427d44d'
        },
        {
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
          revision: '027a89e9ab733a145db70f09b8a18b42'
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0'
        },
        {
          url: '/_next/static/media/e038a29029a234f2-s.woff2',
          revision: '42a21c981b367f31bd04683072dae1c1'
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de'
        },
        {
          url: '/_next/static/media/ec14413c594b3356-s.p.woff2',
          revision: 'c6923c479ff7973e40b86d2ca2ac9f92'
        },
        {
          url: '/_next/static/media/f639721981034f88-s.woff2',
          revision: 'f4a75186954722ca80df35984adf581d'
        },
        {
          url: '/assets/logo_rebo.png',
          revision: 'ee8e76fd7167ba969792e40e6011125b'
        },
        {
          url: '/assets/rebo.png',
          revision: '83a93047d605a0ce25d71f4b332bbfa0'
        },
        {
          url: '/assets/rebo_white.png',
          revision: '5ef4bbf60662ad78e7c985cc8c860321'
        },
        {
          url: '/assets/sentry.svg',
          revision: 'dfef2bfc715be8756347f30189b4bd68'
        },
        {
          url: '/icons/apple-icon-180.png',
          revision: '99cf375da49cb9c9113f3e9d510327a1'
        },
        {
          url: '/icons/apple-splash-1125-2436.jpg',
          revision: '74fd8929980df0526fa4bc931347a7ab'
        },
        {
          url: '/icons/apple-splash-1136-640.jpg',
          revision: '12141fe5e6b2418a272469584965e8d5'
        },
        {
          url: '/icons/apple-splash-1170-2532.jpg',
          revision: '95b40e9cde317f5bb0b8f6d934ce6ee1'
        },
        {
          url: '/icons/apple-splash-1179-2556.jpg',
          revision: '3a6cc6914632b6804f3962ad4a97beeb'
        },
        {
          url: '/icons/apple-splash-1206-2622.jpg',
          revision: 'bb022cb4d8575422d42ed0fad2750660'
        },
        {
          url: '/icons/apple-splash-1242-2208.jpg',
          revision: '0b6e4163fc1ad063ae5cf0713d728a69'
        },
        {
          url: '/icons/apple-splash-1242-2688.jpg',
          revision: '279adf2eb34a0fa673d74ff6f1015aeb'
        },
        {
          url: '/icons/apple-splash-1284-2778.jpg',
          revision: '2ca275b3cc8200d2e8714060cee61017'
        },
        {
          url: '/icons/apple-splash-1290-2796.jpg',
          revision: '9aae6abb2f5c05f12039040ec293b07f'
        },
        {
          url: '/icons/apple-splash-1320-2868.jpg',
          revision: '28639b41ced271d25ea1fc4cb12d009f'
        },
        {
          url: '/icons/apple-splash-1334-750.jpg',
          revision: '02d95e29c3ad7fec9af6eda403243cfe'
        },
        {
          url: '/icons/apple-splash-1488-2266.jpg',
          revision: 'c50fb7636e148dce72303fce37a3650b'
        },
        {
          url: '/icons/apple-splash-1536-2048.jpg',
          revision: '16a44e88501a74d8c3490d63533e19b8'
        },
        {
          url: '/icons/apple-splash-1620-2160.jpg',
          revision: '34b0ada350bcefc605e539e03eb5cb64'
        },
        {
          url: '/icons/apple-splash-1640-2360.jpg',
          revision: '1096b114d219e44c91ed6a5c11bfcefb'
        },
        {
          url: '/icons/apple-splash-1668-2224.jpg',
          revision: 'e70d37bc78030038ad366997ac37acb9'
        },
        {
          url: '/icons/apple-splash-1668-2388.jpg',
          revision: '3fc8b414ee0c1c34f60ad946d713e0a3'
        },
        {
          url: '/icons/apple-splash-1792-828.jpg',
          revision: '4c4d4b27b3b6fb4121d8b56bf2e5340f'
        },
        {
          url: '/icons/apple-splash-2048-1536.jpg',
          revision: 'c9f5bd246b5f7a39544494a44110bb97'
        },
        {
          url: '/icons/apple-splash-2048-2732.jpg',
          revision: '9322701a8941cda53c0d6bbd1426a744'
        },
        {
          url: '/icons/apple-splash-2160-1620.jpg',
          revision: '75e28e1753b7589360f8767d0b8f9b5b'
        },
        {
          url: '/icons/apple-splash-2208-1242.jpg',
          revision: '8f670c5518e9c996c42f6db8b14e787e'
        },
        {
          url: '/icons/apple-splash-2224-1668.jpg',
          revision: '07a0c55b0a8689f68be094f0f1067fed'
        },
        {
          url: '/icons/apple-splash-2266-1488.jpg',
          revision: 'e83002fbdc47d50fb1460849f967114e'
        },
        {
          url: '/icons/apple-splash-2360-1640.jpg',
          revision: '02bf1b7322b8e02da1fbb38953ff47b6'
        },
        {
          url: '/icons/apple-splash-2388-1668.jpg',
          revision: '74503d79a62e54586040f00978abc865'
        },
        {
          url: '/icons/apple-splash-2436-1125.jpg',
          revision: 'd6cb9226d841e38ec9d62ee783fbe027'
        },
        {
          url: '/icons/apple-splash-2532-1170.jpg',
          revision: 'a4380b022857f8c4d15ebfe828653157'
        },
        {
          url: '/icons/apple-splash-2556-1179.jpg',
          revision: 'cedc245e2d0510e048566b8348aad6c8'
        },
        {
          url: '/icons/apple-splash-2622-1206.jpg',
          revision: 'fabd3b335da8bc668f513520f57fa699'
        },
        {
          url: '/icons/apple-splash-2688-1242.jpg',
          revision: '603775d33fbdefc76f4e6c97c093f123'
        },
        {
          url: '/icons/apple-splash-2732-2048.jpg',
          revision: '97fe8cee88acb9a7b2d62d8e77184a40'
        },
        {
          url: '/icons/apple-splash-2778-1284.jpg',
          revision: 'ad288976aeb40c75e69fb911f8297768'
        },
        {
          url: '/icons/apple-splash-2796-1290.jpg',
          revision: 'ee49b377f4d14cbda9fcab983a9c2411'
        },
        {
          url: '/icons/apple-splash-2868-1320.jpg',
          revision: 'f0ead7b8768597b40410de34c542100f'
        },
        {
          url: '/icons/apple-splash-640-1136.jpg',
          revision: '645ff2c336cd40c886b5bbb76ff5d432'
        },
        {
          url: '/icons/apple-splash-750-1334.jpg',
          revision: 'e851a9be1ed45cb4c8d26baa523ad67c'
        },
        {
          url: '/icons/apple-splash-828-1792.jpg',
          revision: '288b319dcb3cc8dd001f9d933f0eca8c'
        },
        {
          url: '/icons/favicon-196.png',
          revision: 'a9e20c6bc60c8205371de365fb88edbd'
        },
        {
          url: '/icons/manifest-icon-192.maskable.png',
          revision: '964d6e9ab5a1a7eb64fdfeccb09087ea'
        },
        {
          url: '/icons/manifest-icon-512.maskable.png',
          revision: '97e21945daa518560624557f140e5482'
        },
        {
          url: '/manifest-readme.txt',
          revision: '7384c784d614832b3f1eef962de14c16'
        },
        { url: '/manifest.json', revision: '700cc8207e8c9f9939e5fa6d9c0b5c44' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/vercel.svg', revision: '61c6b19abff40ea7acd577be818f3976' }
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: i
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers
                  })
                : s
          }
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })
        ]
      }),
      'GET'
    );
});
