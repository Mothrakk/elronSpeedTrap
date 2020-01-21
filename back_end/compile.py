import json
import argparse

argparser = argparse.ArgumentParser(description="Pre-compile grid data for the front-end")
argparser.add_argument("path_to_map_data", help="File from which to read map data")
argparser.add_argument("-p", "--path", default="trainData.json", help="path to the raw json data file")
argparser.add_argument("-o", "--out", default="compiled.js", help="path to the output js file")
argparser.add_argument("-x", type=int, default=50, help="maximum possible length of grids in a row")
argparser.add_argument("-y", type=int, default=50, help="maximum possible length of grids in a column")
args = argparser.parse_args()

with open(args.path_to_map_data, "r") as fptr:
    parsed = json.loads(fptr.read())

MAX_LAT = parsed["MAX_LAT"]
MIN_LAT = parsed["MIN_LAT"]
MAX_LONG = parsed["MAX_LONG"]
MIN_LONG = parsed["MIN_LONG"]
HEIGHT = parsed["HEIGHT"]
WIDTH = parsed["WIDTH"]

y_scale = MAX_LAT - MIN_LAT
x_scale = MAX_LONG - MIN_LONG

def gridcoords_from_polarcoords(lat: float, long: float, nodes_per_column: int, nodes_per_row: int):
    y_step = HEIGHT / nodes_per_column
    x_step = WIDTH / nodes_per_row
    y = HEIGHT - ((lat - MIN_LAT) / y_scale * HEIGHT)
    x = (long - MIN_LONG) / x_scale * WIDTH
    y = int(y / y_step)
    x = int(x / x_step)
    return y, x

with open(args.path, "r") as fptr:
    raw_data = json.loads(fptr.read())

compiled_data = dict()
for nodes_per_column in range(1, args.y + 1):
    compiled_data[nodes_per_column] = dict()
    for nodes_per_row in range(1, args.x + 1):
        compiled_data[nodes_per_column][nodes_per_row] = dict()

for i, train in enumerate(raw_data):
    if not i % 49:
        print(f"{round((i+1) / len(raw_data) * 100, 2)}% {i+1}/{len(raw_data)}", end="\r")
    speed = int(train["kiirus"])
    lat = float(train["latitude"])
    lon = float(train["longitude"])
    for nodes_per_column in range(1, args.y + 1):
        for nodes_per_row in range(1, args.x + 1):
            t_y, t_x = gridcoords_from_polarcoords(
                lat,
                lon,
                nodes_per_column,
                nodes_per_row
            )
            if t_y not in compiled_data[nodes_per_column][nodes_per_row]:
                compiled_data[nodes_per_column][nodes_per_row][t_y] = dict()
            if t_x not in compiled_data[nodes_per_column][nodes_per_row][t_y]:
                compiled_data[nodes_per_column][nodes_per_row][t_y][t_x] = {
                    "train_count": 0,
                    "speed_total": 0,
                    "max_speed": 0
                }
            focus = compiled_data[nodes_per_column][nodes_per_row][t_y][t_x]
            focus["train_count"] += 1
            focus["speed_total"] += speed
            if speed > focus["max_speed"]:
                focus["max_speed"] = speed

with open(args.out, "w") as fptr:
    fptr.write(f"let TRAIN_DATA = {json.dumps(compiled_data)};")
print("\nExported loadable version to", args.out)
