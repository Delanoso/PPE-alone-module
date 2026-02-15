# Ngrok setup for PPE links

When you send size or sign links to drivers (e.g. via WhatsApp), those links must use a **public URL**. `localhost` only works on your own computer.

## Quick start (recommended): Watchdog mode

For development with ngrok, use the watchdog – it starts both dev server and ngrok, checks every **30 seconds**, and restarts either if they stop responding:

```bash
npm run dev:watch
```

The Dashboard, when viewed via your ngrok URL, **auto-reloads every 5 minutes** so wall displays stay up to date.

## Manual steps

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Start ngrok**
   ```bash
   npm run ngrok
   ```

3. **Get your ngrok URL**
   - Open http://127.0.0.1:4040 in your browser (ngrok dashboard)
   - Copy the HTTPS URL (e.g. `https://abc123.ngrok-free.app`)

4. **Set PUBLIC_URL**
   - Edit `apps/api/.env`
   - Add or update: `PUBLIC_URL=https://your-ngrok-url.ngrok-free.app`
   - Restart the dev server (Ctrl+C, then `npm run dev`)

5. **Use the ngrok URL**
   - Open the app at your ngrok URL (e.g. https://abc123.ngrok-free.app)
   - Log in and send links from the Reminders page
   - Links will use the ngrok URL and will work when drivers open them on their phones
