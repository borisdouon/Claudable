# Claudable Architecture Analysis: The Complete Prompt-to-UI Orchestration

## Overview

This document provides a comprehensive analysis of how Claudable achieves the remarkable feat of turning a single prompt into a fully functional web application with live preview. Claudable is built as a **multi-layered orchestration system** that bridges AI coding agents with real-time web development.

## 🏗️ Core Architecture Overview

### Frontend Layer (Next.js App)
- **Main Interface**: `/app/page.tsx` - Project dashboard
- **Chat Interface**: `/app/[project_id]/chat/page.tsx` - Main development environment
- **Real-time Components**: Chat logs, file explorer, preview pane

### Backend Orchestration Layer
- **API Routes**: `/app/api/` - REST endpoints for all operations
- **CLI Services**: `/lib/services/cli/` - AI agent integrations
- **Stream Management**: `/lib/services/stream.ts` - Real-time communication
- **Preview Management**: `/lib/services/preview.ts` - Live development servers

### Agent Integration Layer
- **Claude Code SDK**: `@anthropic-ai/claude-agent-sdk`
- **Multiple CLI Support**: Cursor, Codex, Qwen, GLM
- **Unified Interface**: All agents abstracted through common service patterns

## 🔄 Complete Prompt-to-UI Workflow

### Phase 1: Project Creation & Prompt Capture
```
User enters prompt → Frontend captures → POST /api/projects → 
Project record created → Directory structure set up → 
Preview server initialized → Real-time connections established
```

**Key Files:**
- `/app/api/projects/route.ts` - Project creation API
- `/lib/services/project.ts` - Project management logic
- `/lib/services/preview.ts` - Development server orchestration

### Phase 2: AI Agent Orchestration
```
User submits prompt → POST /api/chat/[project_id]/act → 
CLI service selected → Agent SDK invoked → 
Real-time streaming begins → Code generation starts
```

**Core Orchestration File:**
- `/app/api/chat/[project_id]/act/route.ts` - **The main conductor**

This route:
1. **Validates** project and user input
2. **Selects** appropriate AI service (Claude, Cursor, etc.)
3. **Invokes** the agent SDK with project context
4. **Initiates** real-time streaming for progress updates
5. **Manages** preview server lifecycle

### Phase 3: AI Agent Execution (Claude Example)
```
Claude SDK receives prompt → Analyzes requirements → 
Generates Next.js code → Writes files to project directory → 
Reports progress via streaming → Completes task
```

**Key Implementation:**
- `/lib/services/cli/claude.ts` - Claude Agent SDK integration
- Uses `permissionMode: 'bypassPermissions'` for autonomous operation
- **System Prompt**: Explicitly instructs AI to build Next.js apps with specific constraints
- **Real-time Tool Tracking**: Every file operation is captured and streamed

### Phase 4: Real-time Communication
```
Agent operations → StreamManager.publish() → 
WebSocket/SSE → Frontend receives → UI updates in real-time
```

**Streaming Architecture:**
- **Primary**: WebSocket connections (`/lib/server/websocket-manager.ts`)
- **Fallback**: Server-Sent Events (`/app/api/chat/[project_id]/stream/route.ts`)
- **Manager**: `StreamManager` class coordinates all connections

### Phase 5: Live Preview & Hot Reload
```
Files written to project directory → Next.js dev server detects changes → 
Hot reload triggers → Preview iframe updates → User sees live changes
```

**Preview System:**
- **Per-project servers**: Each project gets isolated dev server
- **Port management**: Automatic port allocation to avoid conflicts
- **Process management**: Spawns and manages child processes safely

## 🎯 Key Technical Innovations

### 1. Unified Agent Abstraction
```typescript
// From /app/api/chat/[project_id]/act/route.ts
const executor = cliPreference === 'codex' ? initializeCodexProject
  : cliPreference === 'cursor' ? initializeCursorProject
  : cliPreference === 'qwen' ? initializeQwenProject
  : cliPreference === 'glm' ? initializeGLMProject
  : initializeClaudeProject;
```

### 2. Real-time Progress Streaming
Every AI operation is captured and streamed:
- **Tool Usage**: File reads, writes, edits
- **Code Generation**: Real-time code output
- **Status Updates**: Starting, running, completed states
- **Error Handling**: Graceful failure reporting

### 3. Autonomous Agent Permissions
```typescript
// From Claude service
permissionMode: 'bypassPermissions', // Auto-approve commands and edits
```

This is the **secret sauce** - agents can operate autonomously within the project sandbox without user confirmation for each operation.

### 4. Intelligent Project Scaffolding
The system includes smart defaults and constraints:
- **Next.js 15 App Router** enforced
- **TypeScript** by default
- **Tailwind CSS** for styling
- **Port management** prevents conflicts
- **Security boundaries** protect the main application

## 🔧 Agent Responsibilities Breakdown

### Claude Agent (Primary)
- **File Operations**: Read, write, edit, delete project files
- **Code Generation**: Create React components, API routes, styles
- **Dependency Management**: Package.json modifications
- **Project Structure**: Organize files following Next.js conventions

### Orchestrator Responsibilities
- **Session Management**: Maintain conversation context
- **Preview Lifecycle**: Start/stop development servers
- **Progress Broadcasting**: Stream real-time updates
- **Error Recovery**: Handle agent failures gracefully

