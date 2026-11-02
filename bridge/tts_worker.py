#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ĐỢT 21 — Worker TTS local cho bridge Thiền Đường Tịnh Tâm (tiến trình
thường trú do bridge/server.js khởi động lười ở yêu cầu /tts đầu tiên).

Giao thức JSON-lines qua stdin/stdout:
  - Khởi động xong in 1 dòng: {"ready": true, "engine": "..."}
    (hoặc {"ready": false, "error": "..."} rồi thoát).
  - Mỗi yêu cầu 1 dòng: {"id": N, "text": "...", "out": "/duong/dan/file.wav"}
  - Mỗi đáp 1 dòng:     {"id": N, "ok": true} | {"id": N, "ok": false, "error": "..."}

Engine theo thứ tự ưu tiên (tự viết, học CÁCH của repo tham khảo):
  1) ZeroTTS (zeroweight-ai/ZeroTTS, ONNX local, giọng mặc định "maichi") —
     ĐÃ KIỂM CHỨNG trên VM này: nạp model 11,7s, đọc câu ~55 ký tự hết 11,6s
     (8 giọng kèm theo model: maichi, baotrang, giahuy, hamy, huuduc,
     kimoanh, quangminh, tiendat). LƯU Ý KỸ THUẬT: nạp qua cache HuggingFace
     (symlink blobs) bị onnxruntime từ chối ("External data path escapes
     model directory") → phải dùng BẢN SAO THẬT của model tại
     bridge/tts-models/zerotts/ (hoặc $TDTT_ZEROTTS_DIR). Không có thư mục
     này → tự bỏ qua ZeroTTS, không lỗi.
  2) Piper vi_VN-vais1000-medium (offline) — dự phòng luôn chạy được
     (nạp 2,9s, đọc 1 câu ~1,2s); model tìm theo: $TDTT_PIPER_MODEL →
     bridge/tts-models/ → bản tại lemo-opuscar (máy này).
  Ép chọn engine bằng $TDTT_TTS_ENGINE=zerotts|piper; đổi giọng ZeroTTS
  bằng $TDTT_TTS_VOICE=<tên giọng>.
Cache file âm theo nội dung nằm ở phía bridge (tts-cache/), worker chỉ tổng hợp.
"""
import sys
import os
import json
import wave


def emit(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
    sys.stdout.flush()


class ZeroEngine:
    name = "zerotts"

    def __init__(self):
        from zerotts import ZeroTTS
        here = os.path.dirname(os.path.abspath(__file__))
        cands = [
            os.environ.get("TDTT_ZEROTTS_DIR"),
            os.path.join(here, "tts-models", "zerotts"),
        ]
        model_dir = next((c for c in cands if c and os.path.isdir(c)), None)
        if not model_dir:
            raise RuntimeError("chưa có thư mục model ZeroTTS (bridge/tts-models/zerotts)")
        self.tts = ZeroTTS(model_dir=model_dir, intra_op_num_threads=3)
        voices = self.tts.list_voices() or []
        if not voices:
            raise RuntimeError("ZeroTTS: thư mục model không có giọng nào")
        want = os.environ.get("TDTT_TTS_VOICE") or "maichi"
        self.voice = want if want in voices else voices[0]
        self.name = "zerotts:" + self.voice

    def synth(self, text, out):
        audio = self.tts.synthesize(text, voice=self.voice)
        self.tts.save_audio(audio, out)


class PiperEngine:
    name = "piper:vi_VN-vais1000-medium"

    def __init__(self):
        from piper import PiperVoice
        here = os.path.dirname(os.path.abspath(__file__))
        cands = [
            os.environ.get("TDTT_PIPER_MODEL"),
            os.path.join(here, "tts-models", "vi_VN-vais1000-medium.onnx"),
            os.path.expanduser("~/workspace/lemo-opuscar/films/ban-tin-tai-nan-2310/audio/piper/vi_VN-vais1000-medium.onnx"),
        ]
        model = next((c for c in cands if c and os.path.exists(c)), None)
        if not model:
            raise RuntimeError("không tìm thấy model Piper vi_VN-vais1000-medium.onnx")
        self.voice = PiperVoice.load(model, config_path=model + ".json")

    def synth(self, text, out):
        with wave.open(out, "wb") as wf:
            self.voice.synthesize_wav(text, wf)


def main():
    force = (os.environ.get("TDTT_TTS_ENGINE") or "").lower()
    order = [PiperEngine, ZeroEngine] if force == "piper" else [ZeroEngine, PiperEngine]
    if force == "zerotts":
        order = [ZeroEngine]
    engine = None
    errs = []
    for cls in order:
        try:
            engine = cls()
            break
        except Exception as e:  # engine này không dùng được → thử engine kế
            errs.append("%s: %s" % (cls.__name__, e))
    if engine is None:
        emit({"ready": False, "error": " | ".join(errs)})
        return
    emit({"ready": True, "engine": engine.name})
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except Exception:
            continue
        rid, text, out = req.get("id"), req.get("text") or "", req.get("out")
        try:
            if not text or not out:
                raise RuntimeError("thiếu text/out")
            engine.synth(text, out)
            emit({"id": rid, "ok": True})
        except Exception as e:
            emit({"id": rid, "ok": False, "error": str(e)})


if __name__ == "__main__":
    main()
