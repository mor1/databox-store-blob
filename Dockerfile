FROM node:argon

ADD package.json package.json
RUN npm install && npm run clean

ADD ./src .

LABEL databox.type="store"

EXPOSE 8080

CMD ["npm","start"]