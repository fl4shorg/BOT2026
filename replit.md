# WhatsApp Bot - NEEXT LTDA

## Overview
This project is an automated WhatsApp bot built with Baileys, designed to enhance group management and user interaction. It features advanced anti-spam functionalities, comprehensive administrative commands, and a unique ID creation system for NEEXT LTDA. The bot also includes an interactive Akinator game and a full-fledged RPG system called NeextCity, offering an engaging virtual economy. Its primary purpose is to provide robust group moderation, interactive entertainment, and a platform for unique digital identity management within WhatsApp.

## User Preferences
I prefer iterative development with clear communication at each stage. Ask for confirmation before implementing significant changes or new features. Provide detailed explanations for complex architectural decisions and technical implementations, but keep day-to-day updates concise. I value clean, modular code with good documentation. Ensure all changes are well-tested and backward-compatible if modifying existing functionalities. I prefer the use of Portuguese for all interactions and explanations.

## System Architecture

### UI/UX Decisions
The bot communicates primarily through text and reactions within WhatsApp. Visual feedback is provided using emoji reactions. Menus are dynamically generated, offering an interactive experience with statistics and contextual information.

### Technical Implementations
The bot is built using Baileys for WhatsApp integration. It features a modular architecture, especially in the NeextCity RPG system v2.0 (rebuilt October 2025), which is divided into 9 independent modules: state management (`state.js`), constants (`constants.js`), and 6 specialized services (`economyService`, `activityService`, `jobService`, `educationService`, `inventoryShopService`, `gameService`) plus a main controller (`index.js`). The new architecture follows a service-layer pattern with normalized error handling ({success, message} pattern) and centralized state management. Data persistence is handled via JSON files (e.g., `database/grupos/rpg_data.json`, `settings/settings.json`) with automatic migration from v1.0 to v2.0 preserving player progress. Integration with Google Sheets API for the ID creation system. The bot is designed for production deployment on a VM for persistent connection.

### Feature Specifications
- **Core Bot Commands:** Basic utilities like `ping`, `hora`, `dono`, `recado`, sticker creation (`.s`), and a prefix display.
- **Administrative Commands:** Group control (open/close, admin-only edits), message moderation (delete), link management (reset invite), entry control (activate/deactivate join requests), and group renaming. These require both the user and the bot to be group admins.
- **NEEXT ID System:** Creates unique IDs using `.hermitwhite [name] [age] [phone] [instagram] [email]`. It validates input, integrates with Google Sheets, and generates sequential IDs.
- **Akinator Game:** An interactive guessing game initiated with `.akinator` and reset with `.resetaki`. It supports "Yes," "No," "Don't know," "Probably yes," and "Probably no" responses, with game state managed per group.
- **NeextCity RPG System:** A virtual economy with user registration (`.registrar`), gold earning activities (fishing, mining, working, hunting, collecting, farming, deliveries), a comprehensive shop (`.loja`) with categories like properties, animals, vehicles, tools, and businesses. It also includes gambling (`.tigrinho`, `.apostar`), player interaction (`.assalto`), investments, education, and a banking system (`.pix`, `.saldo`, `.rank`). Features cooldowns for actions and persistent inventory.
- **Advanced Anti-Spam System:**
    - **Link Protection:** Basic (`.antilink`) and advanced (`.antilinkhard`) link detection.
    - **Content Protection:** Detects and blocks pornographic content (`.antiporno`) and profanity (`.antipalavrao`).
    - **Other Protections:** Anti-contacts (`.anticontato`), anti-documents (`.antidocumento`), anti-videos (`.antivideo`), anti-audios (`.antiaudio`), anti-stickers (`.antisticker`), anti-flood (`.antiflod`), anti-fake numbers (`.antifake`), and X9 monitoring (`.x9`).
    - **Owner Protections:** Blocks private messages from non-owners (`.antipv`) and automatically rejects calls (`.anticall`).
    - **Special Command:** `.hidetag` for hidden group mentions.
    These protections offer automatic message removal, user banning, and group-specific configurations.
- **Security:** Session files are excluded from version control, and permission checks are enforced for administrative commands.
- **Deployment:** Configured for Replit environment with automatic dependency installation, workflow execution (`node main.js`), and environment detection.

### System Design Choices
- **Modular Architecture:** The RPG system, in particular, emphasizes modularity for maintainability and scalability.
- **Configuration:** Bot settings are managed in `settings/settings.json` and sensitive information via `.env` variables (`.env.example` provided).
- **Error Handling & Logging:** Robust error treatment and detailed logging for all processed messages, command usage, and antilink actions.
- **Session Management:** WhatsApp session files in `conexao/` ensure persistent connection across restarts.
- **Dynamic Content:** Menus are dynamically generated with real-time statistics (command counts, group numbers).

## External Dependencies
- **Baileys:** Core library for WhatsApp Web Multi-Device integration.
- **Google Sheets API:** Used for the NEEXT ID creation system to store and retrieve ID data.
- **Aki-API:** Provides the backend logic for the Akinator game.
- **NPM Packages:** Various packages listed in `package.json` for functionalities like image/video processing, utility functions, and database management.