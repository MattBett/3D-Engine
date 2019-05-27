let mesh;
let cube;

function buildObj(rawData) {
  let vertices = [];
  let edges = [];
  
  for(let line of rawData) {
    if(line.id === 'v') {
      vertices.push(new Vertex(line.points[0], line.points[1], line.points[2]));
    } else if (line.id === 'f') {
      edges.push(new Edge(vertices[line.points[0] - 1], vertices[line.points[1] - 1], vertices[line.points[2] - 1]));
    
    }    
  }

  console.log('# vertices: ' + vertices.length);
  console.log('# edges: ' + edges.length);
  
  return edges;
}

function setup() {
  createCanvas(800, 800);

  const light = createVector(-1, 0, -1);
  mesh = new Mesh(light);

  fetch('resources/VideoShip.obj')
  .then(response => {
    return response.text();
  })
  .then(data => {
    let parsedData = [];
    let lines = data.split('\n');

    lines.forEach(line => {
      const row = line.split(' ');
      let points = [];
  
  
      const id = row[0];
  
      if((id != 's') && (id != '#')) {
        points = [ row[1], row[2], row[3]];
      }
  
      parsedData.push({id, points});
    });

    let edges = buildObj(parsedData);

    for(let edge of edges) {
      mesh.add(edge);
    }

  });
 
  /*
  let a = new Vertex(0, 0, 0);
  let b = new Vertex(0, 1, 0);
  let c = new Vertex(1, 1, 0);
  let d = new Vertex(1, 0, 0);
  let e = new Vertex(0, 0, 1);
  let f = new Vertex(0, 1, 1);
  let g = new Vertex(1, 1, 1);
  let h = new Vertex(1, 0, 1);

  cube = new Mesh(light);

  // ? SOUTH
  cube.add(new Edge(a, b, c));
  cube.add(new Edge(a, c, d));

  // ? EAST
  cube.add(new Edge(d, c, g));
  cube.add(new Edge(d, g, h));

  // ? NORTH
  cube.add(new Edge(h, g, f));
  cube.add(new Edge(h, f, e));

  // ? WEST
  cube.add(new Edge(e, f, b));
  cube.add(new Edge(e, b, a));

  // ? TOP
  cube.add(new Edge(b, f, g));
  cube.add(new Edge(b, g, c));

  // ? BOTTOM
  cube.add(new Edge(e, a, d));
  cube.add(new Edge(e, d, h));
  */
}

function draw() {
  translate(0, height);
  scale(1, -1);
  background(0);
  //cube.show();
  mesh.show();
}