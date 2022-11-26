const FKG_ALG = 0;
const VITTER_ALG = 1;

algorithm = FKG_ALG;
drawing = null;

window.onload = function() {
    drawing = new Drawing(new HuffmanTree(), document.getElementById('main-svg'), document.getElementById('codeword-label'));

    setupZooming(
        document.getElementById('zoom-in-btn'),
        document.getElementById('zoom-out-btn'),
        drawing
    );
}

function clearCanvas() {
    drawing.clearCanvas();
}

function encode() {
    var text = document.getElementById('input-message').value;
    if (text == '')
        return;

    drawing.clearCanvas();
    drawing.tree = new HuffmanTree();
    var symbols = text.split("");

    if (algorithm == FKG_ALG)
        symbols.forEach((symbol) => drawing.tree.insertSymbol(symbol));
    else
        symbols.forEach((symbol) => drawing.tree.insertSymbolVitter(symbol));

    drawing.update();
}

function setupZooming(zoomInButton, zoomOutButton, drawing) {
    zoomInButton.onclick = function (e) {
        if (e.button != 0)
            return;

        drawing.zoomIn();
    };

    zoomOutButton.onclick = function (e) {
        if (e.button != 0)
            return;

        drawing.zoomOut();
    };
}

function setAlgorithm(radio, alg) {
    if (radio.checked) {
        algorithm = alg;
        if(drawing.canvas.innerHTML != '')
            encode(); // rebuild the tree with the new algorithm
    }
}
