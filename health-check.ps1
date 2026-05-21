# Chạy mỗi 5 phút, tự restart nếu có container down
$containers = docker-compose -f D:\Code\final\docker-compose.yml ps --services
foreach ($c in $containers) {
    $status = docker inspect --format='{{.State.Status}}' "final-$c-1"
    if ($status -ne "running") {
        Write-Host "Container $c down, restarting..."
        docker-compose -f D:\Code\final\docker-compose.yml up -d
        break
    }
}