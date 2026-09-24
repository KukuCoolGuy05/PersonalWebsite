// Sample problems shown until Supabase is connected (and used by supabase/seed.sql).
// They exist to demo the page — delete any you haven't actually solved.
// Problem statements are paraphrased; link out to the original for the full text.

export const SAMPLE_PROBLEMS = [
  {
    id: 'sample-two-sum',
    title: 'Two Sum',
    number: 1,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    solvedOn: '2026-09-02',
    question:
      'Given an integer array `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`.\n\nEach input has exactly one answer, and you can’t use the same element twice.\n\n```\nnums = [2, 7, 11, 15], target = 9  →  [0, 1]\n```',
    insight: 'For each x, the partner you need is target − x — remember what you’ve seen in a hash map so the lookup is O(1).',
    approach:
      'Walk the array once. Before storing `nums[i]`, check whether its complement `target - nums[i]` is already in the map; if it is, return both indices.\n\nChecking **before** inserting is what stops an element from pairing with itself.',
    solutions: [
      {
        label: 'One-pass hash map',
        language: 'java',
        time: 'O(n)',
        space: 'O(n)',
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[] { seen.get(need), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      },
      {
        label: 'Brute force',
        language: 'python',
        time: 'O(n²)',
        space: 'O(1)',
        code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`,
      },
    ],
  },
  {
    id: 'sample-valid-parentheses',
    title: 'Valid Parentheses',
    number: 20,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/valid-parentheses/',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    solvedOn: '2026-08-28',
    question:
      'Given a string `s` made only of the characters `()[]{}`, decide whether it’s valid: every opening bracket must be closed by the same type of bracket, in the correct order.\n\n```\n"()[]{}"  →  true\n"(]"      →  false\n"([)]"    →  false\n```',
    insight: 'The most recent unmatched opener has to close first — that’s exactly LIFO, so use a stack.',
    approach:
      'Push the **expected closer** for every opener. When a closer arrives, it must match the top of the stack. At the end the stack must be empty, or some opener was never closed.',
    solutions: [
      {
        label: 'Stack of expected closers',
        language: 'java',
        time: 'O(n)',
        space: 'O(n)',
        code: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      },
    ],
  },
  {
    id: 'sample-reverse-linked-list',
    title: 'Reverse Linked List',
    number: 206,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/reverse-linked-list/',
    difficulty: 'Easy',
    tags: ['Linked List'],
    solvedOn: '2026-08-21',
    question: 'Given the `head` of a singly linked list, reverse the list and return the new head.\n\n```\n1 → 2 → 3 → 4 → 5  →  5 → 4 → 3 → 2 → 1\n```',
    insight: 'Walk the list once and flip each `next` pointer backwards, tracking prev, curr and next.',
    approach:
      'Save `curr.next` before overwriting it, point `curr.next` at `prev`, then advance both pointers. When `curr` falls off the end, `prev` is the new head.\n\nThe recursive version reverses the rest of the list first, then hooks the current node onto the end.',
    solutions: [
      {
        label: 'Iterative',
        language: 'java',
        time: 'O(n)',
        space: 'O(1)',
        code: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
      },
      {
        label: 'Recursive',
        language: 'python',
        time: 'O(n)',
        space: 'O(n)',
        code: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if head is None or head.next is None:
            return head
        new_head = self.reverseList(head.next)
        head.next.next = head
        head.next = None
        return new_head`,
      },
    ],
  },
  {
    id: 'sample-level-order',
    title: 'Binary Tree Level Order Traversal',
    number: 102,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    difficulty: 'Medium',
    tags: ['Tree', 'Queue'],
    solvedOn: '2026-08-14',
    question:
      'Given the `root` of a binary tree, return its node values **level by level**, left to right.\n\n```\nroot = [3, 9, 20, null, null, 15, 7]  →  [[3], [9, 20], [15, 7]]\n```',
    insight: 'BFS with a queue — snapshot the queue’s size at the start of each level to know where that level ends.',
    approach:
      'Everything in the queue at the start of an iteration belongs to the same level. Pop exactly that many nodes, record their values, and enqueue their children for the next round.',
    solutions: [
      {
        label: 'BFS by level',
        language: 'java',
        time: 'O(n)',
        space: 'O(w) — widest level',
        code: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> levels = new ArrayList<>();
        if (root == null) return levels;
        Queue<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            levels.add(level);
        }
        return levels;
    }
}`,
      },
    ],
  },
  {
    id: 'sample-kth-largest',
    title: 'Kth Largest Element in an Array',
    number: 215,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    difficulty: 'Medium',
    tags: ['Array', 'Heap'],
    solvedOn: '2026-07-30',
    question:
      'Given an integer array `nums` and an integer `k`, return the **k-th largest** element — in sorted order, not the k-th distinct value.\n\n```\nnums = [3, 2, 1, 5, 6, 4], k = 2  →  5\n```',
    insight: 'Keep a min-heap capped at k elements; its root is always the k-th largest seen so far.',
    approach:
      'Push every number; whenever the heap grows past `k`, pop the smallest. Only the `k` largest values survive, and the smallest of those sits at the root.',
    solutions: [
      {
        label: 'Size-k min-heap',
        language: 'java',
        time: 'O(n log k)',
        space: 'O(k)',
        code: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
}`,
      },
    ],
  },
  {
    id: 'sample-number-of-islands',
    title: 'Number of Islands',
    number: 200,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/number-of-islands/',
    difficulty: 'Medium',
    tags: ['Graph', 'Matrix'],
    solvedOn: '2026-07-18',
    question:
      'Given an `m × n` grid of `"1"` (land) and `"0"` (water), count the islands. An island is land connected horizontally or vertically and surrounded by water.',
    insight: 'Treat the grid as a graph: each time you hit unvisited land, flood-fill it and count one island.',
    approach:
      'Scan every cell. On a `"1"`, add one to the count and “sink” the whole island with an iterative DFS, turning its land into water so it’s never counted again. Using an explicit stack avoids Python’s recursion limit on large grids.',
    solutions: [
      {
        label: 'Iterative flood fill',
        language: 'python',
        time: 'O(m·n)',
        space: 'O(m·n)',
        code: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        rows, cols = len(grid), len(grid[0])

        def sink(r: int, c: int) -> None:
            stack = [(r, c)]
            grid[r][c] = "0"
            while stack:
                i, j = stack.pop()
                for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ni, nj = i + di, j + dj
                    if 0 <= ni < rows and 0 <= nj < cols and grid[ni][nj] == "1":
                        grid[ni][nj] = "0"
                        stack.append((ni, nj))

        islands = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    islands += 1
                    sink(r, c)
        return islands`,
      },
    ],
  },
  {
    id: 'sample-implement-trie',
    title: 'Implement Trie (Prefix Tree)',
    number: 208,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
    difficulty: 'Medium',
    tags: ['Trie', 'String'],
    solvedOn: '2026-07-05',
    question:
      'Implement a trie with three operations:\n\n- `insert(word)` — store a word\n- `search(word)` — is this exact word stored?\n- `startsWith(prefix)` — does any stored word begin with this prefix?\n\nAll inputs are lowercase English letters.',
    insight: 'Each node maps a letter to a child and marks whether a word ends there — search and startsWith share one walk.',
    approach:
      'Children live in a 26-slot array indexed by `c - \'a\'`. `insert` creates nodes as it walks; `search` and `startsWith` both walk the string, differing only in whether the final node must be marked as a word end.',
    solutions: [
      {
        label: 'Array-backed nodes',
        language: 'java',
        time: 'O(L) per operation',
        space: 'O(total characters)',
        code: `class Trie {
    private static class Node {
        Node[] next = new Node[26];
        boolean isWord;
    }

    private final Node root = new Node();

    public void insert(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.next[i] == null) node.next[i] = new Node();
            node = node.next[i];
        }
        node.isWord = true;
    }

    public boolean search(String word) {
        Node node = walk(word);
        return node != null && node.isWord;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    private Node walk(String s) {
        Node node = root;
        for (char c : s.toCharArray()) {
            node = node.next[c - 'a'];
            if (node == null) return null;
        }
        return node;
    }
}`,
      },
    ],
  },
  {
    id: 'sample-validate-bst',
    title: 'Validate Binary Search Tree',
    number: 98,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/validate-binary-search-tree/',
    difficulty: 'Medium',
    tags: ['Binary Search Tree', 'Tree'],
    solvedOn: '2026-06-24',
    question:
      'Given the `root` of a binary tree, decide whether it’s a valid binary search tree: every key in a node’s left subtree is smaller than the node’s key, every key in its right subtree is larger, and both subtrees are BSTs too.',
    insight: 'Comparing a node with its parent isn’t enough — pass down the (low, high) window every node must fit inside.',
    approach:
      'Recurse with an open interval. Going left tightens the upper bound to the current value; going right tightens the lower bound. Using `long` bounds keeps nodes equal to `Integer.MIN_VALUE` or `Integer.MAX_VALUE` safe.',
    solutions: [
      {
        label: 'Recursive bounds',
        language: 'java',
        time: 'O(n)',
        space: 'O(h)',
        code: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean valid(TreeNode node, long low, long high) {
        if (node == null) return true;
        if (node.val <= low || node.val >= high) return false;
        return valid(node.left, low, node.val) && valid(node.right, node.val, high);
    }
}`,
      },
    ],
  },
  {
    id: 'sample-merge-k-lists',
    title: 'Merge k Sorted Lists',
    number: 23,
    source: 'LeetCode',
    url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    difficulty: 'Hard',
    tags: ['Linked List', 'Heap'],
    solvedOn: '2026-06-10',
    question:
      'You’re given an array of `k` linked lists, each sorted in ascending order. Merge them into **one** sorted linked list and return it.\n\n```\n[1→4→5, 1→3→4, 2→6]  →  1→1→2→3→4→4→5→6\n```',
    insight: 'Only the current head of each list can be the next-smallest node — keep those k heads in a min-heap.',
    approach:
      'Seed the heap with every non-empty head. Repeatedly pop the smallest node, append it to the result, and push its successor. A dummy head node keeps the append logic branch-free.',
    solutions: [
      {
        label: 'Min-heap of heads',
        language: 'java',
        time: 'O(N log k)',
        space: 'O(k)',
        code: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode head : lists) {
            if (head != null) heap.offer(head);
        }
        ListNode dummy = new ListNode(0), tail = dummy;
        while (!heap.isEmpty()) {
            ListNode node = heap.poll();
            tail.next = node;
            tail = node;
            if (node.next != null) heap.offer(node.next);
        }
        return dummy.next;
    }
}`,
      },
    ],
  },
];
