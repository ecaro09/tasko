#!/bin/bash

# Logging functions with emoji indicators
log_success() {
  echo "✅ $1"
}

log_info() {
  echo "ℹ️ $1"
}

log_warn() {
  echo "⚠️ $1"
}

log_error() {
  echo "❌ $1"
}

log_info "Starting Git HEAD auto-fix utility..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
  log_info "'.git' directory not found. Initializing Git repository..."
  git init
  if [ $? -eq 0 ]; then
    log_success "Git repository initialized."
    # Ensure the branch is named 'main' and make an initial commit
    # 'git branch -M main' renames the current branch to 'main' or creates it if no commits exist.
    git branch -M main
    git commit --allow-empty -m "Initial commit"
    if [ $? -eq 0 ]; then
      log_success "Initial commit created on 'main' branch."
    else
      log_error "Failed to create initial commit. Please check Git configuration."
      exit 1
    fi
  else
    log_error "Failed to initialize Git repository. Exiting."
    exit 1
  fi
else
  log_success "'.git' directory found."
fi

# Now, ensure HEAD is on the 'main' branch.
# This handles cases like:
# 1. Detached HEAD state.
# 2. No HEAD reference (e.g., after git init but before first commit, though handled above).
# 3. Being on a different branch.
log_info "Ensuring HEAD is on 'main' branch..."
# 'git switch -C main' creates the 'main' branch if it doesn't exist and switches to it,
# or switches to 'main' if it already exists. It also attempts to carry over uncommitted changes.
git switch -C main
if [ $? -eq 0 ]; then
  log_success "Successfully ensured HEAD is on 'main' branch."
else
  log_error "Failed to ensure HEAD is on 'main' branch. Please investigate manually."
  exit 1
fi

log_info "Git HEAD auto-fix utility finished."