// 课程 5：特征向量 —— 哪些方向在变换后只被拉伸、不改变方向
import { CartesianPlane, matVec, det, eigen2 } from '../plane.js';

export const meta = {
  id: 'eigen',
  title: '特征向量与特征值',
  subtitle: '寻找变换中「方向不变」的特殊方向',
};

export function mount(root) {
  root.innerHTML = `
    <div class="lesson-grid">
      <div class="canvas-wrap"><canvas id="cv"></canvas></div>
      <aside class="panel">
        <h3>方向不变的向量</h3>
        <p>变换会让大多数向量同时<strong>改变方向和长度</strong>。但某些特殊方向上的向量
        只会被<strong>拉伸或压缩</strong>，方向保持在原直线上——它们就是<strong>特征向量</strong>，
        拉伸倍数就是对应的<strong>特征值 λ</strong>。</p>
        <div class="matrix-input">
          <div class="mrow"><input id="m00" value="2"><input id="m01" value="1"></div>
          <div class="mrow"><input id="m10" value="1"><input id="m11" value="2"></div>
        </div>
        <div class="btn-row">
          <button data-preset="2,1,1,2">对称</button>
          <button data-preset="2,0,0,3">对角</button>
          <button data-preset="1,1,0,1">剪切</button>
          <button data-preset="0,-1,1,0">旋转(无实特征)</button>
        </div>
        <p class="tip">拖动白点旋转测试向量。当蓝箭头与黄色虚线<strong>重合</strong>时，
        变换后（橙色）与原向量共线——你找到特征方向了。</p>
        <div class="readout" id="eig-out"></div>
      </aside>
    </div>`;

  const plane = new CartesianPlane(document.getElementById('cv'), { unit: 42 });
  let M = [[2, 1], [1, 2]];
  let ang = 0.6;        // 测试向量角度

  const readM = () => {
    M = [[+document.getElementById('m00').value || 0, +document.getElementById('m01').value || 0],
         [+document.getElementById('m10').value || 0, +document.getElementById('m11').value || 0]];
  };

  const tip = [Math.cos(ang) * 3, Math.sin(ang) * 3];
  const h = plane.addHandle(tip[0], tip[1], '#fff', (x, y) => {
    ang = Math.atan2(y, x);
    h.x = Math.cos(ang) * 3; h.y = Math.sin(ang) * 3;
    update();
  });

  plane.onRender((p) => {
    const eigs = eigen2(M);
    // 特征方向：黄色长虚线
    for (const e of eigs) {
      const v = e.vec;
      p.line(-v[0] * 20, -v[1] * 20, v[0] * 20, v[1] * 20, 'rgba(255,210,120,0.35)', 2, [8, 6]);
    }
    // 测试向量与它的变换
    const tv = [Math.cos(ang) * 3, Math.sin(ang) * 3];
    const Mv = matVec(M, tv);
    p.vector(Mv[0], Mv[1], '#ff9a5c', { label: 'M·v', width: 3 });
    p.vector(tv[0], tv[1], '#5cc8ff', { label: 'v', width: 3 });
  });

  function update() {
    readM();
    const eigs = eigen2(M);
    const out = document.getElementById('eig-out');
    if (!eigs.length) {
      out.innerHTML = '<div><span>实特征值</span><b>无（纯旋转）</b></div>';
    } else {
      out.innerHTML = eigs.map((e, i) =>
        `<div><span>λ${i + 1}</span><b>${e.value.toFixed(2)} ，方向 (${e.vec[0].toFixed(2)}, ${e.vec[1].toFixed(2)})</b></div>`
      ).join('') + `<div><span>det</span><b>${det(M).toFixed(2)}</b></div>`;
    }
    plane.render();
  }

  root.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [a, b, c, d] = btn.dataset.preset.split(',');
      document.getElementById('m00').value = a; document.getElementById('m01').value = b;
      document.getElementById('m10').value = c; document.getElementById('m11').value = d;
      update();
    });
  });
  ['m00', 'm01', 'm10', 'm11'].forEach(id =>
    document.getElementById(id).addEventListener('input', update));
  update();
}
