#!/usr/bin/env python3
"""Regenerate the root 90%-scale files from _scale-source.
Edit files inside _scale-source first, then run this script from the site root.
"""
from pathlib import Path
import re, shutil
ROOT=Path(__file__).resolve().parent
SRC=ROOT/'_scale-source'
SCALE=.9

def fmt(v):
    s=f"{v:.6f}".rstrip('0').rstrip('.')
    return '0' if s=='-0' else s
px_re=re.compile(r'(?<![\\w.-])(-?\\d*\\.?\\d+)px\\b')
xy_re=re.compile(r'(?P<prefix>\\b[xy]\\s*:\\s*)(?P<num>-?\\d+(?:\\.\\d+)?)\\b')
inner_re=re.compile(r'(window\\.innerWidth\\s*[<>]=?\\s*)(\\d+(?:\\.\\d+)?)')
scroll_re=re.compile(r'(window\\.scrollY\\s*[<>]=?\\s*)(\\d+(?:\\.\\d+)?)')
minbar_re=re.compile(r'(const\\s+minBarHeight\\s*=\\s*)(\\d+(?:\\.\\d+)?)')
for src in SRC.iterdir():
    if src.suffix not in {'.css','.js','.html'}: continue
    txt=src.read_text(encoding='utf-8')
    txt=px_re.sub(lambda m: fmt(float(m.group(1))*SCALE)+'px',txt)
    if src.suffix=='.js':
        txt=xy_re.sub(lambda m:m.group('prefix')+fmt(float(m.group('num'))*SCALE),txt)
        txt=inner_re.sub(lambda m:m.group(1)+fmt(float(m.group(2))*SCALE),txt)
        txt=scroll_re.sub(lambda m:m.group(1)+fmt(float(m.group(2))*SCALE),txt)
        txt=minbar_re.sub(lambda m:m.group(1)+fmt(float(m.group(2))*SCALE),txt)
    (ROOT/src.name).write_text(txt,encoding='utf-8')
print('Rebuilt root files at 90% design scale.')
