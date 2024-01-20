### Prerequisites

1. Linux-based system with POSIX compliant shell (required for the scripts to work)
2. [Docker engine & docker-compose plugin](../../tools/docker.md)
3. Make sure the scripts have execute permissions, e.g:

```bash
chmod +x ./scripts/start.sh ./scripts/remove.sh
```

---

### Recommended (Will work without them):

1. [NVM - Node Version Manager](https://github.com/nvm-sh/nvm#installing-and-updating)
2. [Node LTS version](https://github.com/nvm-sh/nvm#long-term-support)
3. [Debugger](../../web/node/debugger/typescript/README.md)

**Notes:**

- **ONLY** run the application using the start/remove scripts, not directly via
  the docker. (Unless you are sure you know what you're doing)
- For any issue(s), contact a maintainer/contributor in any way you see fit

---

# Submission notes

### TL:DR

I wish I had more time pretty much, there so much left to do.  
The basic functionality works, but the UX is problematic, the UI is abysmal
and there's not enough error handling.

## Backend

Pretty happy about it.  
Dockerized, based on express, has postgres database and websocket server.  
Even managed to put in some basic tests.  
Overall more work can be done, but I'm satisfied with it with the time given.

## Frontend

Considering I learned frontend and react in 2 days I guess it's ok?  
(I'm not delusional, of course it's bad, but considering the time constraints
and 0 prior knowledge in react and at least 4 years since I coded something
frontend related I feel it is acceptable)  
Dockerized, built in react with typescript.  
I have to say it really opened me to the the need to learn it more in
depth and understand everything I can from HTML and CSS to states, the DOM and
the correct practices. (I wish I had more time)

## What's missing?

With more time the things I would work on are: (in order)

1. UI/UX
2. Frontend tests
3. Learn React best practices and implement them
4. Restructuring the frontend components chain
5. Error handling (Front and back)
6. Additional backend tests

If you've bothered reading this, thank you and with your permission may I continue
working on this project and keep it public in my Github repo?
