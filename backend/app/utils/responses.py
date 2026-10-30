from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    payload = {
        "status": "success",
        "message": message,
        "data": data
    }
    return jsonify(payload), status_code

def error_response(message="An error occurred", errors=None, status_code=400):
    payload = {
        "status": "error",
        "message": message
    }
    if errors is not None:
        payload["errors"] = errors
    return jsonify(payload), status_code
