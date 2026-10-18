import os
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification

MODEL_NAME = "dima806/deepfake_vs_real_image_detection"
print("Loading model and processor from Hugging Face...")
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
model.eval()

print("Model loaded successfully!")
print("Labels:", model.config.id2label)
