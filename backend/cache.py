import json
import hashlib
import os
from typing import Any, Optional
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

class InMemoryCache:
    def __init__(self):
        self.cache = {}
        print("💡 Using in-memory cache (No Redis)")

    def _get_cache_key(self, prefix: str, data: Any) -> str:
        """Generate a cache key from data"""
        if isinstance(data, str):
            content = data
        else:
            content = json.dumps(data, sort_keys=True)
        return f"{prefix}:{hashlib.md5(content.encode()).hexdigest()}"

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        return self.cache.get(key)

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache (TTL ignored in simple in-memory version)"""
        self.cache[key] = value
        return True

    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        return bool(self.cache.pop(key, None))

    def get_or_set(self, key: str, func, ttl: int = 3600, *args, **kwargs):
        """Get from cache or compute and cache"""
        cached = self.get(key)
        if cached is not None:
            return cached

        result = func(*args, **kwargs)
        self.set(key, result, ttl)
        return result

    def cache_embedding(self, text: str, embedding: list, ttl: int = 86400) -> bool:
        """Cache text embeddings"""
        key = self._get_cache_key("embedding", text)
        return self.set(key, embedding, ttl)

    def get_cached_embedding(self, text: str) -> Optional[list]:
        """Get cached embedding"""
        key = self._get_cache_key("embedding", text)
        return self.get(key)

    def cache_search_results(self, query: str, results: list, ttl: int = 1800) -> bool:
        """Cache search results"""
        key = self._get_cache_key("search", query)
        return self.set(key, results, ttl)

    def get_cached_search_results(self, query: str) -> Optional[list]:
        """Get cached search results"""
        key = self._get_cache_key("search", query)
        return self.get(key)

    def clear_all_cache(self) -> bool:
        """Clear all cached data"""
        self.cache.clear()
        return True

# Global cache instance
cache = InMemoryCache()