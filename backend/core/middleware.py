import traceback
import sys

class ExceptionLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        with open("error_log.txt", "a") as f:
            f.write(f"Exception on {request.path}:\n")
            f.write(traceback.format_exc())
            f.write("-" * 80 + "\n")
        return None
