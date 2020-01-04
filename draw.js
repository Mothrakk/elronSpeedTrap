/*
NW 59.467433, 23.569378
NE 59.467433, 28.235580
SW 57.669514, 23.569378
SE 57.669514, 28.235580
*/

let SQUARES_PER_ROW_DEFAULT = 10;
let SQUARES_PER_COLUMN_DEFAULT = 13;

let map = document.getElementById("eesti");
let width = map.width;
let height = map.height;

let grid_borders_checkbox = document.getElementById("show_grid_borders");
let map_container = document.getElementById("map_container");
let rows_input = document.getElementById("input_nodes_per_row");
let column_input = document.getElementById("input_nodes_per_column");
let draw_button = document.getElementById("draw");

function valid_input(inp) {
    if (!isNaN(inp)) {
        inp = parseInt(inp);
        if (inp > 0 && inp <= 50) {
            return true;
        }
    }
    return false;
}

function erase_grid_nodes() {
    ["grid_node_bordered", "grid_node_unbordered"].forEach(function(class_name) {
        let grid_nodes = map_container.getElementsByClassName(class_name);
        for (let i = grid_nodes.length - 1; i >= 0; i--) {
            grid_nodes[i].remove();
        }
    })
}

function draw_grid_nodes() {
    let nodes_per_row, nodes_per_column;
    let y = 0;

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

    let square_w = Math.floor(width / nodes_per_row);
    let square_h = Math.floor(height / nodes_per_column);
    let class_name = (grid_borders_checkbox.checked ? "grid_node_bordered" : "grid_node_unbordered");

    for (let i = 0; i < nodes_per_column; i++) {
        let x = 0;
        for (let j = 0; j < nodes_per_row; j++) {
            let grid_node = document.createElement("div");
            grid_node.className = class_name
            grid_node.style = `top: ${y}px; left: ${x}px; width: ${square_w}px; height: ${square_h}px`;
            
            map_container.appendChild(grid_node);
    
            x += square_w;
        }
        y += square_h;
    }
}

grid_borders_checkbox.onchange = function() {
    let grids_to_edit, class_to_insert;
    if (grid_borders_checkbox.checked) {
        grids_to_edit = map_container.getElementsByClassName("grid_node_unbordered");
        class_to_insert = "grid_node_bordered";
    } else {
        grids_to_edit = map_container.getElementsByClassName("grid_node_bordered");
        class_to_insert = "grid_node_unbordered";
    }

    for (let i = grids_to_edit.length - 1; i >= 0; i--) {
        grids_to_edit[i].className = class_to_insert;
    }
}

draw_button.onclick = function() {
    erase_grid_nodes();
    draw_grid_nodes();   
}

draw_grid_nodes();
