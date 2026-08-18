import React, { useState, useMemo } from "react";

// ============================================================================
// MULTI-TOPIC KNOWLEDGE BASE
// Add new categories (e.g., "System Design", "Arrays") directly here in the future!
// ============================================================================
const FLASHCARD_DATABASE = {
  "Binary Trees": [
    {
      id: 1,
      category: "Terminology",
      title: "Root & Leaf",
      definitions: [
        { label: "Root", text: "The topmost node of a tree with no parent. Every non-empty tree has exactly one root." },
        { label: "Leaf (Terminal)", text: "A node with no children (degree of 0)." }
      ],
      identification: {
        theory: "Look at the top node with no incoming edges to find the Root. Look at the bottom fringe nodes with no outgoing edges to find Leaves.",
        code: "Root: tree.root\nLeaf: node.left === null && node.right === null"
      },
      diagram: `       ( ROOT )
        /    \\
      (B)    (C)
      / \\      \\
   [LEAF][LEAF] [LEAF]`
    },
    {
      id: 2,
      category: "Terminology",
      title: "Parent, Child, Ancestor & Descendant",
      definitions: [
        { label: "Parent", text: "A node that has direct links pointing down to child nodes." },
        { label: "Child", text: "A node connected directly below a parent." },
        { label: "Ancestor", text: "Any node along the path from the root down to a specific node (includes parent, grandparent, etc.)." },
        { label: "Descendant", text: "Any node in the subtree rooted at that node (includes child, grandchild, etc.)." }
      ],
      identification: {
        theory: "Move upward along the path toward the root to find Ancestors. Move downward into all branch paths to find Descendants.",
        code: "Ancestors: Recursive checks on node.parent\nDescendants: Recursively visiting node.left & node.right"
      },
      diagram: `       [A]  <-- Ancestor of D & E
      /   \\
    [B]   (C)  <-- Parent of D & E / Child of A
    / \\
  [D] [E] <-- Descendants of A & B / Children of B`
    },
    {
      id: 3,
      category: "Terminology",
      title: "Subtree, Left Subtree & Right Subtree",
      definitions: [
        { label: "Subtree", text: "A tree consisting of a node and all of its descendants." },
        { label: "Left Subtree", text: "The entire subtree rooted at the left child of a node." },
        { label: "Right Subtree", text: "The entire subtree rooted at the right child of a node." }
      ],
      identification: {
        theory: "Pick any node, slice off its connection to its parent; the remaining structure underneath it is a subtree.",
        code: "Left Subtree: node.left\nRight Subtree: node.right"
      },
      diagram: `        ( Root )
       /        \\
   [  B  ]     [  C  ]
   [ / \\ ]     [ / \\ ]  <-- Right Subtree
   [D   E]     [F   G]
  ^-------^
 Left Subtree`
    },
    {
      id: 4,
      category: "Terminology",
      title: "Depth vs. Height vs. Level",
      definitions: [
        { label: "Depth of Node", text: "Number of edges on the path from the root to that node." },
        { label: "Height of Node", text: "Length of the longest path from that node down to a leaf." },
        { label: "Height of Tree", text: "Height of the root node." },
        { label: "Level", text: "Depth of a node + 1 (or equal to depth depending on convention)." }
      ],
      identification: {
        theory: "Count edges DOWN from root for Depth. Count edges UP from the deepest leaf for Height.",
        code: `const getHeight = (node) => {
  if (!node) return -1;
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
};`
      },
      diagram: `Depth=0, Height=2     ( A )
                        /     \\
Depth=1, Height=1   ( B )   ( C )
                      /
Depth=2, Height=0 [ D ]`
    },
    {
      id: 5,
      category: "Tree Types",
      title: "Binary Tree (General)",
      definitions: [
        { label: "Binary Tree", text: "A hierarchical data structure where every node has AT MOST TWO children (left and right)." }
      ],
      identification: {
        theory: "Max degree of any node <= 2.",
        code: "node.children.length <= 2"
      },
      diagram: `      A
     / \\
    B   C
   /
  D`
    },
    {
      id: 6,
      category: "Tree Types",
      title: "Full Binary Tree (Strict / Proper)",
      definitions: [
        { label: "Full Binary Tree", text: "A binary tree where EVERY node has EITHER 0 OR 2 children. No node has exactly 1 child." }
      ],
      identification: {
        theory: "Check every node; if you find a node with exactly 1 child, it is NOT full.",
        code: `const isFull = (node) => {
  if (!node) return true;
  if (!node.left && !node.right) return true;
  if (node.left && node.right) return isFull(node.left) && isFull(node.right);
  return false;
};`
      },
      diagram: `      1
     / \\
    2   3
   / \\
  4   5`
    },
    {
      id: 7,
      category: "Tree Types",
      title: "Complete Binary Tree",
      definitions: [
        { label: "Complete Tree", text: "Every level except possibly the last is completely filled, and all nodes in the last level are as FAR LEFT AS POSSIBLE." }
      ],
      identification: {
        theory: "Fill level-by-level from left to right. No missing gaps allowed on the last level.",
        code: `const isComplete = (root) => {
  if (!root) return true;
  const queue = [root];
  let nullSeen = false;
  while (queue.length) {
    const node = queue.shift();
    if (!node) { nullSeen = true; }
    else {
      if (nullSeen) return false;
      queue.push(node.left, node.right);
    }
  }
  return true;
};`
      },
      diagram: `      1
     / \\
    2   3
   / \\  /
  4   5 6`
    },
    {
      id: 8,
      category: "Tree Types",
      title: "Perfect Binary Tree",
      definitions: [
        { label: "Perfect Tree", text: "All interior nodes have 2 children and ALL LEAF NODES ARE AT THE SAME LEVEL/DEPTH." }
      ],
      identification: {
        theory: "Total number of nodes for height h is strictly 2^(h+1) - 1.",
        code: "Must be both Full and Complete with all leaves at identical depth."
      },
      diagram: `      1
     / \\
    2   3
   / \\ / \\
  4  5 6  7`
    },
    {
      id: 9,
      category: "Tree Types",
      title: "Height-Balanced Binary Tree",
      definitions: [
        { label: "Balanced Tree", text: "For EVERY node, the absolute difference between the height of left and right subtrees is AT MOST 1 (|Height(L) - Height(R)| <= 1)." }
      ],
      identification: {
        theory: "Balance Factor = Height(Left) - Height(Right). Must be -1, 0, or 1 at every node.",
        code: `const checkBalanced = (node) => {
  if (!node) return 0;
  const left = checkBalanced(node.left);
  const right = checkBalanced(node.right);
  if (left === -1 || right === -1 || Math.abs(left - right) > 1) return -1;
  return 1 + Math.max(left, right);
};`
      },
      diagram: `      1          (BF at 1: +1)
     / \\
    2   3        (BF at 2: +1)
   /
  4`
    },
    {
      id: 10,
      category: "Tree Types",
      title: "AVL Tree",
      definitions: [
        { label: "AVL Tree", text: "A Self-Balancing Binary Search Tree (BST) where the balance factor of every node is kept within {-1, 0, 1} using auto-rotations." }
      ],
      identification: {
        theory: "Must satisfy BST property (Left < Root < Right) AND Height-Balanced property at all nodes.",
        code: "balanceFactor = getHeight(node.left) - getHeight(node.right); Math.abs(balanceFactor) <= 1"
      },
      diagram: `      30   (BF: 0)
     /  \\
   20    40 (BF: 0)`
    },
    {
      id: 11,
      category: "Tree Types",
      title: "Degenerate (Pathological) Tree",
      definitions: [
        { label: "Degenerate Tree", text: "Every parent node has ONLY ONE child. Behaves performance-wise like a single linked list." }
      ],
      identification: {
        theory: "Every internal node has degree 1.",
        code: "Height = N - 1 for N nodes."
      },
      diagram: `   1           1
    \\         /
     2   OR  2
      \\     /
       3   3`
    },
    {
      id: 12,
      category: "Tree Types",
      title: "Skewed Trees (Left-Skewed & Right-Skewed)",
      definitions: [
        { label: "Left-Skewed", text: "A degenerate tree where ALL nodes have ONLY left children." },
        { label: "Right-Skewed", text: "A degenerate tree where ALL nodes have ONLY right children." }
      ],
      identification: {
        theory: "Tree leans completely to one side.",
        code: "Left-Skewed: node.right === null for all nodes\nRight-Skewed: node.left === null for all nodes"
      },
      diagram: `Left-Skewed:       Right-Skewed:
     3                   1
    /                     \\
   2                       2
  /                         \\
 1                           3`
    }
  ]
};

