import requests
import json
import os.path
import time
import signal

URL = "http://elron.ee/api/v1/map"
FILENAME = "speedData.json"
TICKRATE_SECONDS = 8
FAIL_RATE_SECONDS = 30
BUFFER_RATE = 30
RELEVANT_DATA_KEYS = ("reis", "reisi_algus_aeg", "reisi_lopp_aeg", "kiirus", "latitude", "longitude", "liin")

def print_wrapper(s: str="", end: str="\n") -> None:
    print(f"[eST] {s}", end=end)

def request_wrapper() -> tuple:
    start = time.time()
    response = requests.get(URL)
    if response.status_code != 200:
        print_wrapper(f"Request error {response.status_code}")
        print_wrapper(f"Waiting {FAIL_RATE_SECONDS}s, then retrying", end="\n\n")
        time.sleep(FAIL_RATE_SECONDS)
        return request_wrapper()
    nap_timer = max(0, TICKRATE_SECONDS - (time.time() - start))
    return response.json(), nap_timer

def interrupt_handler(sig, frame):
    print_wrapper("Dumping data early and exiting")
    update_data(data)
    exit(0)

def get_prewritten_data() -> list:
    try:
        with open(FILENAME, "r") as fptr:
            return json.loads(fptr.read())
    except (FileNotFoundError, json.JSONDecodeError):
        return list()

def update_data(data: list) -> None:
    with open(FILENAME, "w") as fptr:
        fptr.write(json.dumps(data))
    size_in_mb = round(os.path.getsize(FILENAME) / 1_000_000, 2)
    print_wrapper("Updated data")
    print_wrapper(f"Data now at size {len(data)}, {size_in_mb}MB", end="\n\n")

def loop(data: list):
    b = 0
    signal.signal(signal.SIGINT, interrupt_handler)

    while True:
        response_data, nap_timer = request_wrapper()
        for train in response_data["data"]:
            data.append( { k: train[k] for k in RELEVANT_DATA_KEYS } )
        b += 1
        if b >= BUFFER_RATE:
            update_data(data)
            b = 0
        time.sleep(nap_timer)

data = get_prewritten_data()
loop(data)
