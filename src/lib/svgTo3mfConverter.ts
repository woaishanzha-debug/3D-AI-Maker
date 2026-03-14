import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
// @ts-ignore
import { exportTo3MF } from 'three-3mf-exporter'; 

export interface Export3mfConfig {
  baseLayerId: string;
  baseDepth: number;
  itemDepth: number;
  filename?: string;
  groupName?: string;
  isDiscreteMode?: boolean;
  isSunken?: boolean;
  textureConfigs?: { id: string; depth: number }[];
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
    groupName = 'Export_Project',
    isSunken = false,
    textureConfigs = []
  } = config;

  const exportGroup = new THREE.Group();
  exportGroup.name = groupName;
  
  const loader = new SVGLoader();
  const svgData = loader.parse(svgString);

  if (isSunken) {
    // === Sunken Relief Mode ===
    // Creates a solid base, and a top layer extruded above it with 2D items as holes.
    let baseShape: THREE.Shape | null = null;
    let baseMaterial: THREE.MeshStandardMaterial | null = null;
    const itemShapes: THREE.Shape[] = [];

    // First pass: identify base plate and items
    svgData.paths.forEach((path, index) => {
      const svgNodeId = (path.userData as { node?: { id?: string } })?.node?.id;
      const isBasePlate = svgNodeId === baseLayerId || index === 0;
      const shapes = SVGLoader.createShapes(path);

      if (isBasePlate) {
        if (shapes.length > 0) baseShape = shapes[0];
        const fillColor = path.userData?.style?.fill;
        const color = fillColor ? new THREE.Color().setStyle(fillColor) : new THREE.Color(0x000000); // Default base black
        baseMaterial = new THREE.MeshStandardMaterial({ color });
      } else {
        itemShapes.push(...shapes);
      }
    });

    if (baseShape && baseMaterial) {
      // 1. Create solid bottom base layer
      const solidBaseGeometry = new THREE.ExtrudeGeometry(baseShape, {
        depth: baseDepth - itemDepth, // Base thickness minus groove depth
        bevelEnabled: false,
      });
      solidBaseGeometry.scale(1, -1, 1);
      const solidBaseMesh = new THREE.Mesh(solidBaseGeometry, baseMaterial);
      solidBaseMesh.name = `${baseLayerId}_Solid`;
      exportGroup.add(solidBaseMesh);

      // 2. Create top layer with holes
      const topShape = new THREE.Shape().copy(baseShape);
      itemShapes.forEach(shape => {
        topShape.holes.push(shape);
      });
      const topGeometry = new THREE.ExtrudeGeometry(topShape, {
        depth: itemDepth, // The depth of the top layer (groove depth)
        bevelEnabled: false,
      });
      topGeometry.scale(1, -1, 1);
      const topMesh = new THREE.Mesh(topGeometry, baseMaterial);
      topMesh.position.z = baseDepth - itemDepth;
      topMesh.name = `${baseLayerId}_TopWithHoles`;
      exportGroup.add(topMesh);

      // Center offset based on the solid base
      solidBaseGeometry.computeBoundingBox();
      if (solidBaseGeometry.boundingBox) {
        const centerOffset = new THREE.Vector3();
        solidBaseGeometry.boundingBox.getCenter(centerOffset);
        exportGroup.position.set(-centerOffset.x, -centerOffset.y, 0);
      }
    }
  } else {
    // === Standard Emboss Mode ===
    svgData.paths.forEach((path, index) => {
      const fillColor = path.userData?.style?.fill;
      // 如果没有颜色或为纯黑/纯白线稿，赋予基础色，否则使用图腾色
      const color = fillColor ? new THREE.Color().setStyle(fillColor) : new THREE.Color(0xFFFFFF);

      // 强制声明材质，供 Bambu Studio 识别色盘
      const material = new THREE.MeshStandardMaterial({ color: color });
      const shapes = SVGLoader.createShapes(path);

      shapes.forEach((shape) => {
        // Paper.js 导出的 item.name 会映射为 SVG path 节点的 id
        const svgNodeId = (path.userData as { node?: { id?: string } })?.node?.id;

        // 精确匹配 ID，同时保留 index === 0 作为极端情况下的安全兜底 (Fallback)
        const isBasePlate = svgNodeId === baseLayerId || index === 0;

        // Check if there's a custom texture config for this item
        const textureConfig = textureConfigs.find(cfg => cfg.id === svgNodeId);
        const specificItemDepth = textureConfig ? textureConfig.depth : itemDepth;

        const depth = isBasePlate ? baseDepth : specificItemDepth;

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
  }

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
