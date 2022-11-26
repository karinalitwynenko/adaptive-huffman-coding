class Drawing {
    NODE_R = 35;
    LEAF_W = 70;
    LEAF_H = 60;
    PADD_X = 30;
    PADD_Y = 100;
    ZOOMING_SPAN = 50;
    NODES_FILL_COLOR = 'white';
    NODES_STROKE_COLOR = '#133957';
    NODES_TEXT_COLOR = '#353839';
    tree;
    canvas;
    codewordLabel;

    constructor(tree, canvas, codewordLabel) {
        this.tree = tree;
        this.canvas = canvas;
        this.codewordLabel = codewordLabel;
        this.setupPanning();
    }

    setupPanning() {
        var drawing = this;
        var canvas = this.canvas;
        this.canvas.onmousedown = function (e) {
            if (e.button != 0)
                return;

            canvas.onmousemove = function (e) {
                drawing.canvas.viewBox.baseVal.x -= e.movementX;
                drawing.canvas.viewBox.baseVal.y -= e.movementY;
            }

            canvas.onmouseleave = function (e) {
                canvas.onmouseup(e);
            }
        }

        canvas.onmouseup = function (e) {
            if (e.button == 0)
                canvas.onmousemove = null;
        }
    }

    drawInternalNode(node, x, y) {
        var nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        nodeGroup.appendChild(this.getNodeShape(x, y));
        var id = this.getText(x, y, 0, 10, 15);
        id.appendChild(document.createTextNode(node.id));
        var w = this.getText(x, y, 0, -15, 20);
        w.appendChild(document.createTextNode(node.symbol + " (" + node.weight + ")"));

        nodeGroup.appendChild(id);
        nodeGroup.appendChild(w);
        this.canvas.appendChild(nodeGroup);

        var textWidth = id.getComputedTextLength();
        id.setAttributeNS(null, "x", x - textWidth / 2);
        textWidth = w.getComputedTextLength();
        w.setAttributeNS(null, "x", x - textWidth / 2);
        return nodeGroup;
    }

    drawLeaf(node, x, y) {
        var nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        nodeGroup.setAttribute('data-codeword', node.codeword);
        nodeGroup.onmousemove = () => this.showCodeword(nodeGroup, this.codewordLabel);
        nodeGroup.onmouseleave = () => this.hideCodeword(this.codewordLabel);

        nodeGroup.appendChild(this.getNYTShape(x, y));
        var id = this.getText(x, y, 0, 10, 15);
        id.appendChild(document.createTextNode(node.id));

        var fontSize = 20;
        if (node.symbol == 'NYT')
            fontSize = 17;
        else if (node.symbol == 'SPACE')
            fontSize = 12;
        var w = this.getText(x, y, 0, -15, fontSize);
        w.setAttributeNS(null, "font-weight", "bold");
        w.appendChild(document.createTextNode(node.symbol + " (" + node.weight + ")"));

        nodeGroup.appendChild(id);
        nodeGroup.appendChild(w);
        this.canvas.appendChild(nodeGroup);

        var textWidth = id.getComputedTextLength();
        id.setAttributeNS(null, "x", x - textWidth / 2);
        textWidth = w.getComputedTextLength();
        w.setAttributeNS(null, "x", x - textWidth / 2);
        return nodeGroup;
    }

    getNodeShape(x, y) {
        var nodeShape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        nodeShape.setAttributeNS(null, "cx", x);
        nodeShape.setAttributeNS(null, "cy", y);
        nodeShape.setAttributeNS(null, "r", this.NODE_R);
        nodeShape.setAttributeNS(null, "stroke", this.NODES_STROKE_COLOR);
        nodeShape.setAttributeNS(null, "stroke-width", 2);
        nodeShape.setAttributeNS(null, "fill", this.NODES_FILL_COLOR);
        return nodeShape;
    }

    getNYTShape(x, y) {
        var NYTShape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        NYTShape.setAttributeNS(null, "x", x - this.LEAF_W / 2);
        NYTShape.setAttributeNS(null, "y", y - this.LEAF_H / 2);
        NYTShape.setAttributeNS(null, "width", this.LEAF_W);
        NYTShape.setAttributeNS(null, "height", this.LEAF_H);
        NYTShape.setAttributeNS(null, "stroke", this.NODES_STROKE_COLOR);
        NYTShape.setAttributeNS(null, "stroke-width", 3);
        NYTShape.setAttributeNS(null, "fill", this.NODES_FILL_COLOR);
        NYTShape.setAttributeNS(null, "rx", 5);
        return NYTShape;
    }

    getText(x, y, dx, dy, fontSize) {
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttributeNS(null, "x", x - dx);
        text.setAttributeNS(null, "y", y - dy);
        text.setAttributeNS(null, "font-size", fontSize);
        text.setAttributeNS(null, "text-length", 4);
        text.setAttributeNS(null, "fill", this.NODES_TEXT_COLOR);
        return text;
    }

    getCanvasCenter() {
        return Number((this.canvas.width.baseVal.value / 2).toFixed(0));
    }

    drawTree(x, y, width, node, level) {
        var drawnNode;

        if (this.tree.isLeaf(node)) {
            drawnNode = this.drawLeaf(node, x, y);
        }
        else {
            drawnNode = this.drawInternalNode(node, x, y);
        }

        var newXLeft, newXRight;
        var wl, wr;

        if (level == 1) {
            wl = this.tree.maxWidth(this.tree.root.left);
            wr = this.tree.maxWidth(this.tree.root.right);

            newXLeft = x - (wl * this.LEAF_W);
            newXRight = x + (wr * this.LEAF_W);
        }
        else {
            var wl = this.tree.maxWidth(node.left);
            var wr = this.tree.maxWidth(node.right);

            newXLeft = x - wl * this.LEAF_W / 2 - this.PADD_X;
            newXRight = x + wr * this.LEAF_W / 2 + this.PADD_X;
        }
        var newY = y + this.LEAF_H + this.PADD_Y;

        width /= 4;
        if (node.left) {
            this.drawLine(x, y, newXLeft, newY);
            this.canvas.appendChild(drawnNode);
            this.drawTree(newXLeft, newY, width, node.left, level + 1);
        }

        if (node.right) {
            this.drawLine(x, y, newXRight, newY);
            this.canvas.appendChild(drawnNode);
            this.drawTree(newXRight, newY, width, node.right, level + 1);
        }
    }

    clearCanvas() {
        this.canvas.innerHTML = '';
    }

    drawLine(x1, y1, x2, y2) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttributeNS(null, "x1", x1);
        line.setAttributeNS(null, "y1", y1);
        line.setAttributeNS(null, "x2", x2);
        line.setAttributeNS(null, "y2", y2);
        line.setAttributeNS(null, "stroke-width", 2);
        line.setAttributeNS(null, "stroke", this.NODES_FILL_COLOR);
        this.canvas.prepend(line);
    }

    update() {
        this.clearCanvas();
        this.tree.generateCodewords();
        this.drawTree(this.getCanvasCenter(), 100);
    }

    drawTree(x, y) {
        var nodesArray = [];
        this.tree.postOrderTraversal(this.tree.root, nodesArray);
        var currentLevel = 0;
        var node;
        var prevX = x;
        var newX = prevX;
        var maxX = prevX;
        var newY = y;
        var prevNode = this.tree.root;
        while (nodesArray.length != 0) {
            node = nodesArray.shift();
            currentLevel = this.tree.levelFromRoot(node);
            newY = currentLevel * this.PADD_Y;
            if (prevNode == node.parent) {
                newX = prevX - this.LEAF_W - this.PADD_X;
            }
            else if (node.isSibling(prevNode)) {
                newX = prevX + this.LEAF_W + 1.5 * this.PADD_X;
            }
            else if (prevNode.parent == node) {
                if (node.left && node.right)
                    newX = (node.left.x + node.right.x) / 2;
                else if (node.left)
                    newX = prevX + this.LEAF_W + this.PADD_X;
                else
                    newX = prevX - this.LEAF_W - this.PADD_X;;
            }
            else {
                newX = maxX + this.LEAF_W + this.PADD_X;
            }

            if (this.tree.isLeaf(node))
                this.drawLeaf(node, newX, newY);
            else
                this.drawInternalNode(node, newX, newY);

            if (newX > maxX)
                maxX = newX;

            node.x = newX;
            node.y = newY;
            prevNode = node;
            prevX = newX;
        }
        this.addConnectingLines();
        this.centerViewbox();
    }

    addConnectingLines() {
        var drawing = this;
        var dive = function (node) {
            if (!node)
                return;

            if (node.left) {
                drawing.drawLine(node.x, node.y, node.left.x, node.left.y);
                dive(node.left);
            }

            if (node.right) {
                drawing.drawLine(node.x, node.y, node.right.x, node.right.y);
                dive(node.right);
            }
        }

        dive(this.tree.root);
    }

    zoomIn() {
        if ((this.canvas.viewBox.baseVal.width - this.ZOOMING_SPAN) < this.LEAF_W)
            return;

        this.canvas.viewBox.baseVal.x += this.ZOOMING_SPAN;
        this.canvas.viewBox.baseVal.y += this.ZOOMING_SPAN;
        this.canvas.viewBox.baseVal.width -= this.ZOOMING_SPAN * 2;
        this.canvas.viewBox.baseVal.height -= this.ZOOMING_SPAN * 2;
    }

    zoomOut() {
        this.canvas.viewBox.baseVal.x -= this.ZOOMING_SPAN;
        this.canvas.viewBox.baseVal.y -= this.ZOOMING_SPAN;
        this.canvas.viewBox.baseVal.width += this.ZOOMING_SPAN * 2;
        this.canvas.viewBox.baseVal.height += this.ZOOMING_SPAN * 2;
    }

    centerViewbox() {
        this.canvas.viewBox.baseVal.x = this.tree.root.x - 500;
        this.canvas.viewBox.baseVal.y = - this.PADD_Y;
    }

    showCodeword(node, codewordLabel) {
        codewordLabel.textContent = node.getAttribute('data-codeword');
        codewordLabel.style.opacity = 1;
    }

    hideCodeword(codewordLabel) {
        codewordLabel.style.opacity = 0;
    }

}