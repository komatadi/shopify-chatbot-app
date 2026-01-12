# Implementation Notes

## Completed Components

### ✅ Backend (React Router App)
- **Database**: Prisma schema with SQLite for conversations, messages, and store settings
- **OpenAI Service**: Streaming chat with tool calling support
- **MCP Client**: Shopify Storefront MCP integration for product search, cart, policies
- **Chat API**: SSE streaming endpoint at `/apps/chatbot/chat`
- **Authentication**: Shopify app authentication setup

### ✅ Frontend (Theme Extension)
- **Chat Bubble UI**: Floating chat widget with modern design
- **Message Display**: Real-time message rendering with user/assistant distinction
- **Streaming Support**: Server-Sent Events for real-time responses
- **Responsive Design**: Mobile-friendly chat interface

### ✅ MCP Tools Implemented
1. **Product Search** (`search_shop_catalog`) - Search products via Storefront API
2. **Cart Operations** (`get_cart`, `update_cart`) - Cart management (structure ready)
3. **Policy & FAQ Search** (`search_shop_policies_and_faqs`) - Search store policies
4. **Order Status** (`get_order_status`) - Order lookup (requires Customer Account API)

## Important TODOs for Production

### 1. Storefront API Access Token
The MCP client currently uses an empty access token. You need to:
- Create a Storefront API access token via Admin API
- Store it per shop in the database (add to StoreSettings model)
- Retrieve it when initializing MCPClient

**Code location**: `app/services/mcp-client.server.ts` and `app/routes/apps.chatbot.chat.tsx`

### 2. Order Status Implementation
Order status checking requires:
- Customer Account API access OR Admin API with protected data permissions
- Proper authentication for customer queries
- Implementation in `getOrderStatus` method

**Code location**: `app/services/mcp-client.server.ts` - `getOrderStatus` method

### 3. Cart Operations
Cart operations need:
- Cart creation via Storefront API
- Cart ID storage per customer session
- Proper cart mutation implementation

**Code location**: `app/services/mcp-client.server.ts` - `getCart` and `updateCart` methods

### 4. App Proxy Configuration
After deployment:
- Update `application_url` in `shopify.app.toml` with your actual domain
- Configure app proxy in Partner Dashboard
- Verify proxy URL matches: `/apps/chatbot/chat`

### 5. Protected Customer Data
For order status checking:
- Request Level 2 protected customer data access in Partner Dashboard
- Explain use case: "Customer support chatbot needs to check order status"
- Wait for approval before using in production

## File Structure

```
shopify-chatbot-app/
├── app/
│   ├── routes/
│   │   ├── api.chat.tsx              # Internal chat API
│   │   ├── apps.chatbot.chat.tsx     # App proxy chat endpoint
│   │   ├── app._index.tsx            # Admin dashboard
│   │   └── auth.shopify.callback.tsx # OAuth callback
│   ├── services/
│   │   ├── openai.server.ts          # OpenAI integration
│   │   ├── mcp-client.server.ts      # MCP client
│   │   ├── streaming.server.ts       # SSE utilities
│   │   └── config.server.ts          # App configuration
│   ├── db.server.ts                  # Database utilities
│   ├── shopify.server.ts             # Shopify app config
│   └── prompts/
│       └── system-prompts.json       # System prompts
├── extensions/
│   └── chat-bubble/
│       ├── blocks/
│       │   └── chat-interface.liquid # Chat UI
│       ├── assets/
│       │   ├── chat.js               # Chat JavaScript
│       │   └── chat.css              # Chat styles
│       └── shopify.extension.toml    # Extension config
├── prisma/
│   └── schema.prisma                 # Database schema
└── shopify.app.toml                  # App configuration
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Set up database**: `npx prisma migrate dev`
3. **Configure environment**: Add `OPENAI_API_KEY` to `.env`
4. **Link app**: `shopify app config link`
5. **Start dev server**: `npm run dev`
6. **Create Storefront token**: Via Admin API (see SETUP.md)
7. **Enable extension**: In Theme Editor > App embeds
8. **Test**: Visit storefront and test chat functionality

## Testing Checklist

- [ ] Chat bubble appears on storefront
- [ ] Can send messages and receive responses
- [ ] Product search works ("show me products")
- [ ] Policy search works ("what is your return policy?")
- [ ] Conversation history persists
- [ ] Mobile responsive design works
- [ ] Streaming responses display correctly

## Deployment Checklist

- [ ] Deploy backend to hosting service
- [ ] Update `application_url` in `shopify.app.toml`
- [ ] Update `redirect_urls` in `shopify.app.toml`
- [ ] Configure app proxy in Partner Dashboard
- [ ] Set environment variables on hosting service
- [ ] Run `shopify app deploy`
- [ ] Install app on test store
- [ ] Test all functionality in production






