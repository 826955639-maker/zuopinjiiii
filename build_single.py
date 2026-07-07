import base64, re, os
html=open('index.html',encoding='utf-8').read()
css=open('assets/css/style.css',encoding='utf-8').read()
js=open('assets/js/main.js',encoding='utf-8').read()

def datauri(path):
    b=open(path,'rb').read(); ext=path.rsplit('.',1)[1].lower()
    mime='image/jpeg' if ext in('jpg','jpeg') else 'image/png'
    return 'data:%s;base64,%s'%(mime,base64.b64encode(b).decode())

# every asset image referenced directly in html
img_paths=set(re.findall(r'assets/(?:img|cmf|hmi)/[A-Za-z0-9_\-]+\.jpg', html))
# album = CMF 12 + HMI 9 (order matters for flipbook)
album=['assets/cmf/slide-%02d.jpg'%i for i in range(1,13)]+['assets/hmi/screen-%02d.jpg'%i for i in range(1,10)]
for p in album: img_paths.add(p)

uri={p:datauri(p) for p in sorted(img_paths)}
for p,u in uri.items(): html=html.replace(p,u)

html=html.replace('<link rel="stylesheet" href="assets/css/style.css">','<style>\n'+css+'\n</style>')
albumjs='window.__ALBUM__=['+','.join('"%s"'%uri[p] for p in album)+'];\n'
html=html.replace('<script src="assets/js/main.js"></script>','<script>\n'+albumjs+js+'\n</script>')

open('苏麻离青.html','w',encoding='utf-8').write(html)
print('rebuilt', os.path.getsize('苏麻离青.html')//1024,'KB', '| album pages:', len(album))
