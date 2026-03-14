const fs = require('fs');

let code = fs.readFileSync('src/app/course/l1/tang-sancai/components/SancaiCanvas.tsx', 'utf8');

// We need to wrap the parts and drips in a group named 'Sancai_Glaze_Texture'
code = code.replace(
  /const svgString = paper\.project\.exportSVG\(\{ asString: true \}\) as string;/,
  `
      // Wrap all colored items in a texture group
      const textureGroup = new paper.Group({ name: 'Sancai_Glaze_Texture' });
      partsRef.current.forEach(part => textureGroup.addChild(part));
      dripsRef.current.forEach(drip => textureGroup.addChild(drip));

      const svgString = paper.project.exportSVG({ asString: true }) as string;

      // Unwrap them after export
      partsRef.current.forEach(part => paper.project.activeLayer.addChild(part));
      dripsRef.current.forEach(drip => paper.project.activeLayer.addChild(drip));
      textureGroup.remove();
  `
);

fs.writeFileSync('src/app/course/l1/tang-sancai/components/SancaiCanvas.tsx', code);
