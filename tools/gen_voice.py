#!/usr/bin/env python3
"""Gera as falas do Marmita (assets/voice/<id>.mp3) a partir de src/data/lines.js.

Usa o Piper TTS (neural, offline) com a voz pt_BR "faber" (dataset CC0).

    pip install piper-tts
    B=https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium
    curl -LO $B/pt_BR-faber-medium.onnx -O $B/pt_BR-faber-medium.onnx.json
    python3 tools/gen_voice.py pt_BR-faber-medium.onnx [id ...]

Requer ffmpeg (com libmp3lame). Sem ids, gera apenas as falas que ainda não existem.
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'voice')

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    model = sys.argv[1]
    only = set(sys.argv[2:])
    src = open(os.path.join(ROOT, 'src', 'data', 'lines.js'), encoding='utf-8').read()
    lines = json.loads(re.search(r'/\*LINES_BEGIN\*/(.*?)/\*LINES_END\*/', src, re.S).group(1))
    os.makedirs(OUT, exist_ok=True)
    for lid, text in lines.items():
        dst = os.path.join(OUT, lid + '.mp3')
        if only and lid not in only:
            continue
        if not only and os.path.exists(dst):
            continue
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            wav = tmp.name
        # noise/noise-w mais altos = entonação mais viva e menos monótona
        subprocess.run([sys.executable, '-m', 'piper', '-m', model, '-f', wav,
                        '--length-scale', '0.98', '--noise-scale', '0.82',
                        '--noise-w-scale', '0.95', '--sentence-silence', '0.22'],
                       input=text.encode('utf-8'), check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # leve subida de tom (personagem simpático), compressão suave e normalização
        af = ('asetrate=22050*1.07,aresample=44100,atempo=0.965,'
              'highpass=f=90,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,'
              'loudnorm=I=-15:TP=-1.5:LRA=9')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', af,
                        '-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '64k', dst],
                       check=True)
        os.unlink(wav)
        print('ok', lid)

if __name__ == '__main__':
    main()
