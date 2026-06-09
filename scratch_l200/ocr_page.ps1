# Define required namespaces
using namespace Windows.Storage
using namespace Windows.Graphics.Imaging
using namespace Windows.Media.Ocr

# 1. Load necessary WinRT assemblies
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Foundation, ContentType = WindowsRuntime]

# 2. Setup helper for Asynchronous calls
$getAwaiterBaseMethod = [WindowsRuntimeSystemExtensions].GetMember('GetAwaiter').Where({ 
    $PSItem.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
}, 'First')[0]

function Await {
    param($AsyncTask, [Type]$ResultType)
    if ($AsyncTask -eq $null) {
        throw "AsyncTask is null"
    }
    $getAwaiterBaseMethod.MakeGenericMethod($ResultType).Invoke($null, @($AsyncTask)).GetResult()
}

# 3. Initialize OCR Engine
$ocrEngine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($ocrEngine -eq $null) {
    Write-Error "Could not initialize OCR engine. Make sure English OCR language pack is installed."
    exit
}

# 4. Process Image
$imagePath = "c:\Users\kosne\OneDrive\Desktop\of all\scratch_l200\pages\page_1.png"

$asyncFile = [StorageFile]::GetFileFromPathAsync($imagePath)
$file = Await -AsyncTask $asyncFile -ResultType ([Windows.Storage.StorageFile])

$asyncStream = $file.OpenAsync(0)
$stream = Await -AsyncTask $asyncStream -ResultType ([Windows.Storage.Streams.IRandomAccessStream])

$asyncDecoder = [BitmapDecoder]::CreateAsync($stream)
$decoder = Await -AsyncTask $asyncDecoder -ResultType ([Windows.Graphics.Imaging.BitmapDecoder])

$asyncBitmap = $decoder.GetSoftwareBitmapAsync()
$bitmap = Await -AsyncTask $asyncBitmap -ResultType ([Windows.Graphics.Imaging.SoftwareBitmap])

# 5. Run OCR
$asyncOcr = $ocrEngine.RecognizeAsync($bitmap)
$ocrResult = Await -AsyncTask $asyncOcr -ResultType ([Windows.Media.Ocr.OcrResult])

# Output the lines
foreach ($line in $ocrResult.Lines) {
    Write-Output $line.Text
}
