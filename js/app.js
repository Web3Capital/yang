// app.js — 简单的哈希路由，把各课程挂载到主区域
import * as vectors from './lessons/vectors.js';
import * as addition from './lessons/addition.js';
import * as combination from './lessons/combination.js';
import * as transform from './lessons/transform.js';
import * as eigen from './lessons/eigen.js';

const lessons = [vectors, addition, combination, transform, eigen];
const byId = Object.fromEntries(lessons.map(l => [l.meta.id, l]));

const nav = document.getElementById('nav');
const main = document.getElementById('main');

// 构建侧边导航
lessons.forEach((l, i) => {
  const a = document.createElement('a');
  a.href = '#' + l.meta.id;
  a.className = 'nav-item';
  a.innerHTML = `<span class="nav-num">${i + 1}</span>
    <span><b>${l.meta.title}</b><small>${l.meta.subtitle}</small></span>`;
  a.dataset.id = l.meta.id;
  nav.appendChild(a);
});

function route() {
  const id = location.hash.slice(1) || lessons[0].meta.id;
  const lesson = byId[id] || lessons[0];
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.id === lesson.meta.id));
  main.innerHTML = '';
  const head = document.createElement('header');
  head.className = 'lesson-head';
  head.innerHTML = `<h2>${lesson.meta.title}</h2><p>${lesson.meta.subtitle}</p>`;
  main.appendChild(head);
  const body = document.createElement('div');
  main.appendChild(body);
  lesson.mount(body);
}

window.addEventListener('hashchange', route);
route();
