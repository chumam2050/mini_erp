FROM node:20.19.6-bullseye

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    vim \
    curl \
    wget \
    ca-certificates \
    build-essential \
    python3 \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Switch to node user for safety
USER node

# Expose common development ports
EXPOSE 3000