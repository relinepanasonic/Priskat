$files = @(
    "src\app\(public)\camp\[slug]\crew\page.tsx",
    "src\app\(public)\camp\[slug]\ongoing\[camp_id]\page.tsx",
    "src\app\(public)\news\blog\[slug]\page.tsx",
    "src\app\(public)\news\blog\page.tsx",
    "src\app\(public)\news\schedule\[province]\[regency]\[church]\page.tsx",
    "src\app\(public)\profile\page.tsx"
)

foreach ($f in $files) {
    if (Test-Path -LiteralPath $f) {
        $content = Get-Content -LiteralPath $f -Raw
        if ($content -notmatch 'import \{ .*formatDate.* \} from "@/lib/utils"') {
            $content = $content -replace 'import \{ .* \} from "lucide-react";', "${0}
import { formatDate } from "@/lib/utils";"
            
            # If lucide-react isn't there, try to put it after next/link
            if ($content -notmatch 'import \{ formatDate \} from "@/lib/utils"') {
                $content = $content -replace 'import Link from "next/link";', "${0}
import { formatDate } from "@/lib/utils";"
            }
            # Or after supabase
            if ($content -notmatch 'import \{ formatDate \} from "@/lib/utils"') {
                $content = $content -replace 'import \{ createClient \} from "@/lib/supabase/server";', "${0}
import { formatDate } from "@/lib/utils";"
            }
        }
        
        $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleDateString\(([^)]*)\)', 'formatDate()'
        $content | Set-Content -LiteralPath $f -NoNewline
        Write-Host "Fixed $f"
    }
}
