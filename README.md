# Shopify Chatbot App with OpenAI

An AI-powered customer support chatbot for Shopify storefronts that can answer FAQs, check order status, and help customers find products.

## Features

- 🤖 AI-powered chat using OpenAI
- 🛍️ Product search and recommendations
- 🛒 Cart management
- ❓ FAQ and policy document queries
- 📦 Order status checking
- 💬 Persistent conversation history

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Set up the database:
```bash
npx prisma migrate dev
```

4. Start development server:
```bash
npm run dev
```

## Architecture

- **Backend**: React Router app acting as MCP client
- **Frontend**: Theme app extension (chat bubble)
- **AI**: OpenAI GPT models with tool calling
- **Data**: Shopify Storefront MCP servers

## Documentation

See the plan file for detailed implementation steps.






