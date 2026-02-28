#!/bin/bash
# Build the NanoClaw agent container image

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

IMAGE_NAME="nanoclaw-agent"
TAG="${1:-latest}"
CONTAINER_RUNTIME="${CONTAINER_RUNTIME:-docker}"

# Auto-detect China network
USE_CHINA_MIRRORS="false"
if [ "${CHINA_MIRRORS:-auto}" = "auto" ]; then
  if timeout 2 curl -s -o /dev/null https://mirrors.tuna.tsinghua.edu.cn 2>/dev/null; then
    USE_CHINA_MIRRORS="true"
    echo "China mirrors detected and enabled"
  fi
elif [ "${CHINA_MIRRORS}" = "true" ]; then
  USE_CHINA_MIRRORS="true"
  echo "China mirrors enabled via CHINA_MIRRORS=true"
fi

echo "Building NanoClaw agent container image..."
echo "Image: ${IMAGE_NAME}:${TAG}"
echo "Using China mirrors: ${USE_CHINA_MIRRORS}"

${CONTAINER_RUNTIME} build \
  --build-arg USE_CHINA_MIRRORS="${USE_CHINA_MIRRORS}" \
  -t "${IMAGE_NAME}:${TAG}" \
  .

echo ""
echo "Build complete!"
echo "Image: ${IMAGE_NAME}:${TAG}"
echo ""
echo "Test with:"
echo "  echo '{\"prompt\":\"What is 2+2?\",\"groupFolder\":\"test\",\"chatJid\":\"test@g.us\",\"isMain\":false}' | ${CONTAINER_RUNTIME} run -i ${IMAGE_NAME}:${TAG}"
