"""Answer every eval prompt with a local (fine-tuned) model, for run_evals.py --answers.

    python ai-training/scripts/local_answers.py --adapter ai-training/runs/dosa-lora
    python ai-training/scripts/run_evals.py --answers ai-training/data/answers-dosa-lora.jsonl

Run it once with --no-adapter on the same base model to get the "before" score.
"""

from __future__ import annotations

import argparse

import torch
from peft import AutoPeftModelForCausalLM
from transformers import AutoModelForCausalLM, AutoTokenizer

from common import DATA_DIR, read_jsonl, system_prompt, write_jsonl


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--adapter", help="folder written by finetune_lora.py")
    ap.add_argument("--base", default="Qwen/Qwen2.5-1.5B-Instruct", help="used with --no-adapter")
    ap.add_argument("--no-adapter", action="store_true")
    ap.add_argument("--max-new-tokens", type=int, default=1024)
    args = ap.parse_args()

    if args.no_adapter:
        name, tag = args.base, "base"
        model = AutoModelForCausalLM.from_pretrained(name, torch_dtype=torch.bfloat16, device_map="auto")
    else:
        name, tag = args.adapter, args.adapter.rstrip("/").split("/")[-1]
        model = AutoPeftModelForCausalLM.from_pretrained(name, torch_dtype=torch.bfloat16, device_map="auto")
    tok = AutoTokenizer.from_pretrained(name)

    rows = []
    for item in read_jsonl(DATA_DIR / "evals.jsonl"):
        chat = [{"role": "system", "content": system_prompt()}, {"role": "user", "content": item["prompt"]}]
        ids = tok.apply_chat_template(chat, add_generation_prompt=True, return_tensors="pt").to(model.device)
        out = model.generate(ids, max_new_tokens=args.max_new_tokens, do_sample=False)
        rows.append({"id": item["id"], "answer": tok.decode(out[0][ids.shape[1]:], skip_special_tokens=True)})
        print(item["id"])

    path = DATA_DIR / f"answers-{tag}.jsonl"
    write_jsonl(path, rows)
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
