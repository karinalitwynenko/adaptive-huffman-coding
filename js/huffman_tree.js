class HuffmanTree {
    NYT = 'NYT';
    NODE = 'NODE';
    LEAF = 'LEAF';
    MAX = 256;
    limit;
    codes = [];
    nodes = []; // keeps leaves only
    root;
    nyt; // Not Yet Transferred
    omega; // all symbols occurance count

    constructor() {
        this.root = new Node(this.MAX, 0, this.NYT, null);
        this.nyt = this.root;
        this.omega = 0;
        this.limit = Math.floor(this.MAX / 2);
    }

    getNodeBySymbol(symbol) {
        if (this.codes.length == 0)
            return this.root;
        else if (!this.codes.includes(symbol)) {
            return this.nyt;
        }
        else {
            for (let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].symbol === symbol)
                    return this.nodes[i];
            }
        }
    }

    insertSymbol(symbol) {
        if (this.nodes.length == this.limit) // check if alphabet limit has been reached
            return false;

        if (symbol == ' ')
            symbol = 'SPACE';
        else if (symbol.charCodeAt(0) == 10)
            symbol = 'LF';

        var leafToInc = null;
        var p = this.getNodeBySymbol(symbol);
        if (p == this.nyt) {
            p.left = new Node(p.id - 2, 0, this.NYT, p);
            this.nyt = p.left;
            p.right = new Node(p.id - 1, 1, symbol, p);
            p.symbol = '';
            this.codes.push(symbol);
            this.nodes.push(p.right);
            leafToInc = p.right;
        }
        else {
            var blockLeader = this.getBlockLeader(p.weight, 'ALL_NODES');
            if (blockLeader != p)
                this.swap(p, blockLeader);
            p.weight++;
            p = p.parent;
        }

        while (p != this.root) {
            p = this.updateTree(p);
        }

        this.root.weight++;
        this.omega++;
        return true;
    }

    updateTree(node) {
        var swapNode = this.getFKGswapNode(node);
        if (swapNode && swapNode != node) {
            this.swap(node, swapNode);
            node.weight++;
            node = node.parent;
        }
        else {
            node.weight++;
            node = node.parent;
        }

        return node;
    }

    insertSymbolVitter(symbol) {
        if (this.nodes.length == this.limit) // check if alphabet limit reached
            return false;

        if (symbol == ' ')
            symbol = 'SPACE';
        else if (symbol.charCodeAt(0) == 10)
            symbol = 'LF';

        var leafToIncrement = null;
        var p = this.getNodeBySymbol(symbol);

        if (p == this.nyt) {
            p.left = new Node(p.id - 2, 0, this.NYT, p);
            this.nyt = p.left;
            p.right = new Node(p.id - 1, 0, symbol, p);
            p.symbol = '';
            this.codes.push(symbol);
            this.nodes.push(p.right);
            leafToIncrement = p.right;
        }
        else {
            // swap with the block leader
            var blockLeader = this.getBlockLeader(p.weight, this.LEAF);
            if (blockLeader != p)
                this.swap(p, blockLeader);
            // check if the node became a sibling of NYT
            if (p.leftSibling() == this.nyt || p.rightSibling() == this.nyt) {
                leafToIncrement = p;
                p = p.parent;
            }
        }

        while (p != null)
            p = this.slideAndIncrement(p);
        if (leafToIncrement != null)
            this.slideAndIncrement(leafToIncrement);

        this.omega++;
        return true;
    }

    slideAndIncrement(node) {
        var previousNode = node.parent;
        var nodes = [];
        if (this.isNode(node)) {
            this.getNodesByWeight(node.weight + 1, this.root.left, nodes, this.isLeaf);
            this.getNodesByWeight(node.weight + 1, this.root.right, nodes, this.isLeaf);
        }
        else {
            this.getNodesByWeight(node.weight, this.root.left, nodes, this.isNode);
            this.getNodesByWeight(node.weight, this.root.right, nodes, this.isNode);
        }

        nodes.filter(function (blockNode) {
            if (blockNode.id <= node.id)
                return false;
            else return true;
        });

        nodes.sort(function (nodeA, nodeB) {
            return nodeA.id - nodeB.id;
        });
        var nextNode = nodes.shift();
        while (nextNode) {
            this.swap(node, nextNode)
            nextNode = nodes.shift();
        }

        node.weight++;
        if (this.isNode(node))
            node = previousNode;
        else
            node = node.parent;

        return node;
    }

    getBlockLeader(w, type) {
        var nodes = [];
        if (type == this.NODE)
            type = this.isNode;
        else if (type == this.LEAF)
            type = this.isLeaf;
        else
            type = () => true;

        this.getNodesByWeight(w, this.root.left, nodes, type);
        this.getNodesByWeight(w, this.root.right, nodes, type);

        var max = 0;
        var leader = null;
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] != this.nyt && nodes[i].id > max) {
                max = nodes[i].id;
                leader = nodes[i];
            }
        }
        return leader;
    }

    getFKGswapNode(node) {
        var nodes = [];
        var type = () => true;

        this.getNodesByWeight(node.weight, this.root.left, nodes, type);
        this.getNodesByWeight(node.weight, this.root.right, nodes, type);

        var max = node.id;
        var leader = node;
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] != this.nyt && nodes[i].id > max) {
                max = nodes[i].id;
                leader = nodes[i];
            }
        }
        return leader;
    }

    swap(nodeF, nodeS) {
        if (nodeF.parent == nodeS.parent) {
            if (nodeF.parent.left == nodeS) {
                nodeF.parent.left = nodeF;
                nodeF.parent.right = nodeS;
            }
            else {
                nodeF.parent.left = nodeS;
                nodeF.parent.right = nodeF;
            }
        }
        else {
            if (nodeF.parent.left == nodeF)
                nodeF.parent.left = nodeS;
            else
                nodeF.parent.right = nodeS;

            if (nodeS.parent.left == nodeS)
                nodeS.parent.left = nodeF;
            else
                nodeS.parent.right = nodeF;

            var tempParent = nodeS.parent;
            nodeS.parent = nodeF.parent;
            nodeF.parent = tempParent;
        }

        var tempId = nodeF.id;
        nodeF.id = nodeS.id;
        nodeS.id = tempId;
    }

    getNodesByWeight(w, node, foundNodes, typeCheckFun) {
        if (node === undefined)
            return;

        if (typeCheckFun(node) && node.weight == w)
            foundNodes.push(node);

        this.getNodesByWeight(w, node.left, foundNodes, typeCheckFun);
        this.getNodesByWeight(w, node.right, foundNodes, typeCheckFun);
    }

    isLeaf(node) {
        if (node.left === undefined && node.right === undefined)
            return true;
        else return false;
    }

    isNode(node) {
        return (node.left != undefined || node.right != undefined);
    }

    getAllNodesFromLevel(node) {
        var level = this.levelFromRoot(node);
        var nodesArray = [];
        this.getNodes(this.root, nodesArray, level, 0);
        return nodesArray;
    }

    levelFromRoot(node) {
        var level = 0; // 0 for root
        while (node != this.root) {
            node = node.parent;
            level++;
        }
        return level;
    }

    getNodes(node, nodesArray, depthLevel, currentLevel) {
        if (!node)
            return;

        if (depthLevel == currentLevel) {
            nodesArray.push(node);
            return;
        }
        this.getNodes(node.left, nodesArray, depthLevel, ++currentLevel);
        this.getNodes(node.right, nodesArray, depthLevel, currentLevel);
    }

    printAllNodes(nodes) {
        var printN = function (node) {
            if (!node)
                return;
            console.log(node);
            nodes.push(node);
            printN(node.left);
            printN(node.right);
        }
        printN(this.root);
    }

    findHeight(node) {
        if (!node)
            return -1;

        var leftH = this.findHeight(node.left);
        var rightH = this.findHeight(node.right);

        if (leftH > rightH) {
            return leftH + 1;
        }
        else {
            return rightH + 1;
        }
    }

    maxWidth(node) {
        if (!node)
            node = this.root;
        var maxW = 0;
        var h = this.findHeight(node) + 1;

        var tempW;
        for (let i = 1; i <= h; i++) {
            tempW = this.widthOnLevel(node, i)
            if (tempW > maxW)
                maxW = tempW;
        }
        return maxW;
    }

    widthOnLevel(node, level) {
        if (!node)
            return 0;
        else if (level == 1)
            return 1;
        else if (level > 1)
            return this.widthOnLevel(node.left, level - 1)
                + this.widthOnLevel(node.right, level - 1)
    }

    postOrderTraversal(node, nodesArray) {
        if (!node)
            return;

        this.postOrderTraversal(node.left, nodesArray);
        this.postOrderTraversal(node.right, nodesArray);
        nodesArray.push(node);
    }

    generateCodewords() {
        var isLast = this.isLeaf;
        function dive(node, codewordFragment) {
            if (isLast(node)) {
                node.codeword = codewordFragment;
            }
            else {
                var newLeftCodewordFragment = codewordFragment.concat('0');
                var newRightCodewordFragment = codewordFragment.concat('1');
                dive(node.left, newLeftCodewordFragment);
                dive(node.right, newRightCodewordFragment)
            }
        }
        dive(this.root, '');
    }
}

class Node {
    x;
    y;
    id;
    weight;
    symbol;
    parent;
    left;
    right;
    codeword;
    constructor(id, weight, symbol, parent) {
        this.id = id;
        this.weight = weight;
        this.symbol = symbol;
        this.parent = parent;
    }

    leftSibling() {
        return this.parent.left;
    }

    rightSibling() {
        return this.parent.right;
    }

    isSibling(node) {
        if (!node.parent || !this.parent)
            return false;
        else if (this.rightSibling() == node || this.leftSibling() == node)
            return true;
        else return false;
    }

}
