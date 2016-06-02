export function Controller() {
  this.x = 0;
  this.y = 0;
  this.total = 0;

  this.update = () => this.total = this.x + this.y;
}

Controller.$inject = [];
