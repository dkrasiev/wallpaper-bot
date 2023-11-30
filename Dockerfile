FROM node:18-alpine as build
WORKDIR /src

RUN npm install --global pnpm

COPY package.json package.json
RUN pnpm install

COPY ./src/**/* ./

RUN npm run build


FROM node:18-alpine
WORKDIR /dist

COPY --from=build /src/dist ./

CMD ["node", "index.js"]

