from transformers import pipeline

class GPT2Pipeline:
    def __init__(self):
        self.pipeline = pipeline('text-generation', model='./fine_tuned_gpt2', tokenizer='./fine_tuned_gpt2')

    def generate_response(self, input_text: str):
        response = self.pipeline(input_text, max_length=300, num_return_sequences=1)[0]['generated_text']
        if "Asistente:" in response:
            return response.split("Asistente:")[1].strip()
        return response.strip()

