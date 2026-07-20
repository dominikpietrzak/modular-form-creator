# Frontend image: build the app, then serve the production preview.
# node:22-alpine because some build-time deps require Node ^20.19 || >=22.12.
FROM node:22-alpine

WORKDIR /app

# Install dependencies first so this layer is cached until the manifests change.
COPY package*.json ./
RUN npm install

COPY . .

# Vite inlines import.meta.env.VITE_API_URL at build time, so the backend URL must be
# present now, not at runtime. Default targets the host-published backend, which is what
# the browser (running on the host) reaches and which the backend's CORS origin allows.
ARG VITE_API_URL=http://localhost:5001
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

EXPOSE 5173

# Serve the built app and bind to all interfaces so the host can reach it.
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
