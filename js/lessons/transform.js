// 课程 4：矩阵即变换 —— 一个 2x2 矩阵如何把整个平面网格扭曲，行列式 = 面积缩放
import { CartesianPlane, det } from '../plane.js';

export const meta = {
  id: 'transform',
  title: '矩阵即变换',
  subtitle: '看一个 2×2 矩阵如何扭曲整个空间',
};

export function mount(root) {
  root.innerHTML = `
    <div class="lesson-grid">
      <div class="canvas-wrap"><canvas id="cv"></canvas></div>
      <aside class="panel">
        <h3>列向量决定一切</h3>
        <p>矩阵 <code>[[a, b], [c, d]]</code> 的两列，正是基向量
        <strong style="color:#5cc8ff">î</strong>、<strong style="color:#7ee6a0">ĵ</strong>
        变换后的落点。整个网格随之线性扭曲。</p>
        <div class="matrix-input">
          <div class="mrow"><input id="m00" value="1"><input id="m01" value="0"></div>
          <div class="mrow"><input id="m10" value="0"><input id="m11" value="1"></div>
        </div>
        <div class="btn-row">
          <button data-preset="1,0,0,1">单位</button>
          <button data-preset="0,-1,1,0">旋转90°</button>
          <button data-preset="2,0,0,1">水平拉伸</button>
          <button data-preset="1,1,0,1">剪切</button>
          <button data-preset="1,0,0,-1">翻转</button>
        </div>
        <button id="play" class="play-btn">▶ 播放变换动画</button>
        <div class="readout">
          <div><span>行列式 det</span><b id="r-det">1.00</b></div>
          <div><span>面积缩放</span><b id="r-area">×1.00</b></div>
        </div>
        <p class="tip">行列式为负 = 空间被翻转；为 0 = 被压扁到一条线。</p>
      </aside>
    </div>`;

  const plane = new CartesianPlane(document.getElementById('cv'), { unit: 45, showGrid: false });
  let M = [[1, 0], [0, 1]];
  let t = 1;            // 动画插值 0->1（从单位阵到 M）

  const ids = ['m00', 'm01', 'm10', 'm11'];
  const readM = () => {
    M = [[+document.getElementById('m00').value || 0, +document.getElementById('m01').value || 0],
         [+document.getElementById('m10').value || 0, +document.getElementById('m11').value || 0]];
  };

  // 当前插值矩阵（单位阵 -> M）
  const curM = () => {
    const I = [[1, 0], [0, 1]];
    return [[I[0][0] + (M[0][0] - 1) * t, I[0][1] + M[0][1] * t],
            [I[1][0] + M[1][0] * t, I[1][1] + (M[1][1] - 1) * t]];
  };
  const apply = (m, x, y) => [m[0][0] * x + m[0][1] * y, m[1][0] * x + m[1][1] * y];

  plane.onRender((p) => {
    const m = curM();
    const N = 8;
    // 变换后的网格线
    for (let i = -N; i <= N; i++) {
      const c = i === 0 ? 'rgba(150,170,210,0.5)' : 'rgba(120,140,180,0.22)';
      // 竖线 x=i
      let a1 = apply(m, i, -N), b1 = apply(m, i, N);
      p.line(a1[0], a1[1], b1[0], b1[1], c, i === 0 ? 1.8 : 1);
      // 横线 y=i
      let a2 = apply(m, -N, i), b2 = apply(m, N, i);
      p.line(a2[0], a2[1], b2[0], b2[1], c, i === 0 ? 1.8 : 1);
    }
    // 变换后的单位正方形（面积 = |det|）
    const sq = [[0, 0], [1, 0], [1, 1], [0, 1]].map(pt => apply(m, pt[0], pt[1]));
    p.polygon(sq, det(m) >= 0 ? 'rgba(255,210,120,0.18)' : 'rgba(255,120,120,0.20)');
    // 基向量
    const i = apply(m, 1, 0), j = apply(m, 0, 1);
    p.vector(i[0], i[1], '#5cc8ff', { label: 'î' });
    p.vector(j[0], j[1], '#7ee6a0', { label: 'ĵ' });
  });

  function update() {
    readM();
    const d = det(M);
    document.getElementById('r-det').textContent = d.toFixed(2);
    document.getElementById('r-area').textContent = '×' + Math.abs(d).toFixed(2);
    plane.render();
  }

  ids.forEach(id => document.getElementById(id).addEventListener('input', () => { t = 1; update(); }));
  root.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [a, b, c, d] = btn.dataset.preset.split(',');
      document.getElementById('m00').value = a; document.getElementById('m01').value = b;
      document.getElementById('m10').value = c; document.getElementById('m11').value = d;
      animate();
    });
  });
  document.getElementById('play').addEventListener('click', animate);

  let raf = null;
  function animate() {
    readM();
    cancelAnimationFrame(raf);
    let start = null;
    const dur = 900;
    const step = (ts) => {
      if (start === null) start = ts;
      const k = Math.min(1, (ts - start) / dur);
      t = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;  // easeInOut
      update();
      if (k < 1) raf = requestAnimationFrame(step);
      else { t = 1; update(); }
    };
    t = 0;
    raf = requestAnimationFrame(step);
  }

  update();
}
