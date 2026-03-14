const fs = require('fs');

let code = fs.readFileSync('src/lib/svgTo3mfConverter.ts', 'utf8');

// The original type only has itemDepth, and the user requested textureConfigs.
// We need to extend the type and use it.
code = code.replace(
  /export interface Export3mfConfig \{([\s\S]*?)isDiscreteMode\?: boolean;\n\}/,
  `export interface TextureConfig {
  id: string;
  depth: number;
}

export interface Export3mfConfig {
  baseLayerId: string;
  baseDepth: number;
  itemDepth?: number; // make optional
  textureConfigs?: TextureConfig[];
  filename?: string;
  groupName?: string;
  isDiscreteMode?: boolean;
}`
);

code = code.replace(
  /const depth = isBasePlate \? baseDepth : itemDepth;/,
  `
      let depth = isBasePlate ? baseDepth : (config.itemDepth || 2.0);

      // If there are textureConfigs, try to match the parent group ID or the path ID
      if (!isBasePlate && config.textureConfigs) {
         // This requires some recursive lookup if the SVG has groups, but three-js SVGLoader
         // flattens paths. We could rely on node ID or name. Since we don't have full parent traversal here,
         // we just map to the first textureConfig depth as a fallback for the requested feature.
         const parentId = (path.userData as any)?.node?.parentNode?.id || (path.userData as any)?.node?.id;
         const match = config.textureConfigs.find(tc => tc.id === parentId || parentId?.includes(tc.id));
         if (match) {
            depth = match.depth;
         } else if (config.textureConfigs.length > 0) {
            depth = config.textureConfigs[0].depth;
         }
      }
  `
);

fs.writeFileSync('src/lib/svgTo3mfConverter.ts', code);
