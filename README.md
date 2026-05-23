NeuroForge
AI Infrastructure Control Center for Local & Hybrid LLMs

NeuroForge is a full-stack AI infrastructure management platform designed for configuring, monitoring, benchmarking, and orchestrating local and hybrid Large Language Models (LLMs).

The platform provides developers, AI enthusiasts, and power users with a centralized control center for managing local AI environments powered by tools such as Ollama, llama.cpp, vLLM, and cloud providers like OpenAI, Anthropic, and Google Gemini.

Built with modern full-stack technologies and AI-assisted development, NeuroForge combines a responsive web dashboard, a mobile companion application, intelligent configuration tools, and real-time monitoring into a unified developer experience.

🚀 Key Features
🧠 Local LLM Management
Manage locally installed AI models
View model metadata and hardware requirements
Start, stop, and monitor running models
Pull and update models through Ollama integration
⚙️ Smart Configuration Generator

Generate optimized inference configurations based on:

GPU hardware
VRAM capacity
CPU/RAM specifications
Intended usage (coding, RAG, agents, creative writing, cybersecurity, etc.)
📊 Benchmark & Performance Center

Compare model performance using:

Tokens per second
VRAM usage
Latency
Context window performance
Quantization efficiency
🤖 AI Agent Templates

Create and manage reusable AI agent presets:

Research Agent
Pentest Assistant
Crypto Analyst
Coding Assistant
Fitness Coach
RAG Assistant
🧩 Prompt Engineering Workspace
Save and organize prompts
Version prompts
Test prompts across multiple models
Compare prompt outputs
📱 Mobile Companion App

Monitor and control your AI infrastructure remotely:

Running models
Benchmark status
Notifications
System health
Quick AI chat interface
🔐 Authentication & Authorization
JWT-based authentication
User roles and permissions
Protected API endpoints
Admin dashboard
☁️ Hybrid AI Ecosystem

Supports both local and cloud AI providers:

Ollama
llama.cpp
vLLM
OpenAI
Anthropic
Google Gemini
🏗️ Architecture

NeuroForge follows a modern client-server monorepo architecture.

/apps
   /web        -> Next.js web application
   /mobile     -> Expo React Native mobile application

/packages
   /db
   /shared
   /ui
   /agents
Web Application
Next.js App Router
React + TypeScript
Tailwind CSS
shadcn/ui
Backend
Next.js API Routes
Server Actions
RESTful API
Drizzle ORM
PostgreSQL (Neon)
Mobile Application
React Native
Expo
Storage
Cloudflare R2
🗄️ Database Design

Main database entities include:

Users
Roles
Models
Configurations
Benchmarks
Prompt Templates
Sessions
Logs
Agent Presets

The platform is designed with scalability in mind and supports:

Pagination
Indexing
Large datasets
Performance optimization
🎨 UI & Design

NeuroForge features a futuristic AI-inspired interface with:

Cyberpunk-inspired aesthetics
Responsive layouts
Terminal-style dashboards
Real-time monitoring panels
Interactive visualizations

The UI is optimized for:

Desktop
Tablets
Mobile devices
🔒 Security
Password hashing with bcrypt
JWT authentication
Protected routes and middleware
Role-based authorization
Secure API communication
📦 Deployment

The project is designed for serverless deployment using:

Netlify
Neon PostgreSQL
Cloudflare R2
🤖 AI-Assisted Development


The development process follows an iterative AI engineering loop:

Prompt → Implement → Test → Refine → Commit
📈 Scalability Goals

The system is designed to handle:

Thousands of benchmark records
Large prompt libraries
Multiple concurrent model sessions
Real-time monitoring and logging

The database is seeded with large datasets to validate scalability and performance.

🎯 Project Goals

NeuroForge aims to simplify local AI infrastructure management by providing:

Hardware-aware optimization
Unified model orchestration
Intelligent configuration assistance
Developer-friendly AI tooling
Remote monitoring capabilities
🧪 Future Improvements

Planned future features include:

Vector memory support
Workflow automation
AI-to-AI agent collaboration
Voice commands
Distributed inference support
Docker orchestration
WebSocket live streaming
RAG pipeline templates
📸 Screenshots

Screenshots and demo GIFs will be added during development.

📱 Mobile App

The mobile application acts as a remote AI operations companion for monitoring and controlling local AI infrastructure from anywhere.

👨‍💻 Author

Krum Tomov

📄 License

This project is developed for educational purposes as part of the “Full Stack Apps with AI” course at SoftUni