#!/usr/bin/env python3
"""
Redis Setup Helper for RAG Research Assistant

This script helps you set up Redis for caching in your RAG application.
"""

import subprocess
import sys
import platform
import os

def check_redis_installed():
    """Check if Redis is installed"""
    try:
        result = subprocess.run(["redis-cli", "ping"], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def install_redis_linux():
    """Install Redis on Linux"""
    print("Installing Redis on Linux...")
    try:
        # Update package list
        subprocess.run(["sudo", "apt", "update"], check=True)

        # Install Redis
        subprocess.run(["sudo", "apt", "install", "-y", "redis-server"], check=True)

        print("✅ Redis installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Redis: {e}")
        return False

def install_redis_macos():
    """Install Redis on macOS"""
    print("Installing Redis on macOS...")
    try:
        # Check if Homebrew is installed
        subprocess.run(["brew", "--version"], check=True, capture_output=True)

        # Install Redis using Homebrew
        subprocess.run(["brew", "install", "redis"], check=True)

        print("✅ Redis installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install Redis. Please install Homebrew first: https://brew.sh/")
        return False
    except FileNotFoundError:
        print("❌ Homebrew not found. Please install Homebrew first: https://brew.sh/")
        return False

def start_redis():
    """Start Redis server"""
    print("Starting Redis server...")
    try:
        if platform.system() == "Linux":
            subprocess.run(["sudo", "systemctl", "start", "redis-server"], check=True)
        elif platform.system() == "Darwin":  # macOS
            subprocess.run(["brew", "services", "start", "redis"], check=True)
        else:
            print("❌ Unsupported platform for automatic Redis start")
            return False

        print("✅ Redis server started!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start Redis: {e}")
        return False

def test_redis_connection():
    """Test Redis connection"""
    try:
        result = subprocess.run(["redis-cli", "ping"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0 and "PONG" in result.stdout:
            print("✅ Redis is running and responding to ping!")
            return True
        else:
            print("❌ Redis ping failed")
            return False
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        print("❌ Redis connection test failed")
        return False

def main():
    print("🔧 Redis Setup Helper for RAG Research Assistant")
    print("=" * 50)

    # Check if Redis is already running
    if check_redis_installed() and test_redis_connection():
        print("✅ Redis is already installed and running!")
        print("\nYour RAG application will now use Redis for caching.")
        print("Cache benefits:")
        print("- Faster embedding computations")
        print("- Cached search results")
        print("- Cached LLM responses")
        return

    # Check if Redis is installed but not running
    if check_redis_installed():
        print("ℹ️  Redis is installed but not running. Attempting to start...")
        if start_redis() and test_redis_connection():
            print("\n✅ Redis is now running!")
            return
        else:
            print("\n❌ Could not start Redis automatically.")
            print("Please start Redis manually:")
            if platform.system() == "Linux":
                print("  sudo systemctl start redis-server")
            elif platform.system() == "Darwin":
                print("  brew services start redis")
            return

    # Redis not installed - attempt installation
    print("ℹ️  Redis is not installed. Attempting to install...")

    system = platform.system()
    if system == "Linux":
        if install_redis_linux():
            if start_redis() and test_redis_connection():
                print("\n✅ Redis setup complete!")
                return
    elif system == "Darwin":
        if install_redis_macos():
            if start_redis() and test_redis_connection():
                print("\n✅ Redis setup complete!")
                return
    else:
        print(f"❌ Automatic installation not supported on {system}")

    print("\n❌ Automatic Redis setup failed.")
    print("\nManual setup instructions:")
    print("1. Install Redis:")
    if system == "Linux":
        print("   sudo apt update && sudo apt install redis-server")
    elif system == "Darwin":
        print("   brew install redis")
    else:
        print("   Visit: https://redis.io/download")

    print("2. Start Redis:")
    if system == "Linux":
        print("   sudo systemctl start redis-server")
    elif system == "Darwin":
        print("   brew services start redis")
    else:
        print("   redis-server")

    print("3. Test connection:")
    print("   redis-cli ping")
    print("\n4. Update REDIS_URL in .env if needed (default: redis://localhost:6379)")

if __name__ == "__main__":
    main()