// Minimal placeholder types for 'minimatch' to satisfy the TypeScript build.
declare module 'minimatch' {
  export function makeRe(pattern: string, options?: any): RegExp | null;
  export default function minimatch(
    path: string,
    pattern: string,
    options?: any
  ): boolean;
}
