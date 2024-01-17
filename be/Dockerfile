FROM node:lts-alpine3.19 as be-base

# Install dependencies
RUN apk update && apk add curl

############################### Development ########################################

FROM be-base as be-dev

# Set the workdir
WORKDIR /home/node

################################### Test ###########################################

FROM be-base as be-ci

# Copy resources
WORKDIR /home/node
COPY \
    ./.eslintrc.cjs \
    ./package*.json \
    ./tsconfig*.json \
    ./loader.js \
    ./nodemon.json \
    ./

# Install dependencies
RUN npm install

# Copy source code
COPY ./src ./src
COPY ./__tests__ ./__tests__
