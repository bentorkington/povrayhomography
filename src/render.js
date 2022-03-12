import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const imageSize = 2000;

const testImage = 'https://upload.wikimedia.org/wikipedia/commons/7/73/Mercator_projection_Square.JPG';
const testImageFile = path.basename(testImage);
const localPath = path.join('public', testImageFile);
const DTOR = Math.PI / 180;

// Fetch the test image if it doesn't exist
if (!fs.existsSync(localPath)) {
    console.log('get the file ', localPath);
    fs.ensureDirSync('public');
    const response = await fetch(testImage);
    fs.writeFileSync(localPath, Buffer.from(await response.arrayBuffer()));
}

fs.ensureDirSync('tmp');
fs.ensureDirSync('out');

const poses = fs.readJSONSync('src/poses.json');

for (const pose of poses) {
    if (fs.existsSync(`out/${pose.name}.png`))
        continue;

    const pov = `
#version 3.7;

camera {
    location <${pose.position[0]}, ${pose.position[1]}, ${pose.position[2]}>
    look_at <${pose.lookAt[0]}, ${pose.lookAt[1]}, ${pose.lookAt[2]}>
    right x
    angle 54
    rotate <${pose.rotation[0]}, ${pose.rotation[1]}, ${pose.rotation[2]}>
}

global_settings {
    ambient_light <1, 1, 1> // <red, green, blue}
}

plane { -z, 0 
    pigment {
        image_map {
            jpeg "Mercator_projection_Square.JPG"
            once 
        }
        translate <-0.5, -0.5, 0> // <x, y, z>
    }
    finish {
        ambient 1
    }
}
`;
    fs.writeFileSync(`tmp/${pose.name}.pov`, pov);
    execSync(`povray +Itmp/${pose.name}.pov +W${imageSize} +H${imageSize} +Oout/${pose.name}.png`);
}