### Frontend Responsibilities
- **Real-time UI**: Update chat, file explorer, preview
- **User Interaction**: Handle prompts, file uploads, settings
- **Connection Management**: WebSocket/SSE with fallbacks
- **State Synchronization**: Keep all components in sync

## 🚀 The "Magic" Explained

The reason Claudable can go from "prompt to working app" so seamlessly is:

1. **Pre-configured Environment**: Each project gets a sandboxed Next.js environment
2. **Autonomous Agents**: AI agents have full permissions within their project sandbox
3. **Real-time Feedback**: Every operation is immediately visible to the user
4. **Integrated Preview**: Changes are instantly visible without manual refresh
5. **Smart Constraints**: The system guides agents toward proven patterns

## 📊 Data Flow Summary

```
User Prompt → API Route → Agent SDK → File System → 
Stream Manager → WebSocket/SSE → Frontend → Live Preview
```

This architecture creates a **tight feedback loop** where users can see their ideas transformed into working code in real-time, making the development process feel instantaneous and magical.

## 🔍 Key Implementation Details

### StreamManager Class
The `StreamManager` in `/lib/services/stream.ts` is the central hub for real-time communication:
- Manages multiple SSE connections per project
- Broadcasts events to all connected clients
- Handles connection lifecycle and cleanup
- Integrates with WebSocket manager for redundancy

### Agent SDK Integration
Each AI service (`/lib/services/cli/*.ts`) follows a consistent pattern:
1. **Input Validation**: Verify project exists and paths are secure
2. **SDK Invocation**: Call the respective AI agent SDK
3. **Stream Processing**: Handle real-time events from the agent
4. **Progress Broadcasting**: Convert agent events to UI updates
5. **Error Handling**: Graceful failure recovery

### Security Model
- **Path Validation**: Ensures agents only work within project directories
- **Permission Bypass**: Agents have autonomous permissions within sandbox
- **Process Isolation**: Each project runs in isolated environment
- **Resource Limits**: Prevents resource exhaustion attacks

## 🛠️ Development Architecture

### Project Structure
```
data/projects/[project_id]/
├── [generated files]
├── package.json
├── next.config.js
├── tailwind.config.ts
└── .next/ (build output)
```

### Database Schema
- **Projects**: Metadata, status, preferences
- **Messages**: Chat history with streaming metadata
- **User Requests**: Track prompt execution status
- **Settings**: Global and project-specific configurations

### API Endpoints
- `POST /api/projects` - Create new project
- `POST /api/chat/[id]/act` - Execute AI command
- `GET /api/chat/[id]/stream` - Real-time updates (SSE)
- `GET /api/projects` - List all projects
- `PUT /api/projects/[id]` - Update project settings

## 🎨 Frontend Architecture

### Real-time Updates
The frontend uses a dual-transport approach:
1. **WebSocket**: Primary real-time communication
2. **SSE Fallback**: When WebSocket is unavailable
3. **Polling Backup**: Final fallback for message recovery

### State Management
- **Optimistic Updates**: User messages appear immediately
- **Request Tracking**: Monitor AI execution status
- **Message Deduplication**: Prevent duplicate UI updates
- **Error Boundaries**: Graceful error handling

### UI Components
- **ChatLog**: Real-time message display with streaming support
- **File Explorer**: VSCode-style project navigation
- **Preview Pane**: Live application preview
- **ChatInput**: Prompt submission with image support

## 🔮 Extensibility

### Adding New AI Agents
1. Create service in `/lib/services/cli/[agent].ts`
2. Implement `initializeNextJsProject` and `applyChanges` functions
3. Add to executor mapping in `/app/api/chat/[project_id]/act/route.ts`
4. Update CLI options and constants

### Custom Project Templates
1. Modify scaffold functions in `/lib/utils/scaffold.ts`
2. Update system prompts in agent services
3. Adjust preview management for different frameworks

### Additional Streaming Channels
1. Extend `StreamManager` for new event types
2. Add frontend handlers in `ChatLog` component
3. Update type definitions for new events

## 📈 Performance Considerations

### Scalability
- **Per-project Isolation**: Prevents resource contention
- **Connection Pooling**: Efficient WebSocket management
- **Memory Management**: Automatic cleanup of completed streams
- **Process Limits**: Bounded preview server resources

### Optimization
- **Lazy Loading**: Components load on demand
- **Message Batching**: Reduce UI update frequency
- **Connection Reuse**: Persistent WebSocket connections
- **Caching**: Project metadata and settings

## 🧪 Testing Strategy

### Unit Testing
- Agent service functions
- Stream manager operations
- API route handlers
- Utility functions

### Integration Testing
- End-to-end prompt execution
- Real-time communication flows
- Preview server lifecycle
- Error recovery scenarios

### Load Testing
- Concurrent project creation
- Multiple streaming connections
- Preview server performance
- Memory usage under load

## 🔒 Security Considerations

### Threat Model
- **Path Traversal**: Prevented by path validation
- **Resource Exhaustion**: Limited by process isolation
- **Code Injection**: Mitigated by sandbox boundaries
- **Data Exposure**: Controlled by project isolation

### Best Practices
- **Input Validation**: All user inputs sanitized
- **Permission Boundaries**: Agents limited to project scope
- **Secure Defaults**: Conservative configuration
- **Audit Logging**: All operations tracked

---

*This architecture analysis was conducted by examining the complete Claudable codebase, including all API routes, services, and frontend components. The system represents a sophisticated approach to AI-augmented web development, combining autonomous agent capabilities with real-time user feedback.*
