# 🃏 OmiWorld

> A modern, multiplayer online version of the classic 4-player card game Omi, built with cutting-edge web technologies and cloud architecture.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-red?style=for-the-badge&logo=firebase)](https://play-omi-world.web.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://react.dev/)

## 🎯 About

OmiWorld is a personal learning project by **Sihilel H** who combined his love for the classic card game Omi with modern web development technologies. Built from scratch to explore real-time multiplayer applications, cloud architecture, and serverless computing.

### 🎮 What is Omi?

Omi is a traditional 4-player card game that requires strategy, teamwork, and quick thinking. This digital version brings the classic gameplay to the modern web with real-time multiplayer capabilities.

## ✨ Features

- **🎯 Real-time Multiplayer**: WebSocket-powered gameplay with instant updates
- **🔐 Secure Authentication**: AWS Cognito user management
- **☁️ Cloud Native**: Built on AWS serverless architecture
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎨 Modern UI**: Beautiful, intuitive interface built with React and Tailwind CSS
- **⚡ Fast Performance**: Optimized with Vite and modern React patterns

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   AWS Cognito   │    │   DynamoDB      │
│   (Firebase)    │◄──►│   Authentication│    │   Game Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  WebSocket API  │    │   REST API      │    │   AWS Lambda    │
│  (Real-time)    │    │   (Game Logic)  │    │   Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend

- **React 19** - Latest React with modern patterns
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Radix UI** - Accessible component primitives

### Backend & Infrastructure

- **AWS CDK** - Infrastructure as Code
- **AWS Lambda** - Serverless functions
- **AWS DynamoDB** - NoSQL database
- **AWS Cognito** - User authentication
- **API Gateway** - REST and WebSocket APIs
- **WebSocket** - Real-time communication

### Development Tools

- **ESLint** - Code quality and consistency
- **Jest** - Testing framework
- **pnpm** - Fast package manager
- **Turbo** - Monorepo build system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- AWS CLI configured
- AWS CDK installed globally

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sihilelh/omi-world.git
   cd omi-world
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env files for both app and cdk directories
   cp app/.env.example app/.env
   ```

### Development

1. **Start the frontend development server**

   ```bash
   cd app
   pnpm dev
   ```

2. **Deploy the backend infrastructure**

   ```bash
   cd cdk
   pnpm cdk deploy
   ```

3. **Start the backend locally (optional)**
   ```bash
   cd cdk
   pnpm dev
   ```

### Building for Production

1. **Build the frontend**

   ```bash
   cd app
   pnpm build
   ```

2. **Deploy to Firebase**
   ```bash
   cd app
   pnpm deploy
   ```

## 📁 Project Structure

```
omi-world/
├── app/                          # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── atoms/          # Basic components (Button, Input, etc.)
│   │   │   ├── molecules/      # Compound components (Forms, Cards, etc.)
│   │   │   └── organisms/      # Complex components (Pages, Layouts)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Application pages
│   │   ├── services/           # API and external service integrations
│   │   ├── stores/             # State management (Zustand)
│   │   └── utils/              # Utility functions and helpers
│   ├── public/                 # Static assets
│   └── package.json
├── cdk/                         # AWS CDK infrastructure
│   ├── lib/                    # CDK stack definitions
│   ├── lambda/                 # AWS Lambda functions
│   │   ├── ws/                # WebSocket handlers
│   │   ├── session.ts         # Game session management
│   │   └── round.ts           # Game round logic
│   ├── cognito/               # User authentication setup
│   ├── dynamo/                # Database table definitions
│   └── package.json
└── README.md
```

## 🎯 Key Components

### Frontend Architecture

- **Atomic Design System**: Organized component hierarchy for maintainability
- **Custom Hooks**: Reusable logic for WebSocket, authentication, and game state
- **State Management**: Zustand stores for session, round, and WebSocket state
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Services

- **Session Management**: Create, join, and manage game sessions
- **Real-time Gameplay**: WebSocket-based card playing and turn management
- **Game Logic**: Server-side validation for fair gameplay
- **User Authentication**: Secure login and registration

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**

```env
VITE_API_URL=your_api_gateway_url
VITE_WEBSOCKET_URL=your_websocket_url
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_client_id
```

## 📦 Deployment

### Frontend (Firebase)

```bash
cd app
pnpm build
pnpm deploy
```

### Backend (AWS CDK)

```bash
cd cdk
pnpm cdk deploy --all
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. **Code Style**: Follow the existing ESLint configuration
2. **TypeScript**: Use strict typing and avoid `any`
3. **Testing**: Add tests for new features
4. **Commits**: Use conventional commit messages

### Getting Help

- 🐛 **Bug Reports**: [Create an issue](https://github.com/sihilelh/omi-world/issues)
- 💡 **Feature Requests**: [Create an issue](https://github.com/sihilelh/omi-world/issues)
- ❓ **Questions**: [Create a discussion](https://github.com/sihilelh/omi-world/discussions)

## 📱 Screenshots

<img alt="Image" src="https://github.com/user-attachments/assets/18e8c736-a32d-450c-8986-fbed4af13fdd" />

<br/>

<img alt="Image" src="https://github.com/user-attachments/assets/bd3a36e7-0dfa-4f4a-af72-199f808cd13e" />

<br/>

<img alt="Image" src="https://github.com/user-attachments/assets/0584229e-7cde-43ae-9797-0f969f6da6a0" />

<br/>

<img alt="Image" src="https://github.com/user-attachments/assets/8bc622af-b5c7-44d7-ac24-301e078199c7" />

## 🚧 Roadmap

- [ ] Mobile app optimization
- [ ] Additional game modes
- [ ] Spectator mode
- [ ] Game replays
- [ ] Leaderboards
- [ ] Tournament system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The Omi card game community for inspiration
- AWS for providing excellent serverless services
- The React and TypeScript communities for amazing tools
- All contributors and testers

## 📞 Contact

- **GitHub**: [@sihilelh](https://github.com/sihilelh)
- **Project**: [OmiWorld Repository](https://github.com/sihilelh/omi-world)
- **Live Demo**: [Play OmiWorld](https://play-omi-world.web.app)

---

<div align="center">

**Made with ❤️ by Sihilel H**

</div>
