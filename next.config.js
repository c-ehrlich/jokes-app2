import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import iwebpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    instrumentationHook: true,
  },
  // Fix for https://github.com/open-telemetry/opentelemetry-js/issues/4297
  webpack: (config, _options) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...config,
      plugins: [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        ...config.plugins,
        new iwebpack.NormalModuleReplacementPlugin(
          /@opentelemetry\/exporter-jaeger/,
          path.resolve(path.join(__dirname, "./polyfills.js")),
        ),
      ],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      resolve: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...config.resolve,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        fallback: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ...config.resolve.fallback,
          stream: false,
          zlib: false,
          http: false,
          tls: false,
          net: false,
          http2: false,
          dns: false,
          os: false,
          fs: false,
          path: false,
          https: false,
        },
      },
    };
  },
};

export default config;
