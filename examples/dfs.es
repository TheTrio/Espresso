let dfs = fn(graph, start) {
  let visited = dict();
  let visit = fn(node) {
    if (visited[node]) {
      return;
    }
    visited[node] = true;
    print(node);
    let neighbors = graph[node];
    let i = 0;
    while (i < len(neighbors)) {
      visit(neighbors[i]);
      i = i + 1;
    }
  };
  visit(start);
};

let graph = {
  "A": ["B", "C"],
  "B": ["D", "E"],
  "C": ["F"],
  "D": [],
  "E": ["F"],
  "F": []
};

dfs(graph, "A");
