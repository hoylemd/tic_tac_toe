function what_time_is_it() {
  return new Date().getTime();
}

function random_int(min, max) {
  min = Math.ceil(min || 0);
  max = Math.floor(max || 100);

  return Math.floor(Math.random() * (max - min)) + min;
}
