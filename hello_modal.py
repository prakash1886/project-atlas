import modal

# Define the Modal App
app = modal.App("example-hello-world")

# Define a function to run in the cloud
@app.function()
def square(i):
    print(f"Squaring {i} in the cloud...")
    return i * i

# Define the local entrypoint to trigger execution
@app.local_entrypoint()
def main():
    # Run the function remotely on Modal
    result = square.remote(10)
    print(f"Result returned to local machine: {result}")
