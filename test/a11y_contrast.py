"""Checks every colour pairing in every theme pack against WCAG 2.1 AA.
Run from the repo root:  python3 test/a11y_contrast.py"""
import re, sys, json, pathlib

THEMES_JS = pathlib.Path(__file__).resolve().parent.parent / 'www' / 'app' / 'themes.js'

def hexrgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c*2 for c in h)
    return tuple(int(h[i:i+2], 16) for i in (0,2,4))
def lin(c):
    c = c/255
    return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055) ** 2.4
def L(rgb):
    r,g,b = (lin(c) for c in rgb)
    return 0.2126*r + 0.7152*g + 0.0722*b
def ratio(fg, bg):
    a, b = L(hexrgb(fg)), L(hexrgb(bg))
    hi, lo = max(a,b), min(a,b)
    return (hi+0.05)/(lo+0.05)
def over(fg, alpha, bg):
    f, b = hexrgb(fg), hexrgb(bg)
    return '#%02X%02X%02X' % tuple(round(alpha*f[i] + (1-alpha)*b[i]) for i in range(3))

src = THEMES_JS.read_text()
themes = {}
for name, block in re.findall(r"(\w+): \{\s*\n\s*name: '[^']+', blurb: '[^']*',\s*\n\s*vars: \{(.*?)\}", src, re.S):
    themes[name] = dict(re.findall(r"'(--[\w-]+)':'([^']+)'", block))

CHECKS = [
    ('body text',            '--ink',        'bg',   4.5),
    ('secondary text',       '--muted',      'bg',   4.5),
    ('body text on a card',  '--ink',        'card', 4.5),
    ('secondary on a card',  '--muted',      'card', 4.5),
    ('accent text',          '--glow-ink',   'card', 4.5),
    ('success text',         '--leaf-ink',   'card', 4.5),
    ('alert text',           '--bloom-ink',  'card', 4.5),
    ('borders',              '--edge-strong','card', 3.0),
    ('focus ring',           '--focus',      'bg',   3.0),
    ('button label on fill', '--btn-ink',    'glow', 4.5),
]
fails = 0
for name, v in themes.items():
    card = over(v['--sky-1'], .88, v['--sky-3'])
    ctx = { 'bg': v['--sky-1'], 'card': card, 'glow': v['--glow'] }
    bad = []
    for label, key, bgk, mn in CHECKS:
        r = ratio(v[key], ctx[bgk])
        if r < mn: bad.append('%s %.2f (needs %.1f)' % (label, r, mn))
    print('%-10s %s' % (name, 'pass' if not bad else 'FAIL — ' + '; '.join(bad)))
    fails += len(bad)
print('\n%d failures across %d theme packs' % (fails, len(themes)))
sys.exit(1 if fails else 0)
