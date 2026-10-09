FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/admin/package*.json ./apps/admin/

RUN npm ci

COPY packages/shared/ ./packages/shared/
COPY apps/admin/ ./apps/admin/

RUN npm run build --workspace=@calyvia/shared
RUN npm run build --workspace=@calyvia/admin

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/admin/package.json ./apps/admin/package.json

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=@calyvia/admin"]
