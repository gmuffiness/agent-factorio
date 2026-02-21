#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  ╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}  ║       AgentFactorio Installer         ║${NC}"
echo -e "${CYAN}  ║   GitHub for AI Agents                ║${NC}"
echo -e "${CYAN}  ╚═══════════════════════════════════════╝${NC}"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js not found. Installing via nvm...${NC}"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install --lts
  echo -e "${GREEN}Node.js installed!${NC}"
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js ${NODE_VERSION} detected${NC}"

# Detect package manager
if command -v pnpm &> /dev/null; then
  PM="pnpm"
elif command -v yarn &> /dev/null; then
  PM="yarn"
else
  PM="npm"
fi

echo -e "${CYAN}Installing agent-factorio via ${PM}...${NC}"
$PM install -g agent-factorio

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo -e "${CYAN}Starting login...${NC}"
echo ""

# Run login
agent-factorio login
