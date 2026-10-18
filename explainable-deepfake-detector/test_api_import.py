import api

print("API title:", api.app.title)
print("API version:", api.app.version)
print("Health check response:", api.health_check())
