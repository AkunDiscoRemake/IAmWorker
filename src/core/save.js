// Progresso salvo em localStorage (sem cadastro, sem servidor).
const KEY = 'iamworker.save.v1';

export class Save {
  constructor() {
    this.data = { tutorial: false, coins: 0, jobs: {}, allSeen: false };
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === 'object') {
          this.data.tutorial = !!d.tutorial;
          this.data.coins = d.coins | 0;
          this.data.jobs = d.jobs || {};
          this.data.allSeen = !!d.allSeen;
        }
      }
    } catch (e) { /* armazenamento indisponível: joga sem salvar */ }
  }

  write() {
    try { window.localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignora */ }
  }

  job(id) { return this.data.jobs[id] || { done: false, stars: 0, best: 0 }; }

  // Registra o resultado; devolve as moedas ganhas.
  finishJob(id, stars, seconds) {
    const prev = this.job(id);
    const coins = stars * 50;
    this.data.jobs[id] = {
      done: true,
      stars: Math.max(prev.stars, stars),
      best: prev.best ? Math.min(prev.best, Math.round(seconds)) : Math.round(seconds)
    };
    this.data.coins += coins;
    this.write();
    return coins;
  }

  doneCount() {
    let n = 0;
    for (const k in this.data.jobs) if (this.data.jobs[k].done) n++;
    return n;
  }
}
