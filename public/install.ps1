$url = $args[0]
$token = $args[1]
$type = $args[2]
$cluster_id = $args[3]

Add-Type -AssemblyName System.IO.Compression.FileSystem
function Unzip
{
    param([string]$zipfile, [string]$outpath)

    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipfile, $outpath)
}

function Check-Command($cmdname)
{
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

if (Check-Command -cmdname 'node')
{
    (new-object System.Net.WebClient).DownloadFile($url + "/corona.zip", "C:/corona.zip");
    $strFolderName = "c:/corona"
    If (Test-Path $strFolderName){
    	Remove-Item $strFolderName -recurse
    }
    Unzip c:\corona.zip c:\corona
    node c:\corona\corona\index.js $token $type $cluster_id
}
else
{
    "Cannot find nodejs environment! Please install nodejs first."
}

