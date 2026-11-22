import asyncio
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
TEXT_FILE = ROOT / "content" / "voiceover.txt"
OUTPUT_FILE = ROOT / "public" / "voiceover.mp3"
VOICE = "fa-IR-FaridNeural"

async def main():
    text = TEXT_FILE.read_text(encoding="utf-8").strip()
    if not text:
        raise SystemExit("فایل content/voiceover.txt خالی است.")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(str(OUTPUT_FILE))
    print(f"صدای فارسی ساخته شد: {OUTPUT_FILE}")
    print(f"گوینده: {VOICE}")

if __name__ == "__main__":
    asyncio.run(main())
