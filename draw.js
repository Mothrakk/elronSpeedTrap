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
    let grid_nodes = map_container.getElementsByClassName("grid_node");
    for (let i = grid_nodes.length - 1; i >= 0; i--) {
        grid_nodes[i].remove();
    }
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

    for (let i = 0; i < nodes_per_column; i++) {
        let x = 0;
        for (let j = 0; j < nodes_per_row; j++) {
            let grid_node = document.createElement("div");
            grid_node.className = "grid_node"
            grid_node.style = `top: ${y}px; left: ${x}px; width: ${square_w}px; height: ${square_h}px`;
            
            map_container.appendChild(grid_node);
    
            x += square_w;
        }
        y += square_h;
    }
}

function draw_click() {
    erase_grid_nodes();
    draw_grid_nodes();   
}

draw_button.onclick = draw_click;
draw_grid_nodes();
