# SmartRoom Finder

SmartRoom Finder is a mobile-first Progressive Web App (PWA) that discovers devices named "SmartRoomHub" on the user's local network (LAN) and enables seamless connectivity. Built with a focus on visual excellence and intuitive interactions, it uses client-side scanning techniques to detect devices via IP-range probing, HTTP checks, and fallback methods, displaying results in a clean, responsive interface. Users can connect to discovered devices with simple connectivity tests, receiving clear success or error feedback.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/TalhaTeke/smartroom-finder-mobile-first-lan-device-discovery)

## Features

- **LAN Device Discovery**: Scans local networks using browser-compatible methods like HTTP probing on common subnets (e.g., 192.168.x.x), port checks, and mDNS fallbacks to locate "SmartRoomHub" devices.
- **Device Listing**: Displays discovered devices with IP addresses, hostnames, discovery method, and response time in a polished, responsive card-based UI.
- **Connectivity Testing**: One-tap "Connect" action performs HTTP /ping endpoint tests or TCP port probes with timeouts, showing success messages or helpful error guidance.
- **Mobile-First Design**: Elegant, minimal interface optimized for touch devices, with smooth animations, micro-interactions, and responsive layouts using shadcn/ui and Tailwind CSS.
- **Settings & Customization**: Adjustable scan subnets, ports, timeouts, and manual IP entry for robust discovery in varied network environments.
- **Visual Polish**: Gradient hero sections, floating animations, shimmer effects, and professional typography for an engaging user experience.
- **PWA Capabilities**: Installable on mobile devices for offline access to settings and logs (scanning requires network).
- **Error Handling & Fallbacks**: Graceful handling of browser limitations (e.g., CORS, no UDP/ARP), with toasts, modals, and user-guided troubleshooting.

## Tech Stack

- **Frontend**: React 18, React Router DOM 6, TypeScript
- **UI Library**: shadcn/ui (built on Radix UI and Tailwind CSS v3)
- **Styling**: Tailwind CSS with custom animations and gradients
- **State Management**: Zustand (lightweight, primitive selectors)
- **Animations & Interactions**: Framer Motion
- **Icons**: Lucide React
- **Toasts & Notifications**: Sonner
- **Data Fetching**: @tanstack/react-query (optional caching)
- **Hooks & Utilities**: react-use
- **Backend/Deployment**: Cloudflare Workers (Hono framework), Wrangler CLI
- **Build Tools**: Vite, Bun (package manager)
- **Linting & Formatting**: ESLint, TypeScript ESLint

## Quick Start

### Prerequisites

- Node.js (v18+ recommended, but using Bun for installation)
- Bun package manager (install via `curl -fsSL https://bun.sh/install | bash`)
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd smartroom-finder
   ```

2. Install dependencies using Bun:
   ```
   bun install
   ```

3. Start the development server:
   ```
   bun dev
   ```

   The app will be available at `http://localhost:3000` (or the configured port).

## Development

### Running the App

- **Development Mode**: `bun dev` – Hot-reloads on file changes with Vite.
- **Build for Production**: `bun build` – Generates optimized assets in `/dist`.
- **Preview Build**: `bun preview` – Serves the production build locally.

### Project Structure

- `src/`: Frontend source code (pages, components, hooks, lib).
  - `pages/HomePage.tsx`: Main scanning interface (rewrite as needed).
  - `components/ui/`: shadcn/ui components (do not modify).
  - `lib/network/discovery.ts`: Core scanning logic (implement IP probing here).
- `worker/`: Cloudflare Worker backend (routes in `userRoutes.ts`).
- `tailwind.config.js`: Custom themes, animations, and gradients.
- `src/index.css`: Global styles with CSS variables.

### Key Development Notes

- **UI Guidelines**: Use the root wrapper for layouts: `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="py-8 md:py-10 lg:py-12">{content}</div></div>`. Prefer shadcn/ui components and Tailwind utilities.
- **Scanning Implementation**: Browser limitations prevent low-level scans; use `fetch` with `mode: 'no-cors'`, Image tags for port probes, and timeouts. Add to `src/lib/network/discovery.ts`.
- **Zustand Usage**: Always select primitives (e.g., `useStore(s => s.isScanning)`) to avoid re-render loops.
- **Testing Connectivity**: Implement in a service module; handle CORS with fallbacks.
- **Linting**: Run `bun lint` to check code quality.
- **Type Generation**: For Workers, run `bun cf-typegen` to update types.

### Common Commands

- Format code: `bun lint --fix`
- Type check: `bun tsc --noEmit`
- Add shadcn component: Follow shadcn CLI (e.g., `bunx shadcn@latest add button`)

## Usage

### Scanning for Devices

1. Open the app on a device connected to the same LAN as the SmartRoomHub.
2. Tap the "Scan" button to start discovery.
3. The app probes common subnets in parallel (capped for performance) and lists matching devices.
4. Select a device and tap "Connect" to test connectivity (HTTP /ping or port check).
5. On success: Toast confirmation and option to open device UI.
6. On failure: Error modal with retry/manual IP options.

### Customizing Scans

- Access Settings (gear icon) to set subnets (e.g., "192.168.1.0/24"), ports (e.g., 80, 3000), and timeout (default 3s).
- Manual IP: Enter a known IP for direct testing.
- Logs: View discovery details in Settings for debugging.

### Example: Adding a New Route (Backend)

In `worker/userRoutes.ts`:
```typescript
app.post('/api/scan', async (c) => {
  // Handle scan requests if needed
  return c.json({ success: true });
});
```

## Deployment

Deploy to Cloudflare Workers for global edge delivery and PWA hosting.

### Steps

1. **Login to Cloudflare**:
   ```
   bunx wrangler login
   ```

2. **Configure Project**:
   - Ensure `wrangler.jsonc` has your account ID (run `bunx wrangler whoami`).
   - Set secrets if needed: `bunx wrangler secret put <KEY>`.

3. **Build and Deploy**:
   ```
   bun build
   bunx wrangler deploy
   ```

   The app deploys to `https://<project-name>.<subdomain>.workers.dev`. Update `wrangler.jsonc` for custom domains.

4. **PWA Installation**:
   - The build includes manifest and service worker for PWA features.
   - Users can "Add to Home Screen" on mobile.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/TalhaTeke/smartroom-finder-mobile-first-lan-device-discovery)

### CI/CD

Integrate with GitHub Actions or Cloudflare Pages for automated deployments. Example workflow:
```yaml
- name: Deploy
  run: bun build && bunx wrangler deploy --name ${{ secrets.PROJECT_NAME }}
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m 'Add amazing feature'`.
4. Push: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

Follow the code style (ESLint) and add tests where applicable. Focus on mobile responsiveness and performance.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

- Report issues on the repository.
- For Cloudflare-specific questions, refer to [Cloudflare Docs](https://developers.cloudflare.com/workers/).