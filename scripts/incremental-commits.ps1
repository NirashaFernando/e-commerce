param(
    [int]$CommitCount = 30,
    [string]$Branch = "main",
    [switch]$AllowEmptyForRemaining = $true,
    [switch]$PreviewOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Keep git warnings (like line-ending notices) from being promoted to terminating errors.
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $false
}

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    $output = & git @Args
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Args -join ' ') failed."
    }
    return $output
}

function Test-ExcludedPath {
    param([string]$Path)

    if (-not $Path) { return $true }

    $normalized = $Path -replace '\\', '/'
    if ($normalized -eq '.env' -or $normalized -like '*/.env') { return $true }
    if ($normalized -eq 'node_modules' -or $normalized -like 'node_modules/*') { return $true }
    if ($normalized -like '*/node_modules' -or $normalized -like '*/node_modules/*') { return $true }

    return $false
}

function Get-EligiblePaths {
    $status = Invoke-Git status --porcelain
    $paths = @()

    foreach ($line in $status) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }

        if ($line.StartsWith("?? ")) {
            $path = $line.Substring(3).Trim()
        }
        else {
            if ($line.Length -lt 4) { continue }
            $path = $line.Substring(3).Trim()
        }

        if (-not (Test-ExcludedPath -Path $path)) {
            $paths += $path
        }
    }

    return $paths | Select-Object -Unique
}

Invoke-Git rev-parse --is-inside-work-tree | Out-Null
$currentBranch = (Invoke-Git rev-parse --abbrev-ref HEAD | Select-Object -First 1).Trim()
if ($currentBranch -ne $Branch) {
    throw "Current branch is '$currentBranch'. Switch to '$Branch' before running this script."
}

# Ensure excluded files are ignored by Git.
if (-not (Test-Path ".gitignore")) {
    "node_modules/`n**/node_modules/`n.env`n**/.env`n" | Out-File -Encoding ascii ".gitignore"
}

$ignoreContent = Get-Content ".gitignore" -Raw
$requiredIgnoreEntries = @("node_modules/", "**/node_modules/", ".env", "**/.env")
$ignoreUpdated = $false

foreach ($entry in $requiredIgnoreEntries) {
    if ($ignoreContent -notmatch [Regex]::Escape($entry)) {
        Add-Content -Path ".gitignore" -Value $entry
        $ignoreUpdated = $true
    }
}

if ($ignoreUpdated) {
    Write-Host "Updated .gitignore with required exclusions."
}

$commitsCreated = 0

if ($PreviewOnly) {
    $previewPaths = [System.Collections.Generic.List[string]]::new()
    foreach ($path in (Get-EligiblePaths)) {
        $previewPaths.Add($path)
    }

    for ($i = 1; $i -le $CommitCount; $i++) {
        if ($previewPaths.Count -gt 0) {
            $pathToCommit = $previewPaths[0]
            $previewPaths.RemoveAt(0)
            Write-Host ("[Preview] Commit {0}/{1}: {2}" -f $i, $CommitCount, $pathToCommit)
            continue
        }

        if ($AllowEmptyForRemaining) {
            Write-Host ("[Preview] Empty commit {0}/{1}" -f $i, $CommitCount)
            continue
        }

        Write-Host "[Preview] No remaining eligible changes."
        break
    }

    Write-Host "Preview complete. No commits were created."
    return
}

for ($i = 1; $i -le $CommitCount; $i++) {
    $eligiblePaths = @(Get-EligiblePaths)

    if ($eligiblePaths.Count -gt 0) {
        $pathToCommit = $eligiblePaths[0]

        Invoke-Git add -- $pathToCommit | Out-Null

        & git diff --cached --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-Host "No staged changes for '$pathToCommit'. Skipping."
            continue
        }

        $message = "chore: incremental commit $i/$CommitCount ($pathToCommit)"
        Invoke-Git commit -m $message | Out-Null
        $commitsCreated++

        Write-Host "Created commit $i/$CommitCount for $pathToCommit"
        continue
    }

    if ($AllowEmptyForRemaining) {

        $message = "chore: incremental checkpoint $i/$CommitCount"
        Invoke-Git commit --allow-empty -m $message | Out-Null
        $commitsCreated++

        Write-Host "Created empty commit $i/$CommitCount"
        continue
    }

    Write-Host "No remaining eligible changes. Stopping at commit $($i - 1)."
    break
}

Write-Host "Done. Created $commitsCreated commit(s)."
