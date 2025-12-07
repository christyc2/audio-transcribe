"""
Authentication middleware to handle login requests
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from .auth import authenticate_user
import json
from urllib.parse import unquote

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/auth/login":
            # Read and store the body to restore it later
            body = await request.body()
            
            # If body is empty, let the endpoint handle the error
            if not body:
                return await call_next(request)
            
            username = None
            password = None
            
            # Try to parse username and password from the request body as form data (OAuth2PasswordRequestForm uses form data)
            try:
                # Parse form data manually from body with URL decoding
                body_str = body.decode('utf-8')
                form_data = {}
                for pair in body_str.split('&'):
                    if '=' in pair:
                        key, value = pair.split('=', 1)
                        form_data[unquote(key)] = unquote(value)
                username = form_data.get("username")
                password = form_data.get("password")
            except Exception:
                # If form parsing fails, try JSON as fallback
                try:
                    body_json = json.loads(body.decode('utf-8'))
                    username = body_json.get("username")
                    password = body_json.get("password")
                except (json.JSONDecodeError, UnicodeDecodeError):
                    # If both fail, restore body and let the endpoint handle it
                    async def receive():
                        return {"type": "http.request", "body": body}
                    request._receive = receive
                    return await call_next(request)
            
            # Restore the body so the endpoint can read it
            async def receive():
                return {"type": "http.request", "body": body}
            request._receive = receive
            
            if username and password:
                user = authenticate_user(username, password)
                # If return False or None, raise 401 error response
                if user == None:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail="User not registered", headers={"WWW-Authenticate": "Bearer"})
                elif user == False:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                                detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
            
            # If username and password are valid, continue to the login endpoint
            return await call_next(request)
        # [await] pause execution a coroutine until an "awaitable" object completes its operation and returns a result.
        # need [await] get a coroutine object instead of the response.
        return await call_next(request)
    