from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
VERSION=re.search(r'RELEASE_VERSION\s*=\s*"([^"]+)"',(ROOT/'js/config.js').read_text()).group(1)
ORDER=['credits/content.js','js/config.js','js/state.js','js/stickers.js','js/media.js','js/day-loader.js','js/journal.js','js/navigation.js','js/bootstrap.js']
def digest(data):return hashlib.sha256(data).hexdigest()
def asset(label,extension,data):
 path=f'assets/{label}.{digest(data)[:12]}.{extension}'
 (ROOT/path).parent.mkdir(exist_ok=True)
 (ROOT/path).write_bytes(data)
 return path
app=asset('app','js',b'\n;\n'.join((ROOT/p).read_bytes() for p in ORDER))
style=asset('site','css',(ROOT/'css/style.css').read_bytes()+b'\n'+(ROOT/'css/day-content.css').read_bytes()+b'\n'+(ROOT/'css/runtime.css').read_bytes())
player=asset('native-player','js',(ROOT/'js/native-player.js').read_bytes())
for generated in (ROOT/'assets').iterdir():
 if re.fullmatch(r'(app|site|native-player)\.[a-f0-9]{12}\.(js|css)',generated.name) and generated.relative_to(ROOT).as_posix() not in {app,style,player}:
  generated.unlink()
index=(ROOT/'index.html').read_text()
index=re.sub(r'<script\b[^>]*src="https://platform\.(?:x|twitter)\.com/widgets.js"[^>]*></script>','',index)
index=re.sub(r'<link rel="stylesheet"[^>]+>','',index)
index=index.replace('</head>',f'<meta name="gack-release" content="{VERSION}"><link rel="stylesheet" href="{style}"></head>')
# Remove only this app's old scripts; the external X widget stays as-is.
index=re.sub(r'<script src="(?:credits/|js/|assets/)[^"]+"[^>]*></script>\s*','',index)
index=re.sub(r'<meta name="gack-release"[^>]*>','',index,count=1) if index.count('name="gack-release"')>1 else index
index=index.replace('</body>',f'<script src="{app}"></script></body>')
index=re.sub(r'<title>.*?</title>',f'<title>Journey with Gack · {VERSION}</title>',index)
(ROOT/'index.html').write_text(index)
html=(ROOT/'players/native-video.html').read_text()
html=re.sub(r'<script src="(?:../js/native-player.js|../assets/native-player\.[^"]+)"[^>]*></script>',f'<script src="../{player}"></script>',html)
(ROOT/'players/native-video.html').write_text(html)
manifest={'version':VERSION,'source_commit':'160ffc9a5e5819bede791d8a88ea8421abe94603','app':app,'css':style,'player':player,'files':{}}
for path in sorted(ROOT.rglob('*')):
 if path.is_file() and path.relative_to(ROOT).parts[0] not in {'docs','tools','assets'} and path.relative_to(ROOT).as_posix()!='data/release.json':
  manifest['files'][path.relative_to(ROOT).as_posix()]=digest(path.read_bytes())
for path in [app,style,player]:manifest['files'][path]=digest((ROOT/path).read_bytes())
(ROOT/'data').mkdir(exist_ok=True)
(ROOT/'data/release.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Built',VERSION,app,style,player)