export default function BhaiAndCoKnowledgeHub() {
  const [selectedTopic, setSelectedTopic] = useState("Binary Trees");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const topicCards = useMemo(() => FLASHCARD_DATABASE[selectedTopic] || [], [selectedTopic]);

  // Dynamic list of categories for the selected topic
  const categories = useMemo(() => {
    const set = new Set(topicCards.map((c) => c.category));
    return ["All", ...Array.from(set)];
  }, [topicCards]);

  const filteredCards = useMemo(() => {
    if (categoryFilter === "All") return topicCards;
    return topicCards.filter((card) => card.category === categoryFilter);
  }, [topicCards, categoryFilter]);

  const card = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setCategoryFilter("All");
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>BhaiAndCo Knowledge Hub</h1>
        <p style={styles.subtitle}>
          Master CS concepts, structural terminology, and identification logic
        </p>
      </header>

      {/* TOPIC SELECTOR & CATEGORY FILTERS */}
      <div style={styles.selectionBar}>
        <div style={styles.topicDropdownGroup}>
          <label style={styles.dropdownLabel}>Topic:</label>
          <select value={selectedTopic} onChange={handleTopicChange} style={styles.topicSelect}>
            {Object.keys(FLASHCARD_DATABASE).map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterContainer}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                ...styles.filterBtn,
                ...(categoryFilter === cat ? styles.filterBtnActive : {}),
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FLASHCARD COMPONENT */}
      {card && (
        <div style={styles.cardContainer}>
          <div
            style={{
              ...styles.card,
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front Side */}
            <div style={styles.cardFront}>
              <div style={styles.cardBadge}>{card.category}</div>
              <h2 style={styles.cardTitle}>{card.title}</h2>
              <div style={styles.definitionsBox}>
                {card.definitions.map((def, idx) => (
                  <div key={idx} style={styles.defItem}>
                    <strong style={styles.defLabel}>{def.label}:</strong> {def.text}
                  </div>
                ))}
              </div>
              <p style={styles.flipHint}>Click card to view Diagram & Identification Code 🔄</p>
            </div>

            {/* Back Side */}
            <div style={styles.cardBack}>
              <div style={styles.cardBadge}>Identification & Structure</div>
              <h3 style={styles.backSectionTitle}>Structural Diagram</h3>
              <pre style={styles.diagramPre}>{card.diagram}</pre>

              <h3 style={styles.backSectionTitle}>How to Identify</h3>
              <p style={styles.identText}>
                <strong>Theory:</strong> {card.identification.theory}
              </p>
              <pre style={styles.codePre}>{card.identification.code}</pre>

              <p style={styles.flipHint}>Click card to return to definitions 🔄</p>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION CONTROLS */}
      <div style={styles.controls}>
        <button onClick={handlePrev} style={styles.navBtn}>
          ← Previous
        </button>
        <span style={styles.counter}>
          {currentIndex + 1} / {filteredCards.length}
        </span>
        <button onClick={handleNext} style={styles.navBtn}>
          Next →
        </button>
      </div>
    </div>
  );
}

