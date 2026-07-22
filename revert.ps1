$files = @(
    "functions/utils/auth.js",
    "functions/api/_middleware.js",
    "functions/api/[table].js",
    "functions/api/quiz/[id]/submit.js",
    "functions/api/user/revision/submit.js",
    "functions/api/user/revision/stats.js",
    "functions/api/user/revision/index.js",
    "functions/utils/rebuild.js",
    "src/supabase.js",
    "src/pages/RevisionPage.jsx",
    "src/revision/revision-controller.js",
    "src/api/revision.js",
    "src/pages/ResultPage.jsx",
    "src/pages/QuizPage.jsx",
    "src/pages/SubjectPage.jsx",
    "src/pages/LoginPage.jsx",
    "src/pages/AdminPage.jsx",
    "src/App.jsx"
)

foreach ($f in $files) {
    Write-Host "Reverting $f"
    git checkout $f 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to checkout $f, deleting it since it's probably untracked"
        Remove-Item -ErrorAction SilentlyContinue $f
    }
}
