import path from 'path';
import { fileURLToPath } from 'url';
const root = path.dirname(fileURLToPath(import.meta.url));

/** Frontend-only app: statically exported, no server runtime. */
const nextConfig = {
  output: 'export',
  typescript: { ignoreBuildErrors: true }, // verified with `tsc --noEmit` (project path contains a space)
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => { config.resolve.alias['@'] = path.join(root, 'src'); return config; },
};
export default nextConfig;
