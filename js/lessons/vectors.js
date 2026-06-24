// 课程 1：向量基础 —— 拖动向量，理解分量、模长、夹角
import { CartesianPlane } from '../plane.js';

export const meta = {
  id: 'vectors',
  title: '向量基础',
  subtitle: '拖动箭头，感受分量、模长与方向',
};

export function mount(root) {
  root.innerHTML = `
    <div class="lesson-grid">
      <div class="canvas-wrap"><canvas id="cv"></canvas></div>
      <aside class="panel">
        <h3>向量是什么</h3>
        <p>向量既有<strong>大小</strong>又有<strong>方向</strong>。在平面上，它由一对坐标
        <code>(x, y)</code> 决定——表示从原点出发，向右 x、向上 y 走到的箭头终点。</p>
        <p class="tip">拖动平面上的蓝色圆点试试。</p>
        <div class="readout">
          <div><span>坐标</span><b id="r-xy">(3, 2)</b></div>
          <div><span>模长 ‖v‖</span><b id="r-len">3.61</b></div>
          <div><span>方向角</span><b id="r-ang">33.7°</b></div>
        </div>
        <p class="formula">‖v‖ = √(x² + y²)</p>
      </aside>
    </div>`;

  const plane = new CartesianPlane(document.getElementById('cv'), { unit: 50 });
  let v = [3, 2];

  const h = plane.addHandle(v[0], v[1], '#5cc8ff', (x, y) => {
    v = [Math.round(x * 2) / 2, Math.round(y * 2) / 2];   // 吸附到 0.5 网格
    h.x = v[0]; h.y = v[1];
    update();
  });

  plane.onRender((p) => {
    // 分量虚线
    p.line(0, 0, v[0], 0, 'rgba(255,170,90,0.7)', 2, [6, 5]);
    p.line(v[0], 0, v[0], v[1], 'rgba(120,230,160,0.7)', 2, [6, 5]);
    p.vector(v[0], v[1], '#5cc8ff', { label: 'v', width: 3 });
  });

  function update() {
    const len = Math.hypot(v[0], v[1]);
    const ang = (Math.atan2(v[1], v[0]) * 180 / Math.PI);
    document.getElementById('r-xy').textContent = `(${v[0]}, ${v[1]})`;
    document.getElementById('r-len').textContent = len.toFixed(2);
    document.getElementById('r-ang').textContent = ang.toFixed(1) + '°';
    plane.render();
  }
  update();
}
