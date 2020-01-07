from PIL import Image, ImageDraw
import argparse
import json

argparser = argparse.ArgumentParser(description="Create a graphical layout of the train data spots")
argparser.add_argument("data_filename", help="Filepath to the trains data")
argparser.add_argument("out_filename", default="overlay.png")
args = argparser.parse_args()

WIDTH = 852
HEIGHT = 626

MAX_LAT = 59.467433
MIN_LAT = 57.669514
MAX_LONG = 28.235580
MIN_LONG = 23.569378

y_scale = MAX_LAT - MIN_LAT
x_scale = MAX_LONG - MIN_LONG

with open(args.data_filename, "r") as fptr:
    print(args.data_filename)
    trains_data = json.loads(fptr.read())

def mapcoords_from_polarcoords(lat: float, long: float):
    y = int(HEIGHT - ((lat - MIN_LAT) / y_scale * HEIGHT))
    x = int((long - MIN_LONG) / x_scale * WIDTH)
    return (y, x)

img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
pixels = img.load()

for i, train in enumerate(trains_data):
    y, x = mapcoords_from_polarcoords(
        float(train["latitude"]),
        float(train["longitude"])
    )
    pixels[x, y] = (255, 0, 0, 255)
    if not i % 100:
        print(f"{i+1} / {len(trains_data)}", end="\r")

img.save(args.out_filename, "PNG")
print(f"Exported to {args.out_filename}")