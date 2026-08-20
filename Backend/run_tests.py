import pytest
import sys

if __name__ == "__main__":
    sys.exit(
        pytest.main([
            "test_consumer.py",
            "-q",
            "--disable-warnings",
            "--capture=no"
        ])
    )