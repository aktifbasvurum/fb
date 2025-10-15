# PLATOON FACEBOOK MANAGER - Build Script

import subprocess
import sys

print("="*60)
print("PLATOON FACEBOOK MANAGER - EXE BUILDER")
print("="*60)
print()

# Install PyInstaller
try:
    import PyInstaller
    print("[OK] PyInstaller found")
except ImportError:
    print("[...] Installing PyInstaller...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller", "--quiet"])
    print("[OK] PyInstaller installed")

print()
print("Building EXE...")
print("Please wait (2-3 minutes)...")
print()

# Build with console window (for debugging)
cmd = [
    "pyinstaller",
    "--onefile",
    "--console",  # Keep console window open
    "--name=PlatoonFacebookManager",
    "--icon=NONE",
    "facebook_manager.py"
]

try:
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print()
        print("="*60)
        print("BUILD SUCCESS!")
        print("="*60)
        print()
        print("EXE file:")
        print("  -> dist/PlatoonFacebookManager.exe")
        print()
        print("NOTES:")
        print("  - Console window will show for debugging")
        print("  - If no errors, you can rebuild with --windowed flag")
        print("  - Share the EXE with users")
        print()
        print("REQUIREMENTS for users:")
        print("  1. This EXE file")
        print("  2. Python 3.x installed")
        print("  3. Google Chrome installed")
        print("  4. Selenium (auto-installs on first run)")
        print()
    else:
        print()
        print("="*60)
        print("BUILD FAILED!")
        print("="*60)
        print(result.stderr)
        sys.exit(1)
        
except Exception as e:
    print()
    print("="*60)
    print("ERROR!")
    print("="*60)
    print(str(e))
    sys.exit(1)
