VibeLink - Real-time Chat Platform
🚀 Overview

VibeLink is a modern, real-time chat platform designed to connect people seamlessly through private and public chat rooms. Whether you're looking to chat with friends, collaborate with teammates, or engage with a community, VibeLink provides a sleek and intuitive interface for instant communication.
✨ Features

    Real-time Messaging: Experience instant communication with live message updates.

    Private Chat Rooms: Create secure, invite-only spaces for focused discussions with friends or colleagues.

    Public Chat Rooms: Join diverse global communities and engage in open conversations.

    GIF and Emoji Support: Express yourself vividly with rich media integration.

    Rate-Limiting: Built-in mechanisms to prevent spam and ensure a smooth user experience.

    User-Friendly Interface: A clean, intuitive design ensuring ease of navigation and use.

    Responsive Design: Optimized for a seamless experience across various devices (desktop, tablet, mobile).

🛠️ Technologies Used

VibeLink is built using a robust stack of modern web technologies, categorized into server-side and client-side dependencies, along with core frameworks and tools.
Core Technologies

    TypeScript: The primary language for the project, indicating a robust and scalable codebase.

    JavaScript: Used in conjunction with TypeScript.

    CSS: For styling and visual presentation.

Server-side Dependencies

    drizzle-orm:  A modern TypeScript ORM for declarative and type-safe SQL.

    express:  A fast, unopinionated, minimalist web framework for Node.js.

    ioredis:  - A robust, performance-focused Redis client for Node.js.

    nanoid: - A tiny, secure, URL-friendly, unique string ID generator.

    node-cron: - A task scheduler for Node.js based on cron.

    pg: - PostgreSQL client for Node.js.

    socket.io: ^4.8.1 - A library for real-time, bi-directional communication between web clients and servers.

    drizzle-kit: ^0.31.1 - Toolkit for Drizzle ORM migrations and schema generation.

Client-side Dependencies

    axios:  Promise-based HTTP client for the browser and Node.js.

    better-auth:  (Specific authentication library, details depend on implementation).

    framer-motion: A production-ready motion library for React.

    posthog-js:  PostHog JavaScript client for product analytics.

    zod:  TypeScript-first schema declaration and validation library.

    zustand:  A small, fast and scalable bearbones state-management solution using hooks.

⚙️ Setup and Installation (For Developers)

To run VibeLink locally for development purposes, follow these steps:

    Clone the repository:

    git clone https://github.com/Dhruvkoshta/VibeLink.git
    cd VibeLink

    Install dependencies:

    npm install
    # or
    yarn install

    Set up environment variables:
    Create a .env file in the root directory and add necessary environment variables (e.g., API keys for Firebase, WebSocket server URL, etc.).

    # Example .env content (adjust as per actual setup)
    REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    # ... other variables

    Run the development server:

    npm start
    # or
    yarn start

    This will typically start the application on http://localhost:3000.

🚀 Usage

To start using VibeLink, simply visit the deployed application at https://vibe-link-gold.vercel.app/.

    Explore Public Rooms: Join existing public chat rooms to interact with the wider community.

    Create Private Rooms: Start your own private room and invite friends or colleagues for focused conversations.

    Chat: Type your messages, send emojis, and share GIFs to communicate effectively.


