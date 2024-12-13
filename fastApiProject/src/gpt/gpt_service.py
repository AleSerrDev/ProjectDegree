import os
import json
from transformers import GPT2Tokenizer, GPT2LMHeadModel, Trainer, TrainingArguments, pipeline
from datasets import load_dataset
from fastapi import HTTPException, UploadFile
import shutil


class GPTFineTuneService:
    def fine_tune_gpt2(self, dataset_path):
        model = GPT2LMHeadModel.from_pretrained('gpt2')
        tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
        if tokenizer.pad_token is None:
            tokenizer.add_special_tokens({'pad_token': tokenizer.eos_token})

        dataset = load_dataset('text', data_files={'train': dataset_path})

        def preprocess_function(examples):
            inputs = tokenizer(examples['text'], truncation=True, padding="max_length", max_length=128)
            inputs["labels"] = inputs["input_ids"].copy()
            return inputs

        tokenized_datasets = dataset.map(preprocess_function, batched=True)

        training_args = TrainingArguments(
            output_dir="./results",
            evaluation_strategy="steps",
            eval_steps=100,
            per_device_train_batch_size=4,
            per_device_eval_batch_size=4,
            num_train_epochs=5,
            weight_decay=0.01,
            logging_dir='./logs',
            logging_steps=50,
            save_steps=500,
            save_total_limit=3,
            load_best_model_at_end=True,
            warmup_steps=200,
            learning_rate=5e-5
        )

        model.resize_token_embeddings(len(tokenizer))
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=tokenized_datasets['train'],
            eval_dataset=tokenized_datasets['train']
        )
        trainer.train()
        model.save_pretrained("./fine_tuned_gpt2")
        tokenizer.save_pretrained("./fine_tuned_gpt2")

        return "Fine-tuning completed and model saved."

    async def handle_train_dataset(self, file: UploadFile):
        try:
            dataset_path = f"./datasets/{file.filename}"
            os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
            with open(dataset_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            result = self.fine_tune_gpt2(dataset_path)
            os.remove(dataset_path)

            return {"message": result}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during training: {e}")
