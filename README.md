---
title: AI Tube Robot
emoji: 🍿🤖
colorFrom: red
colorTo: blue
sdk: docker
pinned: false
app_port: 7860
---

The robot running the whole show!

# Installation

It is important that you make sure to use the correct version of Node (Node 20)

1. `nvm use`
2. `npm i`
3. clone `.env` to `.env.local`
4. edit `.env.local` to define the secrets / api access keys
5. `npm run start`

# Architecture

AI Channels are just Hugging Face datasets.

For now, we keep everything into one big JSON index, but don't worry we can migrate this to something more efficient, such as Redis (eg. using Upstash for convenience).