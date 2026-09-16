$htmlFiles = Get-ChildItem -Path . -Filter *.html

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw

    if ($content -notmatch "google_translate_element") {
        $injectHead = @"
<style>
body { top: 0 !important; }
.skiptranslate { display: none !important; }
</style>
<script type="text/javascript">
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
}
</script>
<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
</head>
"@
        
        $injectBody = @"
<body>
<div id="google_translate_element" style="display:none;"></div>
"@

        $content = $content -replace "</head>", $injectHead
        $content = $content -replace "<body(.*?)>", "<body`$1>`n<div id=`"google_translate_element`" style=`"display:none;`"></div>"
        
        Set-Content -Path $file.FullName -Value $content
    }
}
