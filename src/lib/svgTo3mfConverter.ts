import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
// @ts-ignore
import { exportTo3MF } from 'three-3mf-exporter'; 

export interface TextureConfig {
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
}

export async function exportSvgTo3mf(
  svgString: string,
  config: Export3mfConfig
): Promise<void> {
  const {
    baseLayerId,
    baseDepth,
    itemDepth,
    filename = 'exported-model.3mf',
    groupName = 'Export_Project'
  } = config;

  const exportGroup = new THREE.Group();
  exportGroup.name = groupName;
  
  const loader = new SVGLoader();
  const svgData = loader.parse(svgString);

  svgData.paths.forEach((path, index) => {
    const fillColor = path.userData?.style?.fill;
    // 如果没有颜色或为纯黑/纯白线稿，赋予基础色，否则使用图腾色
    const color = fillColor ? new THREE.Color().setStyle(fillColor) : new THREE.Color(0xFFFFFF);
    
    // 强制声明材质，供 Bambu Studio 识别色盘
    const material = new THREE.MeshStandardMaterial({ color: color });
    const shapes = SVGLoader.createShapes(path);

    shapes.forEach((shape) => {
      // Paper.js 导出的 item.name 会映射为 SVG path 节点的 id
      const svgNodeId = (path.userData as any)?.node?.id;

      // 精确匹配 ID，同时保留 index === 0 作为极端情况下的安全兜底 (Fallback)
      const isBasePlate = svgNodeId === baseLayerId || index === 0;


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


      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth,
        bevelEnabled: false, 
      });
      
      geometry.scale(1, -1, 1); // 翻转 2D 到 3D 的坐标系

      const mesh = new THREE.Mesh(geometry, material);
      
      // 核心修复：Z 轴层级分离形成浮雕！
      // 底板从 Z=0 开始，厚度 2。图腾从 Z=2 开始，厚度 3。避免重叠导致的颜色丢失。
      if (!isBasePlate) {
          mesh.position.z = baseDepth; 
      }

      // 居中偏移优化
      geometry.computeBoundingBox();
      if (geometry.boundingBox && isBasePlate) {
        const centerOffset = new THREE.Vector3();
        geometry.boundingBox.getCenter(centerOffset);
        exportGroup.position.set(-centerOffset.x, -centerOffset.y, 0);
      }

      mesh.name = isBasePlate ? baseLayerId : `Item_${index}`;
      exportGroup.add(mesh);
    });
  });

  try {
    const blob = await exportTo3MF(exportGroup, { printer_name: 'Bambu Lab' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("3MF 构建失败:", error);
    throw error;
  }
}
