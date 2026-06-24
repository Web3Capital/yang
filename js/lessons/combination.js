// 课程 3：线性组合与张成空间 —— 用两个基向量 + 系数滑块到达任意点
import { CartesianPlane } from '../plane.js';

export const meta = {
  id: 'combination',
  title: '线性组合 · 张成空间',
  subtitle: '调节系数 a、b，到达平面上任意位置',
};

export function mount(root) {
  root.innerHTML = `
    <div class="lesson-grid">
      <div class="canvas-wrap"><canvas id="cv"></canvas></div>
      <aside class="panel">
        <h3>a·v + b·w</h3>
        <p>把两个向量各自<strong>伸缩</strong>再相加，得到的就是它们的<strong>线性组合</strong>。
        改变系数能扫过的全部位置，叫做这两个向量的<strong>张成空间（span）</strong>。</p>
        <div class="slider-row"><label>a = <b id="va">1.0</b></label>
          <input type="range" id="a" min="-3" max="3" step="0.1" value="1"></div>
        <div class="slider-row"><label>b = <b id="vb">1.0</b></label>
          <input type="range" id="b" min="-3" max="3" step="0.1" value="1"></div>
        <p class="tip">拖动 v、w 两个圆点改变基向量。当它们<strong>共线</strong>时，张成空间会塌缩成一条直线。</p>
        <div class="readout">
          <div><span>结果点</span><b id="r-pt">(3, 3)</b></div>
          <div><span>张成空间</span><b id="r-span">整个平面</b></div>
        </div>
      </aside>
    </div>`;

  const plane = new CartesianPlane(document.getElementById('cv'), { unit: 45 });
  let v = [2, 1], w = [1, 2], a = 1, b = 1;
  const snap = (n) => Math.round(n * 2) / 2;

  const hv = plane.addHandle(v[0], v[1], '#5cc8ff', (x, y) => { v = [snap(x), snap(y)]; hv.x = v[0]; hv.y = v[1]; update(); });
  const hw = plane.addHandle(w[0], w[1], '#7ee6a0', (x, y) => { w = [snap(x), snap(y)]; hw.x = w[0]; hw.y = w[1]; update(); });

  plane.onRender((p) => {
    const cross = v[0] * w[1] - v[1] * w[0];
    // 张成空间提示：共线 -> 画直线；否则淡淡铺满
    if (Math.abs(cross) < 1e-6) {
      const d = Math.hypot(v[0], v[1]) > 1e-6 ? v : w;
      if (Math.hypot(d[0], d[1]) > 1e-6) {
        p.line(-d[0] * 20, -d[1] * 20, d[0] * 20, d[1] * 20, 'rgba(255,210,120,0.25)', 8);
      }
    }
    const av = [a * v[0], a * v[1]];
    const pt = [a * v[0] + b * w[0], a * v[1] + b * w[1]];
    // 组合路径：先 a·v，再 +b·w
    p.vector(av[0], av[1], 'rgba(92,200,255,0.5)', { width: 2 });
    p.vector(pt[0], pt[1], 'rgba(120,230,160,0.5)', { from: av, width: 2 });
    p.vector(v[0], v[1], '#5cc8ff', { label: 'v' });
    p.vector(w[0], w[1], '#7ee6a0', { label: 'w' });
    p.point(pt[0], pt[1], '#ffd27a', 6);
  });

  function update() {
    a = parseFloat(document.getElementById('a').value);
    b = parseFloat(document.getElementById('b').value);
    document.getElementById('va').textContent = a.toFixed(1);
    document.getElementById('vb').textContent = b.toFixed(1);
    const pt = [a * v[0] + b * w[0], a * v[1] + b * w[1]];
    document.getElementById('r-pt').textContent = `(${pt[0].toFixed(1)}, ${pt[1].toFixed(1)})`;
    const cross = v[0] * w[1] - v[1] * w[0];
    document.getElementById('r-span').textContent =
      Math.abs(cross) < 1e-6 ? '一条直线（线性相关）' : '整个平面';
    plane.render();
  }
  document.getElementById('a').addEventListener('input', update);
  document.getElementById('b').addEventListener('input', update);
  update();
}
