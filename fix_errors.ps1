
# ---- Fix HotelMarkupRules.tsx ----
$path = "src\components\Integrations\HotelMarkupRules.tsx"
$c = Get-Content $path -Raw

# 1. Remove unused Papa import
$c = $c -replace "import Papa from 'papaparse';\r\n", ""

# 2. Remove Copy from lucide imports (keep Save + rest)
$c = $c -replace "import \{ Copy, Download, Edit2, Plus, Search, Trash2, Upload, X \} from 'lucide-react';", "import { Download, Edit2, Plus, Save, Search, Trash2, Upload, X } from 'lucide-react';"

# 3. Remove unused DealImportPreview type
$c = $c -replace "type DealImportPreview = \{ rules: HotelMarkupRule\[\]; errors: string\[\]; warnings: string\[\] \};\r\n", ""

# 4. Fix line 59 (was line 59/60): query.city and query.country are string | undefined, locationMatches takes string | null
# locationMatches(rule.city, query.city ?? null) etc
$c = $c -replace "if \(rule\.city && !locationMatches\(rule\.city, query\.city\)\) return false;", "if (rule.city && !locationMatches(rule.city, query.city ?? null)) return false;"
$c = $c -replace "if \(rule\.country && !locationMatches\(rule\.country, query\.country\)\) return false;", "if (rule.country && !locationMatches(rule.country, query.country ?? null)) return false;"

# 5. Fix openEditor line 109: spreading id/createdAt/updatedAt as unknown - use explicit Omit spread
$c = $c -replace "setDraft\(existing \? \{ \.\.\.existing, id: undefined as any, createdAt: undefined as any, updatedAt: undefined as any \} : blankDraft\(\)\);", "setDraft(existing ? (({ id: _id, createdAt: _ca, updatedAt: _ua, ...rest }) => rest)(existing) : blankDraft());"

# 6. Remove unused loadRules const
$c = $c -replace "  const loadRules = \(\) => \{ setRules\(readHotelMarkupRules\(1\)\); \};\r\n", ""

Set-Content $path $c -NoNewline
Write-Host "HotelMarkupRules.tsx fixed"

# ---- Fix AirlineDeals.tsx ----
$path2 = "src\pages\Flights\AirlineDeals.tsx"
$c2 = Get-Content $path2 -Raw

# Fix duplicate 'image' key in blankDraft (line 59 has image: '', imageAlt: '' plus earlier image: '')
# Remove the first occurrence of "image: ''," that appears before imageAlt
$c2 = $c2 -replace "featured: false,\r\n    displayOrder: 0, internalNotes: '', image: '', imageAlt", "featured: false,`r`n    displayOrder: 0, internalNotes: '', imageAlt"

# Fix fares.adult.baseFare and .taxes possibly undefined (line 568): add ?? 0
$c2 = $c2 -replace "deal\.fares\.adult\.baseFare \+ deal\.fares\.adult\.taxes", "(deal.fares.adult.baseFare ?? 0) + (deal.fares.adult.taxes ?? 0)"

Set-Content $path2 $c2 -NoNewline
Write-Host "AirlineDeals.tsx fixed"

# ---- Fix modules.tsx ----
$path3 = "src\pages\Integrations\modules.tsx"
$c3 = Get-Content $path3 -Raw

# Remove or prefix unused isFlightModule with _
$c3 = $c3 -replace "  const isFlightModule = activeModule\?\.category === 'Flights';", "  const _isFlightModule = activeModule?.category === 'Flights';"

Set-Content $path3 $c3 -NoNewline
Write-Host "modules.tsx fixed"

# ---- Fix PackageEdit.tsx ----
$path4 = "src\pages\Packages\PackageEdit.tsx"
$c4 = Get-Content $path4 -Raw

# sectionRefs is Record<string, HTMLDivElement | null> but code calls ref?.current
# Fix: change type to Record<string, HTMLDivElement | null> and use ref directly (not ref.current)
$c4 = $c4 -replace "        const el = ref\?\.current;", "        const el = ref;"

Set-Content $path4 $c4 -NoNewline
Write-Host "PackageEdit.tsx fixed"

Write-Host "All done."

