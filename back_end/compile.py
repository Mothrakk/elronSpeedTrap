import json
import argparse

argparser = argparse.ArgumentParser(description="Pre-compile grid data for the front-end")
argparser.add_argument("width", type=int, help="width of map image")
argparser.add_argument("height", type=int, help="height of map image")
argparser.add_argument("min_lat", type=float, help="minimum latitude in the given map area")
argparser.add_argument("max_lat", type=float, help="maximum latitude in the given map area")
argparser.add_argument("min_long", type=float, help="minimum longitude in the given map area")
argparser.add_argument("max_long", type=float, help="maximum longitude in the given map area")
argparser.add_argument("-p", "--path", default="trainData.json", help="path to the raw json data file")
argparser.add_argument("-o", "--out", default="compiled.js", help="path to the output js file")
argparser.add_argument("-x", type=int, default=50, help="maximum possible length of grids in a row")
argparser.add_argument("-y", type=int, default=50, help="maximum possible length of grids in a column")
args = argparser.parse_args()

y_scale = args.max_lat - args.min_lat
x_scale = args.max_long - args.min_long

def gridcoords_from_polarcoords(lat: float, long: float, nodes_per_column: int, nodes_per_row: int):
    y_step = args.height / nodes_per_column
    x_step = args.width / nodes_per_row
    y = args.height - ((lat - args.min_lat) / y_scale * args.height)
    x = (long - args.min_long) / x_scale * args.width
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
