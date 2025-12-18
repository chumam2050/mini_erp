FROM node:20.19.6-bullseye

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    vim \
    nano \
    jq \
    net-tools \
    curl \
    wget \
    ca-certificates \
    build-essential \
    python3 \
    postgresql-client \
    iputils-ping \
    netcat \
    htop \
    procps \
    lsof \
    strace \
    tcpdump \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

RUN npm install -g lerna@8


# Set working directory
WORKDIR /workspace

# Switch to node user for safety
USER node

# Expose common development ports
EXPOSE 3000