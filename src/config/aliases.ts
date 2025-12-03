/**
 * Short name aliases for icons
 *
 * Maps common short names to their full icon names.
 * This allows users to use convenient shortcuts like "js" instead of "javascript".
 */
export const ALIASES: Record<string, string> = {
  // Languages
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  go: 'golang',
  sc: 'scala',
  vlang: 'v',

  // Frameworks & Libraries
  vue: 'vuejs',
  nuxt: 'nuxtjs',
  next: 'nextjs',
  nest: 'nestjs',
  express: 'expressjs',
  gatsbyjs: 'gatsby',
  rxjs: 'reactivex',
  rxjava: 'reactivex',
  rollup: 'rollupjs',

  // Styling
  tailwind: 'tailwindcss',
  scss: 'sass',
  windi: 'windicss',
  mui: 'materialui',

  // Cloud & Infrastructure
  cf: 'cloudflare',
  amazonwebservices: 'aws',
  googlecloud: 'gcp',
  k8s: 'kubernetes',
  apacheairflow: 'airflow',

  // Databases
  mongo: 'mongodb',
  postgres: 'postgresql',

  // Tools & Platforms
  net: 'dotnet',
  wasm: 'webassembly',
  md: 'markdown',
  gql: 'graphql',
  ghactions: 'githubactions',
  ktorio: 'ktor',
  pwsh: 'powershell',
  unreal: 'unrealengine',
  sklearn: 'scikitlearn',

  // Adobe
  ps: 'photoshop',
  ai: 'illustrator',
  pr: 'premiere',
  ae: 'aftereffects',
  au: 'audition',

  // Social/Bots
  bots: 'discordbots',
} as const;

/**
 * Get the canonical icon name from a short name or alias
 */
export function resolveAlias(name: string): string {
  const lowercased = name.toLowerCase();
  return ALIASES[lowercased] ?? lowercased;
}
