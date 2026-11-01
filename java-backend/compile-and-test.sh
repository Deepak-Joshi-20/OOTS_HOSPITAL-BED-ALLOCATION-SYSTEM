#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if command -v javac >/dev/null 2>&1; then
  JAVAC_CMD="javac"
  JAVA_CMD="java"
elif [ -x "/tmp/jdk/bin/javac" ]; then
  JAVAC_CMD="/tmp/jdk/bin/javac"
  JAVA_CMD="/tmp/jdk/bin/java"
else
  echo "Error: javac not found in PATH. Please install JDK 17+."
  exit 1
fi

echo "Using Java compiler: $($JAVAC_CMD -version 2>&1)"

mkdir -p target/classes target/test-classes

echo "Compiling main source files..."
find src/main/java -name "*.java" > target/main-sources.txt
"$JAVAC_CMD" --release 17 -d target/classes @target/main-sources.txt

echo "Compiling test source files..."
find src/test/java -name "*.java" > target/test-sources.txt
"$JAVAC_CMD" --release 17 -cp target/classes -d target/test-classes @target/test-sources.txt

echo ""
echo "Running Automated Unit Test Suite..."
"$JAVA_CMD" -cp target/classes:target/test-classes com.blossomcare.hospital.AllocationServiceTest

echo ""
echo "Running End-to-End Blossom Care Hospital Bed Allocation Simulation..."
"$JAVA_CMD" -cp target/classes com.blossomcare.hospital.Main
