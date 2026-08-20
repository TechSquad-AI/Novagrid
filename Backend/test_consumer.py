import os
import sys


def test_consumer_file_exists():

    assert os.path.exists(
        "consumer.py"
    )


def test_python_environment():

    assert sys.version_info.major == 3