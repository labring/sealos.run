FROM node:24-alpine AS base

RUN apk add --no-cache git

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
# Ignore postinstall scripts here, we do not have sources copied here.
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile --ignore-scripts; \
  elif [ -f package-lock.json ]; then npm ci --ignore-scripts; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile --ignore-scripts; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true

# Next.js public analytics configuration is embedded into the browser bundle.
ARG NEXT_PUBLIC_RYBBIT_HOST
ARG NEXT_PUBLIC_RYBBIT_SITE_ID
ENV NEXT_PUBLIC_RYBBIT_HOST=${NEXT_PUBLIC_RYBBIT_HOST}
ENV NEXT_PUBLIC_RYBBIT_SITE_ID=${NEXT_PUBLIC_RYBBIT_SITE_ID}

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensuring no unnecessary permissions are given and add necessary permissions for it to run server.js properly.
# Keep most of the filesystem read-only, but allow Next.js to write cache files under `.next/cache`.
RUN chmod -R a-w+x . \
	&& mkdir -p .next/cache \
	&& chown -R nextjs:nodejs .next \
	&& chmod -R u+rwX .next \
	&& chmod -R a+rx node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]