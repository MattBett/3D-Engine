let mesh;
let light;

async function loadObj(path) {
  const response = await fetch(path);
  const data = await response.text();
  const lines = data.split('\n').slice(2);

  lines.forEach(line => {
    const row = line.split(' ');
    let points = [];

    const id = row[0];

    if(id != 's') {
      points = [ row[1], row[2], row[3]];
    }

    console.log(id, points);
    console.log(lines[0]);
  });

  return lines;
}

function setup() {
  createCanvas(800, 800);

  let object = loadObj('resources/VideoShip.obj').catch(error => {
    console.log('error !');
    console.error(error);
  });

  console.log(object);

  let a = new Vertex(0, 0, 0);
  let b = new Vertex(0, 1, 0);
  let c = new Vertex(1, 1, 0);
  let d = new Vertex(1, 0, 0);
  let e = new Vertex(0, 0, 1);
  let f = new Vertex(0, 1, 1);
  let g = new Vertex(1, 1, 1);
  let h = new Vertex(1, 0, 1);

  mesh = new Mesh();

  // ? SOUTH
  mesh.add(new Edge(a, b, c));
  mesh.add(new Edge(a, c, d));

  // ? EAST
  mesh.add(new Edge(d, c, g));
  mesh.add(new Edge(d, g, h));

  // ? NORTH
  mesh.add(new Edge(h, g, f));
  mesh.add(new Edge(h, f, e));

  // ? WEST
  mesh.add(new Edge(e, f, b));
  mesh.add(new Edge(e, b, a));

  // ? TOP
  mesh.add(new Edge(b, f, g));
  mesh.add(new Edge(b, g, c));

  // ? BOTTOM
  mesh.add(new Edge(e, a, d));
  mesh.add(new Edge(e, d, h));
}

function draw() {
  translate(0, height);
  scale(1, -1);
  background(0);

  light = createVector(-1, 0, -1);
  mesh.show(light);

}