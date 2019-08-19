FROM node:8

LABEL version="1.0.0"
LABEL maintainer="vincentdass"
LABEL com.github.actions.name="JSON variable substitution"
LABEL com.github.actions.description="GitHub action for substituting varibles in JSON files"
LABEL com.github.actions.icon="file-text"
LABEL com.github.actions.color="blue"

COPY . .

RUN npm install

RUN chmod +x /entrypoint.js

ENTRYPOINT ["node", "/entrypoint.js"]