// Inline CSS Styles
const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "16px",
  },
  title: {
    fontSize: "2rem",
    margin: "0 0 8px 0",
    color: "#38bdf8",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#94a3b8",
    margin: 0,
  },
  selectionBar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  topicDropdownGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dropdownLabel: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  topicSelect: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    border: "1px solid #0284c7",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    outline: "none",
    cursor: "pointer",
  },
  filterContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
  },
  filterBtn: {
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
    padding: "6px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.85rem",
    transition: "all 0.2s ease",
  },
  filterBtnActive: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    borderColor: "#38bdf8",
  },
  cardContainer: {
    width: "100%",
    maxWidth: "550px",
    height: "420px",
    perspective: "1000px",
    cursor: "pointer",
  },
  card: {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
  },
  cardFront: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
  },
  cardBack: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    backgroundColor: "#0f172a",
    border: "1px solid #0284c7",
    borderRadius: "16px",
    padding: "24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    transform: "rotateY(180deg)",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
    overflowY: "auto",
  },
  cardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    color: "#38bdf8",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    padding: "4px 8px",
    borderRadius: "6px",
    marginBottom: "12px",
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "1.4rem",
    color: "#f1f5f9",
  },
  definitionsBox: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
  },
  defItem: {
    fontSize: "0.95rem",
    lineHeight: "1.4",
    color: "#cbd5e1",
  },
  defLabel: {
    color: "#38bdf8",
  },
  backSectionTitle: {
    fontSize: "0.9rem",
    textTransform: "uppercase",
    color: "#38bdf8",
    margin: "8px 0 4px 0",
  },
  diagramPre: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    padding: "10px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    margin: "0 0 8px 0",
    border: "1px solid #334155",
    lineHeight: "1.2",
    overflowX: "auto",
  },
  identText: {
    fontSize: "0.85rem",
    color: "#cbd5e1",
    margin: "0 0 6px 0",
  },
  codePre: {
    backgroundColor: "#1e293b",
    color: "#a7f3d0",
    padding: "8px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "0.8rem",
    margin: "0 0 8px 0",
    border: "1px solid #334155",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  flipHint: {
    marginTop: "auto",
    fontSize: "0.75rem",
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginTop: "20px",
  },
  navBtn: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  counter: {
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
};