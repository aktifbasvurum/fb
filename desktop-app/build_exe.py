# Facebook Account Manager - Build Script
# Creates standalone .exe file

import subprocess
import sys
import os

print("="*50)
print("Facebook Account Manager - EXE Builder")
print("="*50)
print()

# Check if PyInstaller is installed
try:
    import PyInstaller
    print("✓ PyInstaller found")
except ImportError:
    print("Installing PyInstaller...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
    print("✓ PyInstaller installed")

print()
print("Building EXE file...")
print("This may take a few minutes...")
print()

# PyInstaller command
cmd = [
    "pyinstaller",
    "--onefile",  # Single EXE file
    "--windowed",  # No console window
    "--name=FacebookAccountManager",  # EXE name
    "--icon=NONE",  # No icon (you can add one later)
    "--add-data=facebook_manager.py;.",  # Include source
    "--hidden-import=selenium",
    "--hidden-import=tkinter",
    "facebook_manager.py"
]

try:
    subprocess.check_call(cmd)
    print()
    print("="*50)
    print("✓ BUILD SUCCESSFUL!")
    print("="*50)
    print()
    print("EXE file location:")
    print(f"  → {os.path.abspath('dist/FacebookAccountManager.exe')}")
    print()
    print("You can now distribute this EXE file!")
    print("Users only need:")
    print("  1. This EXE file")
    print("  2. Google Chrome installed")
    print("  3. Python + Selenium (auto-installed on first run)")
    print()
except subprocess.CalledProcessError as e:
    print()
    print("="*50)
    print("✗ BUILD FAILED!")
    print("="*50)
    print(f"Error: {e}")
    sys.exit(1)
