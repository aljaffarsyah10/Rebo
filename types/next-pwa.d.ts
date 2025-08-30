declare module 'next-pwa' {
  import { Plugin } from 'next';
  const withPWA: (opts?: any) => Plugin;
  export default withPWA;
}
