FROM node:18-alpine as build

RUN npm install --global pnpm

COPY package.json package.json
RUN pnpm install

COPY ./src/**/* ./src

RUN npm run build


FROM node:18-alpine

COPY --from=build /src/dist ./dist

CMD ["node", "dist/index.js"]

