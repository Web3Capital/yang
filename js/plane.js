// plane.js — 一个轻量的二维笛卡尔坐标平面绘制引擎
// 负责：世界坐标 <-> 屏幕像素 的转换、网格/坐标轴绘制、向量/点/多边形绘制、可拖拽控制点
// 所有课程演示都复用这个类。

export class CartesianPlane {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} opts  { unit: 每个单位对应的像素, showGrid, showAxes }
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.unit = opts.unit || 40;          // 1 个单位 = 多少像素
    this.showGrid = opts.showGrid !== false;
    this.showAxes = opts.showAxes !== false;
    this.bg = opts.bg || '#0f1420';
    this.gridColor = opts.gridColor || 'rgba(120,140,180,0.16)';
    this.axisColor = opts.axisColor || 'rgba(200,215,245,0.55)';

    this.handles = [];      // 可拖拽控制点 { x, y, r, color, onDrag }
    this._dragging = null;
    this._drawFns = [];     // 注册的绘制回调，每帧依次调用

    this._bindEvents();
    this.resize();
    window.addEventListener('resize', () => { this.resize(); this.render(); });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 原点放在画布中心
    this.ox = this.w / 2;
    this.oy = this.h / 2;
  }

  // 世界坐标 -> 屏幕像素（注意 y 轴翻转）
  toScreen(x, y) {
    return [this.ox + x * this.unit, this.oy - y * this.unit];
  }
  // 屏幕像素 -> 世界坐标
  toWorld(px, py) {
    return [(px - this.ox) / this.unit, (this.oy - py) / this.unit];
  }

  clear() {
    const { ctx } = this;
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  drawGrid() {
    if (!this.showGrid) return;
    const { ctx } = this;
    const maxX = Math.ceil(this.ox / this.unit);
    const maxY = Math.ceil(this.oy / this.unit);
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.gridColor;
    ctx.beginPath();
    for (let i = -maxX; i <= maxX; i++) {
      const [sx] = this.toScreen(i, 0);
      ctx.moveTo(sx, 0); ctx.lineTo(sx, this.h);
    }
    for (let j = -maxY; j <= maxY; j++) {
      const [, sy] = this.toScreen(0, j);
      ctx.moveTo(0, sy); ctx.lineTo(this.w, sy);
    }
    ctx.stroke();
  }

  drawAxes() {
    if (!this.showAxes) return;
    const { ctx } = this;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = this.axisColor;
    ctx.beginPath();
    ctx.moveTo(0, this.oy); ctx.lineTo(this.w, this.oy);
    ctx.moveTo(this.ox, 0); ctx.lineTo(this.ox, this.h);
    ctx.stroke();
    // 刻度数字
    ctx.fillStyle = 'rgba(200,215,245,0.5)';
    ctx.font = '11px ui-monospace, monospace';
    const maxX = Math.floor(this.ox / this.unit);
    const maxY = Math.floor(this.oy / this.unit);
    ctx.textAlign = 'center';
    for (let i = -maxX; i <= maxX; i++) {
      if (i === 0) continue;
      const [sx, sy] = this.toScreen(i, 0);
      ctx.fillText(String(i), sx, sy + 14);
    }
    ctx.textAlign = 'right';
    for (let j = -maxY; j <= maxY; j++) {
      if (j === 0) continue;
      const [sx, sy] = this.toScreen(0, j);
      ctx.fillText(String(j), sx - 6, sy + 4);
    }
  }

  /** 画一条线段（世界坐标） */
  line(x1, y1, x2, y2, color = '#888', width = 1.5, dash = null) {
    const { ctx } = this;
    const [a, b] = this.toScreen(x1, y1);
    const [c, d] = this.toScreen(x2, y2);
    ctx.save();
    if (dash) ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a, b); ctx.lineTo(c, d);
    ctx.stroke();
    ctx.restore();
  }

  /** 画一个向量（从原点或指定起点出发的箭头） */
  vector(x, y, color = '#5cc8ff', opts = {}) {
    const ox = opts.from ? opts.from[0] : 0;
    const oy = opts.from ? opts.from[1] : 0;
    const { ctx } = this;
    const [a, b] = this.toScreen(ox, oy);
    const [c, d] = this.toScreen(x, y);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = opts.width || 3;
    ctx.beginPath();
    ctx.moveTo(a, b); ctx.lineTo(c, d);
    ctx.stroke();
    // 箭头
    const ang = Math.atan2(d - b, c - a);
    const head = opts.head || 11;
    ctx.beginPath();
    ctx.moveTo(c, d);
    ctx.lineTo(c - head * Math.cos(ang - 0.4), d - head * Math.sin(ang - 0.4));
    ctx.lineTo(c - head * Math.cos(ang + 0.4), d - head * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
    if (opts.label) {
      ctx.fillStyle = opts.labelColor || color;
      ctx.font = '600 14px ui-sans-serif, system-ui';
      ctx.fillText(opts.label, c + 8, d - 8);
    }
    ctx.restore();
  }

  /** 画一个点 */
  point(x, y, color = '#fff', r = 4) {
    const { ctx } = this;
    const [a, b] = this.toScreen(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(a, b, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /** 画一个填充多边形（世界坐标点数组），用于单位正方形/平行四边形 */
  polygon(pts, fill = 'rgba(92,200,255,0.15)', stroke = null) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    pts.forEach((p, i) => {
      const [a, b] = this.toScreen(p[0], p[1]);
      i === 0 ? ctx.moveTo(a, b) : ctx.lineTo(a, b);
    });
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.restore();
  }

  /** 注册一个可拖拽控制点。onDrag(x,y) 在拖动时被调用 */
  addHandle(x, y, color, onDrag) {
    const handle = { x, y, r: 9, color, onDrag };
    this.handles.push(handle);
    return handle;
  }
  drawHandles() {
    const { ctx } = this;
    for (const h of this.handles) {
      const [a, b] = this.toScreen(h.x, h.y);
      ctx.save();
      ctx.fillStyle = h.color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(a, b, h.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.stroke();
      ctx.restore();
    }
  }

  _bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return [t.clientX - rect.left, t.clientY - rect.top];
    };
    const down = (e) => {
      const [px, py] = getPos(e);
      for (const h of this.handles) {
        const [a, b] = this.toScreen(h.x, h.y);
        if (Math.hypot(px - a, py - b) <= h.r + 8) {
          this._dragging = h;
          e.preventDefault();
          break;
        }
      }
    };
    const move = (e) => {
      if (!this._dragging) return;
      const [px, py] = getPos(e);
      const [wx, wy] = this.toWorld(px, py);
      this._dragging.x = wx;
      this._dragging.y = wy;
      this._dragging.onDrag(wx, wy);
      e.preventDefault();
      this.render();
    };
    const up = () => { this._dragging = null; };
    this.canvas.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    this.canvas.addEventListener('touchstart', down, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  }

  /** 注册每帧绘制内容 */
  onRender(fn) { this._drawFns.push(fn); }

  render() {
    this.clear();
    this.drawGrid();
    this.drawAxes();
    for (const fn of this._drawFns) fn(this);
    this.drawHandles();
  }
}

/** 把一个 2x2 矩阵 [[a,b],[c,d]] 作用在向量上 */
export function matVec(m, v) {
  return [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
}
export function det(m) { return m[0][0] * m[1][1] - m[0][1] * m[1][0]; }

/** 2x2 实特征值/特征向量（用于演示，返回实特征对） */
export function eigen2(m) {
  const a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1];
  const tr = a + d, dt = a * d - b * c;
  const disc = tr * tr - 4 * dt;
  if (disc < -1e-9) return [];           // 复特征值，不在实平面演示
  const s = Math.sqrt(Math.max(0, disc));
  const l1 = (tr + s) / 2, l2 = (tr - s) / 2;
  const vecFor = (l) => {
    // 求 (M - λI) v = 0 的非零解
    let vx, vy;
    if (Math.abs(b) > 1e-9) { vx = b; vy = l - a; }
    else if (Math.abs(c) > 1e-9) { vx = l - d; vy = c; }
    else { vx = 1; vy = 0; }             // 已是对角阵
    const n = Math.hypot(vx, vy) || 1;
    return [vx / n, vy / n];
  };
  return [{ value: l1, vec: vecFor(l1) }, { value: l2, vec: vecFor(l2) }];
}
