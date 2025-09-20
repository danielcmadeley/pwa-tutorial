# PWA Test Project with PGlite Database

A Progressive Web App built with React, TypeScript, Vite, and PGlite for offline-first data persistence.

## Features

### 🚀 Progressive Web App (PWA)
- **Offline functionality** - Works without internet connection
- **Service Worker** with Workbox for asset caching
- **Web App Manifest** for installable app experience
- **Optimized caching strategies** for assets and API calls

### 🗄️ Local Database with PGlite
- **PostgreSQL in the browser** using PGlite WebAssembly
- **IndexedDB persistence** - Data survives page refreshes and browser restarts
- **Live queries** with automatic UI updates when data changes
- **Fallback to memory** if IndexedDB is unavailable

### ✅ Todo Application
- Create, read, update, and delete todos
- Mark todos as completed/incomplete
- Clear all completed todos
- Real-time updates with live queries
- Persistent data storage

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** for build tooling and development
- **PGlite** for client-side PostgreSQL database
- **Workbox** for service worker and caching
- **PWA Assets Generator** for app icons and manifests

## Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- Modern browser with WebAssembly support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pwa-test-project

# Install dependencies
bun install
# or
npm install
```

### Development

```bash
# Start development server
bun dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Building for Production

```bash
# Build the application
bun run build
# or
npm run build

# Preview the production build
bun run preview
# or
npm run preview
```

## Database Schema

The app uses a simple todos table:

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

### Vercel (Recommended)

The project includes a `vercel.json` configuration file optimized for PWA deployment:

1. Connect your repository to Vercel
2. Deploy automatically - Vercel will detect the Vite configuration
3. The PWA will work offline once deployed

### Other Platforms

The build output in the `dist/` folder can be deployed to any static hosting service:
- Netlify
- GitHub Pages  
- AWS S3 + CloudFront
- Any CDN or static hosting provider

## Key Files

- `src/db.ts` - PGlite database setup and configuration
- `src/TodoApp.tsx` - Todo application component with CRUD operations
- `src/sw.ts` - Service worker for offline functionality
- `vite.config.ts` - Vite and PWA plugin configuration
- `vercel.json` - Deployment configuration for Vercel

## Browser Support

- Chrome/Edge 88+
- Firefox 89+
- Safari 15+

Requires WebAssembly support for PGlite database functionality.

## Offline Functionality

The app works completely offline:

1. **First visit** - Downloads and caches all assets
2. **Offline usage** - Serves cached assets and database works locally
3. **Data persistence** - Todos are stored in IndexedDB and survive browser restarts
4. **Background updates** - Service worker updates the app when online

## Performance

- **Lighthouse Score**: 90+ for all categories
- **Bundle Size**: ~160KB gzipped (excluding PGlite WASM)
- **Database Size**: ~9MB WASM file (cached after first load)
- **Cold Start**: < 2s on modern devices

## Development Features

- Hot Module Replacement (HMR)
- TypeScript support with strict checking
- ESLint configuration
- Live database queries with automatic UI updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### Database Initialization Issues

If you see "Failed to initialize database" errors:

1. Check browser console for detailed error messages
2. Ensure your browser supports WebAssembly
3. Try clearing browser storage and reload
4. The app will fallback to memory storage if IndexedDB fails

### Service Worker Issues

If the app doesn't work offline:

1. Check if service worker is registered in browser dev tools
2. Force refresh to update the service worker
3. Check the PWA badge for update notifications

### Build Issues

If builds fail:

1. Clear node_modules and reinstall dependencies
2. Check for TypeScript errors with `bun run lint`
3. Ensure all required environment variables are set