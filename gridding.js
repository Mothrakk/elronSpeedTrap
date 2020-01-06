let NW = {"latitude":59.467433, "longitude":23.569378};
let NE = {"latitude":59.467433, "longitude":28.235580};
let SW = {"latitude":57.669514, "longitude":23.569378};
let SE = {"latitude":57.669514, "longitude":28.235580};
let MAX_SPECK_COUNT = 6000;

let max_lat = NW["latitude"];
let min_lat = SW["latitude"];
let max_long = NE["longitude"];
let min_long = NW["longitude"];

let y_scale = max_lat - min_lat;
let x_scale = max_long - min_long;

let SQUARES_PER_ROW_DEFAULT = 10;
let SQUARES_PER_COLUMN_DEFAULT = 13;
let MAX_ALLOWED_GRID_NODES = 50;

let map = document.getElementById("eesti");
let trains_overlay = document.getElementById("trains_overlay");
let width = map.width;
let height = map.height;

let grid_borders_checkbox = document.getElementById("show_grid_borders");
let train_specks_checkbox = document.getElementById("show_train_specks");
let grids_container = document.getElementById("grids_container");
let rows_input = document.getElementById("input_nodes_per_row");
let column_input = document.getElementById("input_nodes_per_column");
let draw_button = document.getElementById("draw");

let grid_coords_label = document.getElementById("grid_label");
let train_count_label = document.getElementById("train_count_label");
let avg_speed_label = document.getElementById("avg_speed_label");
let max_speed_label = document.getElementById("max_speed_label");
let min_speed_label = document.getElementById("min_speed_label");

let grid_data;
let nodes_per_row, nodes_per_column;

function valid_input(inp) {
    if (!isNaN(inp)) {
        inp = parseInt(inp);
        if (inp > 0 && inp <= MAX_ALLOWED_GRID_NODES) {
            return true;
        }
    }
    return false;
}

function update_from_input() {
    if (valid_input(rows_input.value)) {
        nodes_per_row = parseInt(rows_input.value);
    } else {
        nodes_per_row = SQUARES_PER_ROW_DEFAULT;
    }
    if (valid_input(column_input.value)) {
        nodes_per_column = parseInt(column_input.value);
    } else {
        nodes_per_column = SQUARES_PER_COLUMN_DEFAULT;
    }
}

function update_data_labels(y, x) {
    let avg_speed = (grid_data[y][x]["total_speed"] / grid_data[y][x]["train_count"]).toFixed(2);
    grid_coords_label.innerText = `(${y}, ${x})`;
    train_count_label.innerText = grid_data[y][x]["train_count"];
    avg_speed_label.innerText = `${avg_speed} km/h`
}

function mapcoords_from_polarcoords(lat, long) {
    let y = Math.floor(height - ((lat - min_lat) / y_scale * height));
    let x = Math.floor((long - min_long) / x_scale * width);
    return {"y":y, "x":x};
}

function erase_grid_nodes() {
    ["grid_node_bordered", "grid_node_unbordered"].forEach(function(class_name) {
        let grid_nodes = grids_container.getElementsByClassName(class_name);
        for (let i = grid_nodes.length - 1; i >= 0; i--) {
            grid_nodes[i].remove();
        }
    })
}

function compile_data() {
    let y_step = height / nodes_per_column;
    let x_step = width / nodes_per_row;
    grid_data = [];
    for (let y = 0; y < nodes_per_column; y++) {
        grid_data[y] = [];
        for (let x = 0; x < nodes_per_row; x++) {
            grid_data[y][x] = {"total_speed":0, "train_count":0};
        }
    }
    TRAIN_DATA.forEach(function(train) {
        let coords = mapcoords_from_polarcoords(
            parseFloat(train["latitude"]),
            parseFloat(train["longitude"])
        );
        let y = Math.floor(coords["y"] / y_step);
        let x = Math.floor(coords["x"] / x_step);
        grid_data[y][x]["train_count"]++;
        grid_data[y][x]["total_speed"] += parseInt(train["kiirus"]);
    })
}

function draw_grid_nodes() {
    let y = 0;

    let square_w = Math.floor(width / nodes_per_row);
    let square_h = Math.floor(height / nodes_per_column);
    let class_name = (grid_borders_checkbox.checked ? "grid_node_bordered" : "grid_node_unbordered");

    for (let i = 0; i < nodes_per_column; i++) {
        let x = 0;
        for (let j = 0; j < nodes_per_row; j++) {
            let grid_node = document.createElement("div");
            grid_node.className = class_name
            grid_node.style = `top: ${y}px; left: ${x}px; width: ${square_w}px; height: ${square_h}px`;
            grid_node.onclick = function() {
                let current_focus = document.getElementById("focused_node");
                if (current_focus == null) {
                    grid_node.id = "focused_node";
                } else {
                    if (current_focus != grid_node) {
                        grid_node.id = "focused_node";
                    }
                    current_focus.id = "";
                }
                update_data_labels(i, j);
            }
            grid_node.onmouseover = function() {
                let current_focus = document.getElementById("focused_node");
                if (current_focus == null) {
                    update_data_labels(i, j);
                }
            }
            grids_container.appendChild(grid_node);
            x += square_w;
        }
        y += square_h;
    }
}

grid_borders_checkbox.onchange = function() {
    let grids_to_edit, class_to_insert;
    if (grid_borders_checkbox.checked) {
        grids_to_edit = grids_container.getElementsByClassName("grid_node_unbordered");
        class_to_insert = "grid_node_bordered";
    } else {
        grids_to_edit = grids_container.getElementsByClassName("grid_node_bordered");
        class_to_insert = "grid_node_unbordered";
    }

    for (let i = grids_to_edit.length - 1; i >= 0; i--) {
        grids_to_edit[i].className = class_to_insert;
    }
}

train_specks_checkbox.onchange = function() {
    trains_overlay.hidden = !train_specks_checkbox.checked;
}

draw_button.onclick = function() {
    update_from_input();
    erase_grid_nodes();
    compile_data();
    draw_grid_nodes();   
}

draw_button.click();
