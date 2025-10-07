# Fluent Messenger

A modern, minimalist, and real-time messenger application for private and group conversations, built to run entirely on the Cloudflare edge network.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/maratbekovl07/generated-app-20251007-033049-lem)

## About The Project

Fluent is a visually stunning, high-performance messaging application built on Cloudflare's edge network. It provides a seamless real-time communication experience, allowing users to register, log in, and engage in both one-on-one and group chats. The interface is designed with minimalist principles, focusing on clarity and ease of use. Users can personalize their profiles, send a variety of message types including text, emojis, and files, and switch between light and dark themes. The architecture is built for scalability, paving the way for future features like voice calls and channels.

## Key Features

-   **User Authentication**: Secure registration and login with email and password.
-   **Real-Time Chat**: Engage in private one-on-one and group conversations.
-   **Rich Messaging**: Send text, emojis, images, and files.
-   **User Profiles**: Customize your display name and profile picture.
-   **Modern UI/UX**: A clean, minimalist, and fully responsive interface.
-   **Theming**: Seamlessly switch between light and dark modes.
-   **Push Notifications**: Get notified about new messages instantly.

## Technology Stack

-   **Frontend**: React, Vite, React Router, Tailwind CSS
-   **UI Components**: shadcn/ui, Lucide React
-   **State Management**: Zustand
-   **Animations**: Framer Motion
-   **Backend**: Cloudflare Workers, Hono
-   **Storage**: Cloudflare Durable Objects
-   **Language**: TypeScript

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated:
    ```bash
    bun install -g wrangler
    wrangler login
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/fluent_messenger.git
    cd fluent_messenger
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

## Development

To start the local development server, which includes the Vite frontend and a local Wrangler instance for the backend, run the following command:

```bash
bun run dev
```

This will open the application in your default browser, typically at `http://localhost:3000`. The frontend will automatically reload on changes, and the worker will be rebuilt as you modify the backend code.

## Available Scripts

-   `bun run dev`: Starts the local development server.
-   `bun run build`: Builds the frontend and worker for production.
-   `bun run lint`: Lints the codebase using ESLint.
-   `bun run deploy`: Deploys the application to your Cloudflare account.

## Deployment

Deploying Fluent Messenger to the Cloudflare global network is a one-step process.

1.  **Build and deploy the application:**
    ```bash
    bun run deploy
    ```

    This command will build the React application, compile the worker, and deploy both to Cloudflare. Wrangler will provide you with the public URL for your deployed application.

2.  **Or, deploy directly from GitHub:**

    [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/maratbekovl07/generated-app-20251007-033049-lem)

## Architecture

The application follows a client-server model deployed entirely on the Cloudflare edge.

-   **Frontend**: A React single-page application (SPA) handles the user interface.
-   **Backend**: A Hono server running on a Cloudflare Worker exposes the API endpoints.
-   **State Management**: A single `GlobalDurableObject` class acts as a transactional key-value store, with `UserEntity` and `ChatEntity` classes abstracting all interactions. This co-locates chat data and messages for efficient retrieval.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.