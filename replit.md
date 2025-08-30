# Zombie Drive & Duel Game

## Overview

This is a 2D action web game built with Phaser 3 that combines driving and combat mechanics. Players can drive vehicles to crush enemies and collect coins, or exit the vehicle to fight on foot with melee and ranged combat. The game features a progression system where players can upgrade their cars and weapons using collected coins. The project is architected as a full-stack web application with plans for future mobile deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The game uses a hybrid approach combining two different frameworks:
- **Phaser 3 Game Engine**: Handles the core game mechanics, physics, and rendering for the 2D game world
- **React with Three.js**: Provides 3D rendering capabilities and modern UI components using @react-three/fiber
- **Dual Entry Points**: The project supports both a vanilla HTML5 game (index.html) and a React-based interface (client/index.html)

### Game Structure (Phaser 3)
The game follows a scene-based architecture with clear separation of concerns:
- **Scene Management**: Separate scenes for Boot, Preload, Menu, Garage, Game, UI, and Pause
- **Entity System**: Player, Car, Enemy, and Bullet classes with physics integration
- **System Components**: Modular systems for Audio, Effects, Parallax, Save Management, and Virtual Controls
- **Object Pooling**: Efficient memory management for frequently created/destroyed entities

### Backend Architecture
The server follows a minimal Express.js pattern:
- **Express Server**: Lightweight REST API with middleware for JSON handling and logging
- **Storage Abstraction**: IStorage interface with in-memory implementation, designed for easy database integration
- **Development Setup**: Vite integration for hot module reloading and asset bundling

### Database Design
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Schema Definition**: User management with username/password authentication
- **Migration Support**: Automated schema migrations to "./migrations" directory

### Build System
- **Vite Configuration**: Modern build tooling with React support, GLSL shader loading, and asset handling
- **TypeScript Integration**: Full type safety across client, server, and shared code
- **Path Aliases**: Organized imports using "@/" for client code and "@shared/" for shared utilities

### Styling and UI
- **Tailwind CSS**: Utility-first styling with custom design system
- **Radix UI**: Accessible component library for complex UI interactions
- **CSS Variables**: Dynamic theming support with HSL color system
- **Responsive Design**: Mobile-first approach with touch controls for mobile devices

### Audio System
The game implements a sophisticated audio management system:
- **Web Audio API**: Low-level audio control with synthesized sound effects
- **Fallback Support**: HTML5 audio for browsers without Web Audio API support
- **Dynamic Audio**: Context-aware music and sound effects based on game state

## External Dependencies

### Game Engine and Graphics
- **Phaser 3**: Core 2D game engine for physics, rendering, and input handling
- **@react-three/fiber**: 3D rendering capabilities for enhanced visual effects
- **@react-three/drei**: Additional 3D utilities and components
- **@react-three/postprocessing**: Post-processing effects for advanced graphics

### Database and Backend
- **@neondatabase/serverless**: PostgreSQL database hosting with serverless architecture
- **Drizzle ORM**: Type-safe database operations and schema management
- **Express.js**: Web server framework for API endpoints

### UI and Styling
- **Radix UI Components**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Class Variance Authority**: Type-safe component variants
- **Lucide React**: Icon library for UI elements

### Development Tools
- **TypeScript**: Static type checking across the entire codebase
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### State Management and Data
- **@tanstack/react-query**: Server state management and caching
- **Zustand**: Lightweight client-state management (inferred from store structure)
- **React Hook Form**: Form handling and validation
- **Zod**: Runtime type validation for API endpoints