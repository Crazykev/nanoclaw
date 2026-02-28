# Privileged Access Configuration

## Overview

NanoClaw supports granting groups privileged access to DevOps tools for development, deployment, and bug fixing operations. This includes:

- **Docker socket** (`/var/run/docker.sock`) - Full container management
- **SSH keys** (`~/.ssh`) - Git operations with private repositories
- **Kubernetes config** (`~/.kube`) - Cluster operations
- **Docker config** (`~/.docker`) - Docker CLI authentication

## Security Warning

⚠️ **IMPORTANT**: Privileged access grants significant system-level capabilities:

- **Docker socket access = Container escape capability**
  - Can spawn privileged containers
  - Can mount any host path
  - Essentially provides root-level access

- **SSH key access**
  - Can read private keys (read-only mount)
  - Can use keys for git operations

- **Kubernetes access**
  - Full cluster operations based on ~/.kube/config permissions

**Only grant privileged access to trusted groups!**

## Configuration

### 1. Check Current Status

```bash
sqlite3 /home/crazykev/project/NanoClaw/store/messages.db \
  "SELECT name, folder,
   CASE WHEN privileged_access = 1 THEN 'Yes' ELSE 'No' END as 'Privileged'
   FROM registered_groups;"
```

### 2. Enable Privileged Access for a Group

```bash
sqlite3 /home/crazykev/project/NanoClaw/store/messages.db \
  "UPDATE registered_groups
   SET privileged_access = 1
   WHERE folder = 'your-group-folder';"
```

### 3. Disable Privileged Access

```bash
sqlite3 /home/crazykev/project/NanoClaw/store/messages.db \
  "UPDATE registered_groups
   SET privileged_access = 0
   WHERE folder = 'your-group-folder';"
```

### 4. Restart Service to Apply Changes

```bash
systemctl --user restart nanoclaw
```

## Mount Allowlist

Privileged mounts require paths to be allowed in the mount allowlist:

**File**: `~/.config/nanoclaw/mount-allowlist.json`

```json
{
  "allowedRoots": [
    {
      "path": "/home/crazykev/project",
      "allowReadWrite": true,
      "description": "Development projects"
    },
    {
      "path": "~/.ssh",
      "allowReadWrite": false,
      "description": "SSH keys (read-only)"
    },
    {
      "path": "~/.kube",
      "allowReadWrite": false,
      "description": "Kubernetes config (read-only)"
    },
    {
      "path": "~/.docker",
      "allowReadWrite": false,
      "description": "Docker config (read-only)"
    },
    {
      "path": "/var/run",
      "allowReadWrite": true,
      "description": "Docker socket"
    }
  ],
  "blockedPatterns": [],
  "nonMainReadOnly": true
}
```

## How It Works

### Main Group vs Privileged Groups

- **Main group**: The primary management group (usually your main WhatsApp group)
  - Automatically gets privileged access
  - Can manage NanoClaw itself

- **Privileged groups**: Groups with `privileged_access = 1`
  - Get same Docker/SSH/kubectl mounts as main group
  - Configured per-group via database flag
  - Examples: DevOps channels, deployment groups

### Non-Privileged Groups

Groups without privileged access:
- Get basic tools (git, curl, etc.)
- Cannot access Docker socket, SSH keys, or kubectl
- Safer for less trusted channels

## Example: Configuring a DevOps Channel

Let's configure the `internal-service-ops` Slack channel:

```bash
# 1. Enable privileged access
sqlite3 /home/crazykev/project/NanoClaw/store/messages.db \
  "UPDATE registered_groups
   SET privileged_access = 1
   WHERE folder = 'internal-service-ops';"

# 2. Restart service
systemctl --user restart nanoclaw

# 3. Verify in the channel
# Send message: "@Andy docker ps"
# Expected: List of running containers
```

## Verification Commands

Test the following in your privileged channel:

```bash
# Docker
@Andy docker ps
@Andy docker --version

# kubectl
@Andy kubectl version --client
@Andy kubectl config current-context

# SSH
@Andy ls -la ~/.ssh/
@Andy ssh -T git@github.com

# Git with SSH
@Andy git clone git@github.com:your-org/private-repo.git
```

## Troubleshooting

### Tools Not Available

If tools aren't working:

1. **Check privileged_access flag**:
   ```bash
   sqlite3 /home/crazykev/project/NanoClaw/store/messages.db \
     "SELECT privileged_access FROM registered_groups WHERE folder = 'your-group';"
   ```

2. **Check mount allowlist**:
   - Ensure `~/.config/nanoclaw/mount-allowlist.json` exists
   - Verify all required paths are allowed

3. **Check file existence**:
   ```bash
   ls -la ~/.ssh
   ls -la ~/.kube
   ls -la /var/run/docker.sock
   ```

4. **Check service logs**:
   ```bash
   journalctl --user -u nanoclaw -f
   ```

5. **Restart service**:
   ```bash
   systemctl --user restart nanoclaw
   ```

### Permission Denied

- Docker socket: Check that `/var/run/docker.sock` has correct GID
- SSH keys: Should work read-only (permission denied is expected on private repo without keys configured)
- kubectl: Check `~/.kube/config` permissions

## Best Practices

1. **Minimal Privilege**: Only enable for groups that truly need DevOps access
2. **Audit**: Regularly review which groups have privileged access
3. **Trust**: Only grant to channels you control and trust
4. **Documentation**: Update each group's CLAUDE.md with their capabilities
5. **Monitoring**: Watch logs for suspicious activity

## Advanced: Programmatic Management

You can manage privileged access from the main group using IPC or by having the agent modify the database directly (main group only).

Example agent command:
```bash
@Andy Run this in Bash:
sqlite3 /home/crazykev/project/NanoClaw/store/messages.db \
  "UPDATE registered_groups SET privileged_access = 1 WHERE folder = 'new-devops-channel';"
systemctl --user restart nanoclaw
```

## See Also

- [REQUIREMENTS.md](REQUIREMENTS.md) - Architecture decisions
- [README.md](../README.md) - Main documentation
- [SECURITY.md](../SECURITY.md) - Security considerations
