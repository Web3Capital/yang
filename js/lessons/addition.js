// 课程 2：向量加法 —— 两个可拖拽向量，首尾相接 / 平行四边形法则
import { CartesianPlane } from '../plane.js';

export const meta = {
  id: 'addition',
  title: '向量加法',
  subtitle: '首尾相接，看 v + w 如何形成',
};

export function mount(root) {
  root.innerHTML = `
    <div class="lesson-grid">
      <div class="canvas-wrap"><canvas id="cv"></canvas></div>
      <aside class="panel">
        <h3>把向量加起来</h3>
        <p>两个向量相加，就是<strong>分量分别相加</strong>。几何上：把 w 的尾巴接到 v 的头上，
        从原点指向 w 新终点的箭头就是 <code>v + w</code>。</p>
        <p class="tip">拖动蓝、绿两个圆点。虚线展示了「首尾相接」。</p>
        <div class="readout">
          <div><span>v</span><b id="r-v">(2, 1)</b></div>
          <div><span>w</span><b id="r-w">(1, 2)</b></div>
          <div><span>v + w</span><b id="r-sum">(3, 3)</b></div>
        </div>
        <label class="check"><input type="checkbox" id="para"> 显示平行四边形</label>
      </aside>
    </div>`;

  const plane = new CartesianPlane(document.getElementById('cv'), { unit: 50 });
  let v = [2, 1], w = [1, 2];
  const snap = (n) => Math.round(n * 2) / 2;

  const hv = plane.addHandle(v[0], v[1], '#5cc8ff', (x, y) => { v = [snap(x), snap(y)]; hv.x = v[0]; hv.y = v[1]; update(); });
  const hw = plane.addHandle(w[0], w[1], '#7ee6a0', (x, y) => { w = [snap(x), snap(y)]; hw.x = w[0]; hw.y = w[1]; update(); });

  plane.onRender((p) => {
    const sum = [v[0] + w[0], v[1] + w[1]];
    if (document.getElementById('para')?.checked) {
      p.polygon([[0, 0], v, sum, w], 'rgba(255,210,120,0.12)');
    }
    // w 从 v 的头部出发（首尾相接）
    p.vector(sum[0], sum[1], 'rgba(120,230,160,0.55)', { from: v, width: 2 });
    p.vector(v[0], v[1], '#5cc8ff', { label: 'v' });
    p.vector(w[0], w[1], '#7ee6a0', { label: 'w' });
    p.vector(sum[0], sum[1], '#ffd27a', { label: 'v+w', width: 3.5 });
  });

  function update() {
    const sum = [v[0] + w[0], v[1] + w[1]];
    document.getElementById('r-v').textContent = `(${v[0]}, ${v[1]})`;
    document.getElementById('r-w').textContent = `(${w[0]}, ${w[1]})`;
    document.getElementById('r-sum').textContent = `(${sum[0]}, ${sum[1]})`;
    plane.render();
  }
  document.getElementById('para').addEventListener('change', () => plane.render());
  update();
}
