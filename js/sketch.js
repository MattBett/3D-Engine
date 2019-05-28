// TODO Implement a movable camera

let objects = [];

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
  let videoship = new Mesh();
  videoship.setLightning(light);

  //fetch('resources/Cube.obj')
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
  
      if((id === 'v') || (id === 'f')) {
        points = [ row[1], row[2], row[3]];
      }
      
      parsedData.push({id, points});
    });

    for(let edge of buildObj(parsedData)) {
      videoship.add(edge);
    }

    objects.push(videoship);
  })
  .catch(error => {
    console.log('Error! :(');
    console.error(error);
  });
}

function draw() {
  translate(0, height);
  scale(1, -1);
  background(0);

  Mesh.display(objects);
}