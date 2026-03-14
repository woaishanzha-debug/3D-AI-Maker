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
    isSunken = false
  } = config;

  const exportGroup = new THREE.Group();
  exportGroup.name = groupName;
  
  const loader = new SVGLoader();
  const svgData = loader.parse(svgString);

  if (isSunken) {
    // 阴刻逻辑 (Sunken Relief)
    // 找出底板 path 和所有图腾 paths
    let basePlateShape: THREE.Shape | null = null;
    let baseMaterial: THREE.MeshStandardMaterial | null = null;
    let baseGeometryTransform: THREE.Vector3 | null = null;
    const itemShapes: THREE.Shape[] = [];

    svgData.paths.forEach((path, index) => {
      const svgNodeId = (path.userData as any)?.node?.id;
      const isBasePlate = svgNodeId === baseLayerId || index === 0;
      const shapes = SVGLoader.createShapes(path);

      if (isBasePlate && !basePlateShape && shapes.length > 0) {
        basePlateShape = shapes[0];
        const fillColor = path.userData?.style?.fill;
        const color = fillColor ? new THREE.Color().setStyle(fillColor) : new THREE.Color(0xFFFFFF);
        baseMaterial = new THREE.MeshStandardMaterial({ color: color });
      } else if (!isBasePlate) {
        itemShapes.push(...shapes);
      }
    });

    if (basePlateShape && baseMaterial) {
      // 创建底部实体部分 (e.g. 1mm)
      const solidDepth = baseDepth / 2.0;
      const solidGeometry = new THREE.ExtrudeGeometry(basePlateShape, {
        depth: solidDepth,
        bevelEnabled: false,
      });
      solidGeometry.scale(1, -1, 1);
      const solidMesh = new THREE.Mesh(solidGeometry, baseMaterial);
      solidMesh.name = `${baseLayerId}_Solid`;
      exportGroup.add(solidMesh);

      // 创建顶部带孔的部分 (e.g. 1mm)
      // 深拷贝 shape 以免污染原 shape
      const holeShape = new THREE.Shape().copy(basePlateShape);
      // 把所有图腾作为孔加入底板形状
      itemShapes.forEach(itemShape => {
        // 这里简化处理：假定图腾都是闭合路径，且坐标系一致，直接作为 hole 加入
        const holePath = new THREE.Path();
        holePath.curves = itemShape.curves;
        holeShape.holes.push(holePath);
      });

      const holeDepth = baseDepth - solidDepth;
      const holeGeometry = new THREE.ExtrudeGeometry(holeShape, {
        depth: holeDepth,
        bevelEnabled: false,
      });
      holeGeometry.scale(1, -1, 1);
      const holeMesh = new THREE.Mesh(holeGeometry, baseMaterial);
      holeMesh.position.z = solidDepth; // 放在实体上方
      holeMesh.name = `${baseLayerId}_Hole`;
      exportGroup.add(holeMesh);

      // 居中偏移优化
      solidGeometry.computeBoundingBox();
      if (solidGeometry.boundingBox) {
        const centerOffset = new THREE.Vector3();
        solidGeometry.boundingBox.getCenter(centerOffset);
        exportGroup.position.set(-centerOffset.x, -centerOffset.y, 0);
      }
    }

  } else {
    // 阳刻/默认逻辑 (Relief / Default)
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

        const depth = isBasePlate ? baseDepth : itemDepth;

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
