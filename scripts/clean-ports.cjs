const { spawnSync } = require("child_process");

const ports = [5001, 5173, 5174, 5175, 5176];

if (process.platform !== "win32") {
  console.log("Port cleanup is only configured for Windows.");
  process.exit(0);
}

const portList = ports.join(",");
const command = `
  $ports = @(${portList});
  $pids = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $ports -contains $_.LocalPort } |
    Select-Object -ExpandProperty OwningProcess -Unique;
  if ($pids) {
    Stop-Process -Id $pids -Force -ErrorAction SilentlyContinue;
    Write-Output ('Cleared stale listeners on dev ports. Process ids: ' + ($pids -join ','));
  } else {
    Write-Output 'No stale listeners found on dev ports.';
  }
`;

const result = spawnSync("powershell", ["-NoProfile", "-Command", command], {
  encoding: "utf8"
});

process.stdout.write(result.stdout || "");
process.stderr.write(result.stderr || "");
process.exit(result.status ?? 0);
