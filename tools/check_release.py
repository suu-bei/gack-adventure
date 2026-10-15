from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,hashlib,sys
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'data/release.json').read_text());errors=[]
for name,expected in manifest['files'].items():
 f=ROOT/name
 if not f.is_file():errors.append('MISSING '+name)
 elif hashlib.sha256(f.read_bytes()).hexdigest()!=expected:errors.append('CHANGED '+name)
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  for key in (['src'] if tag in ['script','iframe','img','source','video'] else ['href'] if tag=='link' else []):
   if a.get(key):self.links.append(a[key])
for f in [ROOT/'index.html',*(ROOT/'days').glob('*.html'),*(ROOT/'players').glob('*.html')]:
 parser=Links();parser.feed(f.read_text());base=ROOT if f.parent.name=='days' else f.parent
 for link in parser.links:
  u=urlsplit(link)
  if u.scheme or u.netloc or not u.path:continue
  target=(base/unquote(u.path)).resolve()
  if not target.is_file():errors.append('BROKEN '+str(f.relative_to(ROOT))+' -> '+link)
if errors:
 print('\n'.join(errors));sys.exit(1)
print(manifest['version']+': all '+str(len(manifest['files']))+' file hashes and HTML asset links verified')
