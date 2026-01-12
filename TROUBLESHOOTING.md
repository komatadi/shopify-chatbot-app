# Troubleshooting Guide

## Chat Bubble Appears But Shows Error

### Issue: Chat bubble appears but returns "Sorry, I encountered an error"

### Debugging Steps:

1. **Check Browser Console:**
   - Open browser DevTools (F12 or Cmd+Option+I)
   - Go to Console tab
   - Look for error messages when you send a message
   - Check the Network tab to see if the API request is being made

2. **Check Terminal Logs:**
   - Look at your `npm run dev` terminal
   - You should see logs like:
     ```
     === Chat API Request ===
     Method: POST
     URL: ...
     ```
   - If you don't see these logs, the request isn't reaching your server

3. **Common Issues:**

   **Issue 1: Missing OpenAI API Key**
   - Error: "OpenAI API key is not configured"
   - Solution: Add `OPENAI_API_KEY=sk-your-key` to `.env` file
   - Restart dev server after adding

   **Issue 2: App Proxy Not Configured**
   - Error: 404 or route not found
   - Solution: The app proxy needs to be configured in Partner Dashboard
   - For development, the route should work via the dev server

   **Issue 3: Shop Domain Missing**
   - Error: "Missing shop domain"
   - Solution: The extension should pass shop domain automatically
   - Check browser console for the API URL being used

   **Issue 4: CORS Errors**
   - Error: CORS policy blocked
   - Solution: App proxy should handle this, but check headers

### Quick Fixes:

1. **Add OpenAI API Key:**
   ```bash
   # Edit .env file
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

2. **Restart Dev Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Check API URL:**
   - Open browser console
   - Type: `window.shopChatConfig`
   - Verify `apiUrl` is correct
   - Should be: `https://your-store.myshopify.com/apps/chatbot/chat`

4. **Test API Directly:**
   - Open browser console
   - Run:
   ```javascript
   fetch('https://your-store.myshopify.com/apps/chatbot/chat', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Accept': 'text/event-stream'
     },
     body: JSON.stringify({
       message: 'test',
       shopDomain: 'your-store.myshopify.com'
     })
   })
   ```

### Next Steps:

If you still see errors after checking the above:
1. Share the browser console errors
2. Share the terminal logs from `npm run dev`
3. Check if the route file exists: `app/routes/apps.chatbot.chat.tsx`






