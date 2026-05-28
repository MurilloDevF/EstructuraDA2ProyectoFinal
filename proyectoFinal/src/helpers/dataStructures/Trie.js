class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.items = []; // List of products/stores that end or contain this prefix
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Inserts a word and maps it to a specific item (e.g. a product object)
  insert(word, item) {
    if (!word || !item) return;
    const cleanWord = word.toLowerCase().trim();
    let current = this.root;

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
    
    // Add item if not already present
    if (!current.items.some(existing => existing.id === item.id)) {
      current.items.push(item);
    }
  }

  // Searches for a prefix and returns all items matching or extending this prefix
  search(prefix) {
    if (!prefix) return [];
    const cleanPrefix = prefix.toLowerCase().trim();
    let current = this.root;

    for (let i = 0; i < cleanPrefix.length; i++) {
      const char = cleanPrefix[i];
      if (!current.children[char]) {
        return []; // Prefix path doesn't exist
      }
      current = current.children[char];
    }

    const results = [];
    const seenIds = new Set();

    // Helper to recursively collect all items in the sub-tree
    const collect = (node) => {
      if (node.isEndOfWord) {
        node.items.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            results.push(item);
          }
        });
      }
      for (const char in node.children) {
        collect(node.children[char]);
      }
    };

    collect(current);
    return results;
  }

  clear() {
    this.root = new TrieNode();
  }
}
