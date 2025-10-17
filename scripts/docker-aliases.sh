# Common Docker and Docker Compose aliases.
# Source this file from your shell profile, e.g.:
#   source "$(pwd)/scripts/docker-aliases.sh"

alias d="docker"
alias dc="docker compose"
alias dps="docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
alias dimages="docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'"
alias dlogs="docker logs"
alias dclean="docker system prune"
alias dclean-volumes="docker system prune --volumes"  # Warning: removes ALL unused volumes

alias dcu="docker compose up --build"
alias dcd="docker compose down"
alias dcrestart='docker compose down && docker compose up --build'
alias dcl="docker compose logs -f"
alias dcs="docker compose ps"
alias dce="docker compose exec"

# Only remove dangling images (safer than removing all unused images)
alias dprune="docker image prune"
