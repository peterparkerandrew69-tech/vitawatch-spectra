import os
import sys

# Ensure backend directory is in python search path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app

app = create_app()

@app.route("/")
def home():
    return {
        "application": "VitaWatch Spectra",
        "version": "2.4.0",
        "status": "operational",
        "documentation": "/api/health"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f">> VitaWatch Spectra Server running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)