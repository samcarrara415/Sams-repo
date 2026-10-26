"""Fine-tune an open-weights model on the academy dataset with LoRA (level 3).

    pip install -r ai-training/requirements-finetune.txt
    python ai-training/scripts/build_dataset.py
    python ai-training/scripts/finetune_lora.py --base Qwen/Qwen2.5-1.5B-Instruct --epochs 3

Needs an NVIDIA GPU (a free Colab/Kaggle T4 is enough for a 1.5B model; use
--base with a 7-8B model on a 24 GB card). Output goes to ai-training/runs/<name>/.
Then: python ai-training/scripts/local_answers.py --adapter ai-training/runs/<name>
and score it with run_evals.py --answers.

Hosted Claude models are not fine-tuned this way. For Claude, the "training"
is the system prompt + lessons + skills (levels 1, 2 and 4 in the README).
"""

from __future__ import annotations

import argparse
from pathlib import Path

from datasets import load_dataset
from peft import LoraConfig
from trl import SFTConfig, SFTTrainer

from common import AI_ROOT, DATA_DIR


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="Qwen/Qwen2.5-1.5B-Instruct", help="any chat model on Hugging Face")
    ap.add_argument("--name", default="dosa-lora")
    ap.add_argument("--epochs", type=float, default=3)
    ap.add_argument("--lr", type=float, default=2e-4)
    ap.add_argument("--rank", type=int, default=16)
    ap.add_argument("--max-length", type=int, default=4096)
    args = ap.parse_args()

    data = load_dataset("json", data_files={
        "train": str(DATA_DIR / "train.jsonl"),
        "validation": str(DATA_DIR / "val.jsonl"),
    })
    # Keep only the chat column so the trainer treats rows as conversations.
    data = data.remove_columns([c for c in data["train"].column_names if c != "messages"])

    out = Path(AI_ROOT / "runs" / args.name)
    trainer = SFTTrainer(
        model=args.base,
        train_dataset=data["train"],
        eval_dataset=data["validation"],
        peft_config=LoraConfig(
            r=args.rank, lora_alpha=args.rank * 2, lora_dropout=0.05,
            target_modules="all-linear", task_type="CAUSAL_LM",
        ),
        args=SFTConfig(
            output_dir=str(out),
            num_train_epochs=args.epochs,
            learning_rate=args.lr,
            per_device_train_batch_size=2,
            gradient_accumulation_steps=8,
            max_length=args.max_length,
            logging_steps=10,
            eval_strategy="epoch",
            save_strategy="epoch",
            bf16=True,
            report_to="none",
        ),
    )
    trainer.train()
    trainer.save_model(str(out))
    print(f"adapter saved to {out}")


if __name__ == "__main__":
    main()
